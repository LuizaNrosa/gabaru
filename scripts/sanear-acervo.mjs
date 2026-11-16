import {readFile,writeFile,readdir,mkdir,unlink} from 'node:fs/promises';
import {cleanText,severeNoise} from './lib/saneamento.mjs';
const bank=new Map(JSON.parse(await readFile('src/data/treino-banco.json','utf8')).map(q=>[q.id,q]));
const stats={arquivosAlterados:0,idiomasSeparados:0,quarentena:[]};
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
for(const file of (await walk('content/questoes')).filter(p=>p.endsWith('.md'))){const old=await readFile(file,'utf8');let text=cleanText(old.replace(/<details>\s*<summary>Texto extraído \(pode conter ruído\)<\/summary>\s*/g,'').replace(/<\/details>/g,''));if(!/^nivelQualidade:/m.test(text))text=text.replace(/\n---\n/, '\nnivelQualidade: nivel-0-quarentena\nmotivoQualidade: transcricao-ocr-auxiliar-nao-promovida\n---\n');if(text!==old){await writeFile(file,text);stats.arquivosAlterados++;}if(/gabarito:\s*["']?pendente/i.test(text)||severeNoise(text))stats.quarentena.push({arquivo:file,motivo:'gabarito-pendente-ou-ruido'});}
for(const file of (await walk('content/enem')).filter(p=>p.endsWith('/dados.json'))){const old=await readFile(file,'utf8'),data=JSON.parse(old),out=[];
 for(const q of data.questoes){const text=cleanText(q.texto??'');const markers=[...text.matchAll(new RegExp('^QUEST[ÃA]O\\s+0?'+q.numero+'\\b','gmi'))];
  // The known 2011 yellow booklet orders English before Spanish. Other ambiguous sources stay quarantined.
  if(data.id==='enem-2011-d2'&&q.numero>=91&&q.numero<=95&&markers.length===2){for(const [i,lang]of ['en','es'].entries())out.push({...q,id:`${data.id}-q${String(q.numero).padStart(3,'0')}-${lang}`,idiomaTexto:lang,disciplina:lang==='en'?'ingles':'espanhol',texto:text.slice(markers[i].index,markers[i+1]?.index).trim(),...(lang==='es'?{gabarito:null,gabaritoPendente:true,habilidade:'',tema:`Questão ${q.numero} em espanhol — transcrição em conferência`,subtopico:'a-classificar'}:{}),separacao:{ordem:'ingles-espanhol',fonte:'caderno-5-amarelo-2011',numeroOriginal:q.numero}});stats.idiomasSeparados++;}
  else out.push({...q,texto:text,...(q.idiomaTexto==='es'?{habilidade:'',tema:`Questão ${q.numero} em espanhol — transcrição em conferência`,subtopico:'a-classificar'}:{})});
 }
 for(const q of out.filter(q=>q.idiomaTexto==='en'||q.idiomaTexto==='es')){
  const es=q.idiomaTexto==='es',base=`${data.id}-q${String(q.numero).padStart(3,'0')}`,original=bank.get(base),dir=es?'content/questoes/espanhol/a-classificar':'content/'+q.imagem.split('/').slice(0,-1).join('/');await mkdir(dir,{recursive:true});
  const lines={id:q.id,banca:'INEP',exame:'ENEM',ano:data.ano,dia:data.dia,numero:q.numero,origem:'oficial',disciplina:es?'espanhol':'ingles',subtopico:es?'a-classificar':original?.subtopico??'a-classificar',habilidade:es?'':original?.habilidade??'',tema:q.tema,idiomaTexto:q.idiomaTexto,gabarito:es?'pendente':original?.gabarito??'pendente',imagem:'/'+q.imagem,nivelQualidade:'nivel-0-quarentena',motivoQualidade:'transcricao-ocr-auxiliar-nao-promovida'};
  const markdown='---\n'+Object.entries(lines).map(([k,v])=>k+': '+JSON.stringify(v??'')).join('\n')+'\n---\n\n[Recorte original em conferência](/'+q.imagem+')\n\n'+q.texto.trim()+'\n';const dest=dir+'/'+q.id+'.md';let before='';try{before=await readFile(dest,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}if(before!==markdown){await writeFile(dest,markdown);stats.arquivosAlterados++;}
  if(!es)try{await unlink(dir+'/'+base+'.md');stats.arquivosAlterados++;}catch(e){if(e.code!=='ENOENT')throw e;}
 }
 data.questoes=out;if(JSON.stringify(JSON.parse(old))!==JSON.stringify(data)){await writeFile(file,JSON.stringify(data,null,2)+'\n');stats.arquivosAlterados++;}
}
await mkdir('docs/engenharia/total',{recursive:true});await writeFile('docs/engenharia/total/saneamento.json',JSON.stringify(stats,null,2)+'\n');console.log(JSON.stringify({...stats,quarentena:stats.quarentena.length},null,2));
