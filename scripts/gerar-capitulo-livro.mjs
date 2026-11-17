// © 2026 Luiza Nascimento Rosa. Rascunho determinístico com fontes e exercícios reais.
import fs from'node:fs';import path from'node:path';import{pathToFileURL}from'node:url';import{projectEditorialText}from'../src/lib/editorial-segments.ts';import{atomic,sha}from'./ingerir-bibliografia.mjs';
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;const stop=new Set('para como sobre entre quando onde uma umas uns dos das esse essa este esta isso isto pelo pela pelos pelas com sem nao mais sao que por seu sua seus suas pode podem qual quais texto acordo alternativa correta considere assinale'.split(' '));
export function tokens(s){return new Set(s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().match(/[a-z]{4,}/g)?.filter(w=>!stop.has(w))??[]);}
function gerarLegado({livro,capitulo,indice='work/bibliografia/indice.json',destino='content/livros',metadados='src/data/livros-gerados.json'}){if(!slug.test(livro??'')||!slug.test(capitulo??''))throw Error('Informe --livro=<slug> --capitulo=<slug>');const doc=JSON.parse(fs.readFileSync(indice)).documentos.find(d=>d.livro===livro&&d.capitulo===capitulo);if(!doc)throw Error('PDF correspondente não encontrado no índice. Execute a ingestão primeiro.');if(sha(fs.readFileSync(doc.arquivo))!==doc.sha256)throw Error('Fonte alterada após ingestão: SHA-256 divergente.');const catalog=JSON.parse(fs.readFileSync('src/data/catalogo-v2.json')),query=tokens(capitulo+' '+doc.paginas.map(p=>p.texto).join(' ').slice(0,12000)),seen=new Set();const ranked=catalog.questoes.filter(q=>q.tier!=='tier-0-quarentena'&&!q.anulada).map(q=>({q,score:[...tokens(q.tema+' '+q.assunto+' '+q.enunciado)].filter(t=>query.has(t)).length})).filter(r=>r.score>=3).sort((a,b)=>b.score-a.score||a.q.id.localeCompare(b.q.id)).filter(({q})=>{const h=sha(q.enunciado.normalize('NFKC').replace(/\s+/g,' '));if(seen.has(h))return false;seen.add(h);return true;}).slice(0,5);if(ranked.length!==5)throw Error('Não há cinco questões verificadas com correspondência textual suficiente para esse capítulo. Nenhum capítulo foi gravado.');
 const title=capitulo.replaceAll('-',' '),content={status:'rascunho',introducao:'Rascunho de leitura extraído da bibliografia. A revisão editorial deve conferir fórmulas, figuras, direitos de publicação e alinhamento dos exercícios antes da publicação.',disciplina:ranked[0].q.disciplina,secoes:doc.paginas.map(p=>({titulo:'Leitura da fonte · página '+p.pagina,texto:p.texto,segmentos:projectEditorialText(p.texto)})),questoes:ranked.map(r=>r.q.id),fonte:{arquivo:path.basename(doc.arquivo),sha256:doc.sha256,paginas:doc.paginas.length},criterioExercicios:ranked.map(r=>({id:r.q.id,correspondencias:r.score}))};const file=path.join(destino,livro,capitulo+'.json');if(fs.existsSync(file)&&JSON.parse(fs.readFileSync(file)).status==='publicado')throw Error('Capítulo publicado não é sobrescrito automaticamente.');atomic(file,content);const books=fs.existsSync(metadados)?JSON.parse(fs.readFileSync(metadados)):[];let book=books.find(b=>b.slug===livro);if(!book){book={slug:livro,titulo:livro.replaceAll('-',' '),descricao:'Material em preparação editorial.',capitulos:[]};books.push(book);}const old=book.capitulos.find(c=>c.slug===capitulo);if(old)old.titulo=title;else book.capitulos.push({slug:capitulo,titulo:title});atomic(metadados,books);console.log(JSON.stringify({capitulo:file,status:'rascunho',questoes:content.questoes,fonteSha256:doc.sha256}));return content;}
