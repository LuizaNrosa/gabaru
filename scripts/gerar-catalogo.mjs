import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const slug = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const editorial=read('src/data/editorial/resolucoes.json');
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
 if(editorial[id])q.enunciado=q.enunciado.replace(/\n+/g,' ');
 const disc=q.disciplina;q.area=['matematica'].includes(disc)?'matematica':['fisica','quimica','biologia','ciencias'].includes(disc)?'ciencias-da-natureza':['historia','geografia','filosofia','sociologia','atualidades'].includes(disc)?'ciencias-humanas':disc==='a-classificar'?'a-classificar':'linguagens';
 // Only hand-curated, complete records enter the public search index and sitemaps.
 q.statusPublicacao=editorial[id]&&q.enunciado.trim()&&q.alternativas.length>=4&&q.alternativas.some(a=>a.letra===q.correta)&&q.comentarioResolucao.length>0?'completa':'rascunho';
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
 for(const q of data){const num=q.numero,id=`${e.id}-q${String(num).padStart(3,'0')}`,b=bankMap.get(id),s=splitOptions(q.texto??'');question(exam,id,num,s.text.replace(/^(?:QUEST[ÃA]O\s*)?\d+\s*\n/i,''),s.options,b?.gabarito??q.gabarito,{disciplina:b?.disciplina??q.disciplina??'a-classificar',assunto:b?.subtopico??q.subtopico??'a-classificar',tema:b?.tema??q.tema??`Questão ${num}`});}
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
function addDocument(banca,ano,titulo,url,source){if(!url||!ano||seenDocuments.has(url))return;seenDocuments.add(url);const hash=createHash('sha256').update(url).digest('hex').slice(0,12);addExam('doc-'+hash,banca,ano,titulo,0,url,`/provas/${banca}/${ano}`);documentOnly++;}
for(const banca of ['unesp','unicamp']){const filename=`${banca}-archive.json`,archive=read(`src/data/${filename}`);fontes.push({arquivo:filename,registros:archive.documents.length});for(const d of archive.documents.filter(d=>d.kind==='prova'))addDocument(banca,d.year,d.label,d.url,d.source);}
const fvDocs=read('src/data/fuvest-documentos.json');fontes.push({arquivo:'fuvest-documentos.json',registros:fvDocs.length});for(const d of fvDocs.filter(d=>/prova/i.test(d.label)&&!/(gabarito|resposta|abordagem)/i.test(d.label)))addDocument('fuvest',d.year,d.label,d.url,'https://www.fuvest.br/');
const ifDocs=read('src/data/if-document-sources.json');for(const [id,group] of Object.entries(ifDocs)){const b=board(id);b.nome=group.name;b.fonte=group.source;fontes.push({arquivo:`if-document-sources.json:${id}`,registros:group.editions.length});for(const e of group.editions)addDocument(id,Number(String(e.edition).match(/(?:19|20)\d{2}/)?.[0]),`${b.sigla} ${e.edition}`,e.exam,group.source);}
for(const exam of cadernos.values())exam.statusPublicacao=exam.questoes.length===exam.total&&exam.total>0&&exam.questoes.every(id=>questoes.get(id)?.statusPublicacao==='completa')?'completa':'rascunho';
const questions=[...questoes.values()],commented=questions.filter(q=>q.comentarioResolucao.length).length;
const catalog={bancas:[...bancas.values()].sort((a,b)=>a.sigla.localeCompare(b.sigla,'pt-BR')),cadernos:[...cadernos.values()].sort((a,b)=>b.ano-a.ano||a.id.localeCompare(b.id)),questoes:questions,inventario:{fontes,cadernosSomenteDocumento:documentOnly,anos:[...new Set([...cadernos.values()].map(e=>e.ano))].sort(),gabaritoSeco:questions.filter(q=>q.correta&&!q.comentarioResolucao.length).length,comentadas:commented,completas:questions.filter(q=>q.statusPublicacao==='completa').length}};
writeFileSync('src/data/catalogo-v2.json',JSON.stringify(catalog));
console.log(JSON.stringify({bancas:catalog.bancas.length,bancasComAcervo:new Set(catalog.cadernos.map(e=>e.banca)).size,cadernos:catalog.cadernos.length,questoes:questions.length,...catalog.inventario},null,2));
