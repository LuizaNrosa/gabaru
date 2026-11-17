import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { mkdirSync,existsSync } from 'node:fs';
import { questionQuality,examQuality,contentFingerprint,N0,N1,N2 } from './lib/qualidade.mjs';
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const slug = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const rescue=existsSync('src/data/editorial/resgate-v3.json')?read('src/data/editorial/resgate-v3.json').records:{};
const sourceHashes=new Map();
function sourceHash(file){if(!/^src\/data\/(?:(?:etec|coluni|ifsc|ifsp)-exams\.json|fontes-abertas\/[a-z0-9-]+\.json)$/.test(file))return null;if(!sourceHashes.has(file))sourceHashes.set(file,createHash('sha256').update(readFileSync(file)).digest('hex'));return sourceHashes.get(file);}
const tier=level=>level===N2?'tier-2-completa':level===N1?'tier-1-gabarito-oficial':'tier-0-quarentena';
const editorial=read('src/data/editorial/resolucoes.json');
const bloqueios=read('src/data/editorial/bloqueios-catalogo.json');
const ingestion=new Map();if(existsSync('src/data/ingestao'))for(const file of readdirSync('src/data/ingestao').filter(f=>f.endsWith('.json')).sort()){const d=read('src/data/ingestao/'+file);for(const [id,q]of Object.entries(d.aceitas??{}))ingestion.set(id,q);}
const verifiedEnem=new Map(read('src/data/enem-gabaritos-conferidos.json').map(e=>[e.id,e]));
const batchEditorial=existsSync('src/data/editorial/resolucoes-lotes.json')?read('src/data/editorial/resolucoes-lotes.json'):{};
const sources={enem:['INEP / ENEM','Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira','BR','enem','https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos'],etec:['ETEC','Centro Paula Souza — Escolas Técnicas Estaduais','SP','vestibulinho','https://vestibulinho.etec.sp.gov.br/'],fatec:['FATEC','Centro Paula Souza — Faculdades de Tecnologia','SP','vestibulares','https://vestibular.fatec.sp.gov.br/'],cotuca:['COTUCA','Colégio Técnico de Campinas — Unicamp','SP','vestibulinho','https://cotuca.unicamp.br/'],cotil:['COTIL','Colégio Técnico de Limeira — Unicamp','SP','vestibulinho','https://www.cotil.unicamp.br/'],fuvest:['FUVEST','Fundação Universitária para o Vestibular','SP','vestibulares','https://www.fuvest.br/'],unicamp:['UNICAMP','Universidade Estadual de Campinas — Comvest','SP','vestibulares','https://www.comvest.unicamp.br/'],unesp:['UNESP','Universidade Estadual Paulista — Vunesp','SP','vestibulares','https://vestibular.unesp.br/'],unifesp:['UNIFESP','Universidade Federal de São Paulo','SP','vestibulares','https://www.unifesp.br/'],coluni:['COLUNI/UFV','Colégio de Aplicação da Universidade Federal de Viçosa','MG','vestibulinho','https://www.pse.coluni.ufv.br/'],uerj:['UERJ','Universidade do Estado do Rio de Janeiro','RJ','vestibulares','https://www.vestibular.uerj.br/'],uel:['UEL','Universidade Estadual de Londrina','PR','vestibulares','https://www.cops.uel.br/']};
const bancas=new Map(Object.entries(sources).map(([id,[sigla,nome,estado,categoria,fonte]])=>[id,{slug:id,sigla,nome,estado,categoria,fonte,periodicidade:'Consulte o edital de cada edição',descricao:`${nome}. Consulte os cadernos disponíveis, as fontes oficiais e a situação editorial das questões antes de começar seu estudo.`,duracaoMinutos:id==='etec'?240:null}]));
for(const [id,estado,regiao] of [['ifsc','SC','Santa Catarina'],['ifsp','SP','São Paulo'],['ifce','CE','Ceará'],['ifmg','MG','Minas Gerais'],['ifmt','MT','Mato Grosso'],['ifrn','RN','Rio Grande do Norte'],['ifrs','RS','Rio Grande do Sul']])bancas.set(id,{slug:id,sigla:id.toUpperCase(),nome:`Instituto Federal de Educação, Ciência e Tecnologia de ${regiao}`,estado,categoria:'vestibulinho',periodicidade:'Consulte o edital de cada edição',descricao:`Provas de seleção do Instituto Federal de ${regiao}, organizadas por ano e edição.`,fonte:`https://www.${id}.edu.br/`,duracaoMinutos:null});
bancas.set('senai',{slug:'senai',sigla:'SENAI',nome:'Serviço Nacional de Aprendizagem Industrial',estado:'BR',categoria:'vestibulinho',periodicidade:'Conforme unidade e edital',descricao:'Processos seletivos e cursos do Serviço Nacional de Aprendizagem Industrial. Consulte as informações da unidade de interesse.',fonte:'https://www.portaldaindustria.com.br/senai/',duracaoMinutos:null});
const cadernos=new Map(), questoes=new Map(), fontes=[];
function board(id){id=slug(id);if(!bancas.has(id))bancas.set(id,{slug:id,sigla:id.toUpperCase(),nome:id.toUpperCase(),estado:'Consultar fonte oficial',categoria:'vestibulinho',periodicidade:'Consulte o edital de cada edição',descricao:`Acervo de provas do ${id.toUpperCase()}, com referência à instituição responsável e gabaritos por edição.`,fonte:'',duracaoMinutos:null});return bancas.get(id);}
function addExam(id,banca,ano,titulo,total,fonte,href,duration=null){board(banca);const key=`${banca}:${id}`;const e=cadernos.get(key)??{id:key,banca,ano,titulo,total,fonte,href,questoes:[],duracaoMinutos:duration,statusPublicacao:'rascunho'};cadernos.set(key,e);return e;}
function question(exam,id,num,statement,options,correct,extra={}) {
 const alternatives=Object.entries(options??{}).filter(([k,v])=>/^[A-E]$/.test(k)&&typeof v==='string'&&v.trim()).map(([letra,texto])=>({letra,texto}));
 const q={id,slug:id,banca:exam.banca,ano:exam.ano,edicao:exam.id,numero:num,area:'a-classificar',disciplina:'a-classificar',assunto:'a-classificar',tema:`Questão ${num}`,dificuldade:'nao-classificada',enunciado:statement??'',imagens:[],alternativas:alternatives,anulada:correct==='ANULADA'||correct==='*',correta:/^[A-E]$/.test(correct??'')?correct:null,comentarioResolucao:[],statusPublicacao:'rascunho',fonte:exam.fonte,...extra,...editorial[id]};
 const imported=ingestion.get(id);if(imported){if(imported.correta!==q.correta)throw new Error('Ingestão diverge do gabarito original: '+id);for(const k of ['enunciado','alternativas','textoBase','imagens','proveniencia','tabelas'])if(imported[k]!==undefined)q[k]=imported[k];}
 const restored=rescue[id];if(restored&&restored.originalFingerprint===contentFingerprint(q)&&sourceHash(restored.source.file)===restored.source.sha256){for(const k of ['enunciado','alternativas','proveniencia',...(!q.correta?['correta']:[])])if(restored.updates[k]!==undefined)q[k]=restored.updates[k];}
 if(batchEditorial[id]?.validacao?.fingerprint===contentFingerprint(q))for(const k of ['disciplina','assunto','resolucaoEstruturada'])if(batchEditorial[id][k]!==undefined)q[k]=batchEditorial[id][k];
 q.categoria=board(q.banca).categoria;
 if(editorial[id]||batchEditorial[id])q.enunciado=q.enunciado.replace(/\n+/g,' ');
 const disc=q.disciplina;q.area=['matematica'].includes(disc)?'matematica':['fisica','quimica','biologia','ciencias'].includes(disc)?'ciencias-da-natureza':['historia','geografia','filosofia','sociologia','atualidades'].includes(disc)?'ciencias-humanas':disc==='a-classificar'?'a-classificar':'linguagens';
 // Only hand-curated, complete records enter the public search index and sitemaps.
 const verification=verifiedEnem.get(q.id.split('-q')[0]);
 const checked=!!q.proveniencia?.gabaritoConferido||(q.banca==='enem'&&!!verification&&verification.numbers.includes(q.numero)&&(!(q.idioma==='es'||q.disciplina==='espanhol')||verification.language==='espanhol'));
 Object.assign(q,questionQuality(q,{textoConferido:!!editorial[id]||batchEditorial[id]?.validacao?.fingerprint===contentFingerprint(q),gabaritoVerificado:checked,expected:q.banca==='coluni'?4:5,legadaComentada:!!editorial[id]&&q.comentarioResolucao.length>=3}));
 if(bloqueios[exam.id]){q.nivelQualidade=N0;q.motivos.push(bloqueios[exam.id]);}q.tier=tier(q.nivelQualidade);
 q.statusPublicacao=q.nivelQualidade===N0?'rascunho':'completa';
 questoes.set(id,q);if(!exam.questoes.includes(id))exam.questoes.push(id);
}
for(const banca of ['etec','coluni','ifsc','ifsp']){
 const file=`${banca}-exams.json`,data=read(`src/data/${file}`);fontes.push({arquivo:file,registros:data.length});
 for(const e of data){const year=Number(e.id.slice(0,4));const exam=addExam(e.id,banca,year,e.title,e.questions.length,e.source,`/provas/${banca}/${e.id}`,e.format?.durationMinutes??bancas.get(banca).duracaoMinutos);
 for(const q of e.questions){const area=e.format?.areas?.find(a=>q.number>=a.from&&q.number<=a.to);const names={'lingua-portuguesa':'portugues','matematica':'matematica','historia':'historia','geografia':'geografia','ciencias':'ciencias','quimica':'quimica','fisica':'fisica','biologia':'biologia'};const disciplina=names[slug(area?.name??'')]??'a-classificar';question(exam,`${banca}-${e.id}-q${String(q.number).padStart(3,'0')}`,q.number,q.statement,q.options,q.answer,{disciplina});}}
}
const bank=read('src/data/treino-banco.json'),bankMap=new Map(bank.map(q=>[q.id,q]));
const enem=new Map(read('src/data/enem-exams.json').map(e=>[e.id,e]));for(const e of read('src/data/enem-cadernos-paginados.json'))enem.set(e.id,e);
fontes.push({arquivo:'ENEM (catálogos unidos por id)',registros:enem.size});
function splitOptions(text){const matches=[...text.matchAll(/^(?:\(([A-E])\)|([A-E]))[ \t]*(?:\n|[ \t]+)(?![a-z]\))/gm)];const last=matches.slice(-5);if(last.map(m=>m[1]??m[2]).join('')!=='ABCDE')return {text,options:{}};return {text:text.slice(0,last[0].index).trim(),options:Object.fromEntries(last.map((m,i)=>[m[1]??m[2],text.slice(m.index+m[0].length,last[i+1]?.index??text.length).trim()]))};}
for(const e of enem.values()){
 const exam=addExam(e.id,'enem',e.year,`ENEM ${e.year}${e.day?` — ${e.day}º dia`:''} · ${e.id}`,e.total,bancas.get('enem').fonte,`/provas/enem/${e.id}`,e.year>=2018?(e.day===1?330:e.day===2?300:null):null);
 let data=[];try{data=read(`content/enem/${e.id}/dados.json`).questoes}catch{data=e.questions??[]}
 for(const q of data){const num=q.numero,id=q.id??`${e.id}-q${String(num).padStart(3,'0')}`,b=bankMap.get(`${e.id}-q${String(num).padStart(3,'0')}`),s=splitOptions(q.texto??'');question(exam,id,num,s.text.replace(/^(?:QUEST[ÃA]O\s*)?\d+\s*\n/i,''),s.options,q.idiomaTexto==='es'?q.gabarito??null:b?.gabarito??q.gabarito,{habilidade:q.idiomaTexto==='es'?q.habilidade??'':b?.habilidade??q.habilidade??'',idioma:q.idiomaTexto,disciplina:q.idiomaTexto?q.disciplina:b?.disciplina??q.disciplina??'a-classificar',assunto:q.idiomaTexto==='es'?q.subtopico??'a-classificar':b?.subtopico??q.subtopico??'a-classificar',tema:q.idiomaTexto==='es'?q.tema:b?.tema??q.tema??`Questão ${num}`});}
}
const generic=/^(fuvest-|unesp-|unicamp-lote|uerj-|ifmt-|ifrs-|ifs-|ifrn-2026)/;
for(const file of readdirSync('src/data').sort().filter(f=>generic.test(f)&&f.endsWith('.json')&&!/(cortes|archive|documentos)/.test(f))){
 const data=read(`src/data/${file}`);if(!Array.isArray(data))continue;fontes.push({arquivo:file,registros:data.length});
 for(const e of data){const banca=slug(e.instituicao??file.split('-')[0]),year=Number(e.ano??String(e.id).match(/20\d\d|19\d\d/)?.[0]);if(!year)continue;
 const answers=Array.isArray(e.gabarito)?e.gabarito:typeof e.gabarito==='string'?e.gabarito.split(''):Array.isArray(e.gabaritos?.ingles)?e.gabaritos.ingles:[];
 const href=['fuvest','unesp','unicamp'].includes(banca)?`/provas/${banca}/${year}`:`/provas/${banca}/${e.id}`;
 const exam=addExam(e.id,banca,year,e.titulo??`${banca.toUpperCase()} ${year} · ${e.versao??e.id}`,e.total??answers.length,e.fonte_prova??e.fonte??'',href);
 for(let i=0;i<answers.length;i++)question(exam,`${banca}-${e.id}-q${String(i+1).padStart(3,'0')}`,i+1,'',{},answers[i]);
 }
}
// Document-only archives have no invented question counts or synthetic answer records.
const seenDocuments=new Set([...cadernos.values()].map(e=>e.fonte));
let documentOnly=0;
function addDocument(banca,ano,titulo,url,source,href){if(!url||!ano||seenDocuments.has(url))return;seenDocuments.add(url);const hash=createHash('sha256').update(url).digest('hex').slice(0,12);addExam('doc-'+hash,banca,ano,titulo,0,url,href??`/provas/${banca}/${ano}`);documentOnly++;}
for(const banca of ['unesp','unicamp']){const filename=`${banca}-archive.json`,archive=read(`src/data/${filename}`);fontes.push({arquivo:filename,registros:archive.documents.length});for(const d of archive.documents.filter(d=>d.kind==='prova'))addDocument(banca,d.year,d.label,d.url,d.source);}
const fvDocs=read('src/data/fuvest-documentos.json');fontes.push({arquivo:'fuvest-documentos.json',registros:fvDocs.length});for(const d of fvDocs.filter(d=>/prova/i.test(d.label)&&!/(gabarito|resposta|abordagem)/i.test(d.label)))addDocument('fuvest',d.year,d.label,d.url,'https://www.fuvest.br/');
const ifDocs=read('src/data/if-document-sources.json');for(const [id,group] of Object.entries(ifDocs)){const b=board(id);b.nome=group.name;b.fonte=group.source;fontes.push({arquivo:`if-document-sources.json:${id}`,registros:group.editions.length});for(const e of group.editions)addDocument(id,Number(String(e.edition).match(/(?:19|20)\d{2}/)?.[0]),`${b.sigla} ${e.edition}`,e.exam,group.source,`/provas/${id}`);}
for(const exam of cadernos.values()){Object.assign(exam,examQuality(exam,questoes));if(bloqueios[exam.id]){exam.nivelQualidade=N0;exam.motivos.push(bloqueios[exam.id]);}exam.tier=tier(exam.nivelQualidade);exam.statusPublicacao=exam.nivelQualidade===N0?'rascunho':'completa';}
const questions=[...questoes.values()],commented=questions.filter(q=>q.resolucaoEstruturada||q.comentarioResolucao.length).length;
const catalog={bancas:[...bancas.values()].sort((a,b)=>a.sigla.localeCompare(b.sigla,'pt-BR')),cadernos:[...cadernos.values()].sort((a,b)=>b.ano-a.ano||a.id.localeCompare(b.id)),questoes:questions,inventario:{fontes,cadernosSomenteDocumento:documentOnly,anos:[...new Set([...cadernos.values()].map(e=>e.ano))].sort(),gabaritoSeco:questions.filter(q=>q.correta&&!q.resolucaoEstruturada&&!q.comentarioResolucao.length).length,comentadas:commented,completas:questions.filter(q=>q.nivelQualidade===N2).length}};
writeFileSync('src/data/catalogo-v2.json',JSON.stringify(catalog));
const levels=[N0,N1,N2],count=rows=>Object.fromEntries(levels.map(n=>[n,rows.filter(r=>r.nivelQualidade===n).length]));
const audit={cadernos:count(catalog.cadernos),questoes:count(questions),motivosRetencaoCadernos:Object.fromEntries([...new Set(catalog.cadernos.flatMap(e=>e.motivos))].map(m=>[m,catalog.cadernos.filter(e=>e.motivos.includes(m)).length])),detalhesCadernos:catalog.cadernos.map(({id,nivelQualidade,motivos})=>({id,nivelQualidade,motivos})),detalhesQuestoes:questions.map(({id,nivelQualidade,motivos})=>({id,nivelQualidade,motivos}))};
mkdirSync('docs/engenharia/total',{recursive:true});writeFileSync('docs/engenharia/total/auditoria-qualidade.json',JSON.stringify(audit,null,2)+'\n');
writeFileSync('src/data/editorial/provas-indexaveis.json',JSON.stringify([...new Set(catalog.cadernos.filter(e=>e.nivelQualidade!==N0).map(e=>e.href))],null,2)+'\n');
console.log('Régua de qualidade',JSON.stringify({cadernos:audit.cadernos,questoes:audit.questoes}));
console.log(JSON.stringify({bancas:catalog.bancas.length,bancasComAcervo:new Set(catalog.cadernos.map(e=>e.banca)).size,cadernos:catalog.cadernos.length,questoes:questions.length,...catalog.inventario},null,2));