const collection=JSON.parse(fs.readFileSync('src/data/colecao-vestibulinho.json','utf8'));
const FEDERAL=new Set(['etec','ifsp','ifsc','ifrs','ifrn','ifmg','ifba','ifce','ifmt','ifam','ifes','ifpr']);
const permitted=new Set(['CC-BY-4.0','CC-BY-SA-4.0','CC0-1.0','Public-Domain','Ato-Normativo','Autorizacao-Expressa']);
export function validarFonte(doc){
 if(sha(fs.readFileSync(doc.arquivo))!==doc.sha256)throw Error('Fonte alterada após ingestão: SHA-256 divergente.');
 const b=doc.bibliografia;
 if(!b||b.sha256!==doc.sha256||!b.usoComercialAutorizado||!permitted.has(b.licenca)||!b.evidenciaLicenca)throw Error('Fonte sem autorização comercial/licença compatível para adaptação: '+path.basename(doc.arquivo));
 return b;
}
function words(value){return new Set([...tokens(value)].map(t=>t.length>4?t.replace(/s$/,''):t));}
export function selecionarExercicios(chapter,catalog){
 const query=words(chapter.titulo+' '+chapter.topicos.join(' ')+' '+(chapter.termosBusca??[]).join(' ')),seen=new Set();
 return catalog.questoes.filter(q=>FEDERAL.has(q.banca)&&q.tier!=='tier-0-quarentena'&&!q.anulada&&(chapter.disciplinas.includes(q.disciplina)||q.disciplina==='a-classificar')).map(q=>({q,termos:[...words(q.tema+' '+q.assunto+' '+q.enunciado+' '+q.alternativas.map(a=>a.texto).join(' '))].filter(t=>query.has(t))})).filter(r=>r.termos.length>=(r.q.disciplina==='a-classificar'?3:2)).sort((a,b)=>b.termos.length-a.termos.length||a.q.id.localeCompare(b.q.id)).filter(({q})=>{const h=sha(q.enunciado.normalize('NFKC').replace(/\s+/g,' '));if(seen.has(h))return false;seen.add(h);return true;}).slice(0,6);
}
export function disciplinaPrincipal(livro,capitulo){
 if(livro==='portugues-interpretacao-ifs-etec')return 'portugues';
 if(livro==='ciencias-natureza-ifs-etec')return capitulo.startsWith('mecanica-')?'fisica':capitulo.startsWith('materia-')?'quimica':capitulo.startsWith('astronomia-')?'ciencias':'biologia';
 if(livro==='ciencias-humanas-atualidades-etec')return capitulo.startsWith('da-antiguidade-')||capitulo.startsWith('historia-do-brasil-')?'historia':'geografia';
 return 'matematica';
}
export function gerar(args){
 const {livro,capitulo,indice='work/bibliografia/indice.json',destino='content/livros',metadados='src/data/livros-gerados.json',mapa='bibliografia-pdfs/MAPA-FONTES.json'}=args;
 if(!slug.test(livro??'')||!slug.test(capitulo??''))throw Error('Informe --livro=<slug> --capitulo=<slug>');
 const book=collection.find(b=>b.slug===livro),chapter=book?.capitulos.find(c=>c.slug===capitulo);
 if(!book)return gerarLegado(args);
 if(!chapter)throw Error('Capítulo não cadastrado na coleção: '+capitulo);
 const file=path.join(destino,livro,capitulo+'.json');
 if(fs.existsSync(file)&&JSON.parse(fs.readFileSync(file)).status==='publicado')throw Error('Capítulo publicado não é sobrescrito automaticamente.');
 const mapBytes=fs.readFileSync(mapa),map=JSON.parse(mapBytes),sourceIndex=JSON.parse(fs.readFileSync(indice));
 if(sourceIndex.mapaSha256&&sourceIndex.mapaSha256!==sha(mapBytes))throw Error('MAPA-FONTES alterado após ingestão; execute a ingestão novamente.');
 const target=map.capitulos.find(c=>c.livro===livro&&c.capitulo===capitulo);
 if(!target)throw Error('Capítulo ausente no MAPA-FONTES.json.');
 const docs=sourceIndex.documentos.filter(d=>!d.status?.startsWith('quarentena')&&(d.destinos?.some(t=>t.livro===livro&&t.capitulo===capitulo)||(d.livro===livro&&d.capitulo===capitulo)));
 if(!docs.length)throw Error('PDF correspondente não encontrado no índice. Execute a ingestão primeiro.');
 const query=words(chapter.titulo+' '+target.termos.join(' ')),sections=[],references=[],curriculum=[];
 for(const doc of docs){
  const ref=validarFonte(doc);
  const pages=doc.paginas.filter(p=>!ref.paginasAutorizadas||ref.paginasAutorizadas.includes(p.pagina)).map(p=>({...p,score:[...words(p.texto)].filter(w=>query.has(w)).length})).filter(p=>p.score>=2).sort((a,b)=>b.score-a.score||a.pagina-b.pagina).slice(0,target.limitePaginas??8).sort((a,b)=>a.pagina-b.pagina);
  if(!pages.length)continue;
  const selected=[];
  for(const page of pages){
   const paragraphs=page.texto.split(/\n\s*\n|\n/).map(t=>t.trim()).filter(t=>t.length>=40&&[...words(t)].some(w=>query.has(w))).slice(0,4);
   if(!paragraphs.length)continue;
   const text=paragraphs.map(t=>t.slice(0,1600)).join('\n\n');
   sections.push({titulo:`Leitura de referência · ${ref.titulo} · página ${page.pagina}`,texto:text,segmentos:projectEditorialText(text),origem:{arquivo:path.basename(doc.arquivo),pagina:page.pagina,sha256:doc.sha256}});selected.push(page.pagina);
   if(['bncc-','inep-'].includes(doc.prefixo))curriculum.push({fonte:ref.titulo,pagina:page.pagina,sha256:doc.sha256,codigosExtraidos:[...new Set(text.match(/\bEF(?:0[6-9]|67|69|89)(?:LP|MA|CI|GE|HI)\d{2}\b/g)??[])],observacao:'Referência extraída; conferir pertinência por habilidade. Matriz INEP é complementar e não substitui o edital ou a BNCC.'});
  }
  if(selected.length)references.push({arquivo:path.basename(doc.arquivo),sha256:doc.sha256,titulo:ref.titulo,autores:ref.autores,url:ref.url,licenca:ref.licenca,evidenciaLicenca:ref.evidenciaLicenca,usoComercialAutorizado:true,paginas:selected});
 }
 if(!references.length)throw Error('Nenhum trecho pertinente e autorizado encontrado para este capítulo; revise mapa, páginas e fontes.');
 const ranked=selecionarExercicios(chapter,JSON.parse(fs.readFileSync('src/data/catalogo-v2.json')));
 if(ranked.length!==6)throw Error(`Há apenas ${ranked.length} questões ETEC/IFs verificadas e pertinentes; são necessárias seis. Nenhum capítulo foi gravado.`);
 const content={tipo:'colecao-vestibulinho-v1',status:'rascunho',introducao:chapter.introducao,disciplina:disciplinaPrincipal(livro,capitulo),secoes:[{titulo:'Conceito e relações fundamentais',texto:chapter.conceito,segmentos:projectEditorialText(chapter.conceito)},{titulo:'Roteiro de estudo',texto:'Relacione os conceitos: '+chapter.topicos.join('; ')+'. Leia os exemplos, explique cada passo e justifique sua escolha antes de conferir o gabarito.',segmentos:projectEditorialText('Relacione os conceitos: '+chapter.topicos.join('; ')+'. Leia os exemplos, explique cada passo e justifique sua escolha antes de conferir o gabarito.')},...sections],exemplos:[chapter.exemplo],...(chapter.grafico?{grafico:chapter.grafico}:{}),questoes:ranked.map(r=>r.q.id),bibliografia:references,referenciasCurriculares:curriculum,licencaConteudo:references.some(r=>r.licenca==='CC-BY-SA-4.0')?'CC-BY-SA-4.0':'Conteúdo autoral com referências atribuídas',criterioExercicios:ranked.map(r=>({id:r.q.id,banca:r.q.banca,correspondencias:r.termos.length,termos:r.termos})),revisaoNecessaria:['Conferir texto com páginas e figuras da fonte','Conferir direitos e atribuições da edição','Revisar alinhamento curricular, exemplos e seis exercícios','Completar e revisar a exposição antes de publicar']};
 // Validate every authored mathematical segment before writing anything.
 projectEditorialText(chapter.exemplo.enunciado);for(const step of chapter.exemplo.passos)projectEditorialText(step);projectEditorialText(chapter.exemplo.resposta);
 atomic(file,content);
 const books=fs.existsSync(metadados)?JSON.parse(fs.readFileSync(metadados)):[];
 let entry=books.find(b=>b.slug===livro);if(!entry){entry={slug:livro,titulo:book.titulo,descricao:book.descricao,capitulos:[]};books.push(entry)}
 if(!entry.capitulos.some(c=>c.slug===capitulo))entry.capitulos.push({slug:capitulo,titulo:chapter.titulo});
 atomic(metadados,books);
 console.log(JSON.stringify({capitulo:file,status:'rascunho',fontes:references.length,questoes:content.questoes}));return content;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)gerar(Object.fromEntries(process.argv.slice(2).map(x=>x.replace(/^--/,'').split('='))));
