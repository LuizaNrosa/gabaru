import {createHash} from 'node:crypto';
export const ORIGIN='https://gabaru.com.br';
export const FAMILIES=['hubs','provas','disciplinas','questoes','livros'];
export const digest=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
export function partUrls(kind,total){return Array.from({length:Math.ceil(total/2000)},(_,i)=>`/sitemap-${kind}${i?'-'+i:''}.xml`);}
export function buildPublicCatalog({catalog,books=[],previous,sourceDate,pageFingerprints={},commonFingerprint=''}){
 const date=new Date(Math.floor(new Date(sourceDate).getTime()/1000)*1000).toISOString();
 const old=new Map(Object.values(previous?.families??{}).flat().map(x=>[x.loc,x]));
 const families=Object.fromEntries(FAMILIES.map(k=>[k,[]])),seen=new Set();
 function add(kind,loc,payload,priority=0.6,changefreq='monthly'){
  if(seen.has(loc))throw Error('URL duplicada no catálogo SEO: '+loc);seen.add(loc);
  const fingerprint=digest({payload,template:pageFingerprints[loc]??'',common:commonFingerprint});
  const prior=old.get(loc);const lastmod=prior?.fingerprint===fingerprint?prior.lastmod:date;
  families[kind].push({loc,lastmod,changefreq,priority,fingerprint});
 }
 const questions=catalog.questoes.filter(q=>q.tier!=='tier-0-quarentena'&&q.nivelQualidade!=='nivel-0-quarentena'&&(['tier-1-gabarito-oficial','tier-2-completa'].includes(q.tier)||['nivel-1-gabarito-oficial','nivel-2-resolucao-comentada'].includes(q.nivelQualidade)));
 const bookMetadata=books.map(b=>({slug:b.slug,titulo:b.titulo,descricao:b.descricao??'',capitulos:(b.capitulos??[]).map(c=>({slug:c.slug,titulo:c.titulo,status:c.status??'preparacao'}))}));
 for(const loc of ['/','/sobre','/privacidade','/termos','/reembolso','/enem','/vestibulinho','/vestibulares','/provas','/questoes','/videoaulas'])add('hubs',loc,{path:loc,...(['/questoes','/provas'].includes(loc)?{catalog:questions}: {})},loc==='/'?1:0.7,['/sobre','/privacidade','/termos','/reembolso'].includes(loc)?'monthly':'weekly');
 for(const b of catalog.bancas.filter(b=>catalog.cadernos.some(e=>e.banca===b.slug)))add('hubs','/banca/'+b.slug,{b,exams:catalog.cadernos.filter(e=>e.banca===b.slug)},0.7);
 const exams=new Map();for(const e of catalog.cadernos.filter(e=>['nivel-1-gabarito-oficial','nivel-2-resolucao-comentada'].includes(e.nivelQualidade)))if(e.href)exams.set(e.href,e);
 for(const [loc,e] of exams)add('provas',loc,{e,questions:questions.filter(q=>q.edicao===e.id||e.questoes?.includes(q.id))},0.8);
 for(const kind of ['disciplina','assunto'])for(const slug of [...new Set(questions.map(q=>q[kind]).filter(s=>s&&s!=='a-classificar'))].sort())add('disciplinas',`/${kind}/${slug}`,questions.filter(q=>q[kind]===slug),0.6);
 for(const q of questions)add('questoes','/questoes/'+q.slug,q,q.tier==='tier-2-completa'?0.9:0.8);
 add('livros','/livros',bookMetadata,0.7,'weekly');
 return {version:1,origin:ORIGIN,books:bookMetadata,families};
}
