// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import katex from 'katex';
import {cleanText} from './saneamento.mjs';
export const tierFor=level=>level==='nivel-2-resolucao-comentada'?'tier-2-completa':level==='nivel-1-gabarito-oficial'?'tier-1-gabarito-oficial':'tier-0-quarentena';
export const normalized=text=>String(text??'').normalize('NFKC').replace(/\u00ad/g,'').replace(/\s+/g,' ').trim();
export function cleanStructure(text){return cleanText(String(text??'')).replace(/^\s*(?:CN|CH|LC|MT)\s*[-–]\s*\d[ºo]?\s*dia\s*[|·-].*(?:Caderno|caderno).*$/gm,'').replace(/\n{3,}/g,'\n\n').trim();}
export function repairOptionMarkers(text){
 const matches=[...text.matchAll(/^\s*(\(?[A-EQO]\)?[.)]?|&|VOO)(?:[ \t]*\n|[ \t]+(?=[^\n]))/gm)];
 const last=matches.slice(-5);if(last.length!==5)return text;
 const markers=last.map(m=>m[1].replace(/[().]/g,''));
 if(!markers.some(m=>['Q','O','&','VOO'].includes(m))||markers.some((m,i)=>/^[A-E]$/.test(m)&&m!=='ABCDE'[i]))return text;
 const values=last.map((m,i)=>text.slice(m.index+m[0].length,last[i+1]?.index??text.length).trim());
 if(values.some(v=>!/[\p{L}\p{N}]/u.test(v)||/^QUEST[ÃA]O\b/i.test(v)))return text;
 return text.slice(0,last[0].index).trimEnd()+'\n'+values.map((v,i)=>`${'ABCDE'[i]}) ${v}`).join('\n');
}
export function splitBilingual(record,examId){
 if(record.idiomaTexto)return [record];
 const text=String(record.texto??''),en=/^\s*(?:L[ÍI]NGUA\s+(?:ESTRANGEIRA\s*[-–:]?\s*)?)?(?:INGL[ÊE]S|ENGLISH)\s*[:\-–]?\s*$/im.exec(text),es=/^\s*(?:L[ÍI]NGUA\s+(?:ESTRANGEIRA\s*[-–:]?\s*)?)?(?:ESPANHOL|ESPA[ÑN]OL|SPANISH)\s*[:\-–]?\s*$/im.exec(text);
 if(!en||!es)return [record];
 const parts=[{match:en,lang:'en'},{match:es,lang:'es'}].sort((a,b)=>a.match.index-b.match.index);
 const out=parts.map((p,i)=>({lang:p.lang,text:text.slice(p.match.index+p.match[0].length,parts[i+1]?.match.index??text.length).trim()}));
 if(out.some(p=>(p.text.match(/^[ \t]*\(?[A-E]\)?[.)]?[ \t]*(?:\n|[ \t]+)/gm)??[]).length!==5))return [record];
 const id=(record.id??`${examId}-q${String(record.numero).padStart(3,'0')}`).replace(/-(en|es)$/,'');
 return out.map(p=>({...record,id:`${id}-${p.lang}`,idiomaTexto:p.lang,disciplina:p.lang==='en'?'ingles':'espanhol',texto:p.text,...(p.lang==='es'?{gabarito:null,habilidade:'',subtopico:'a-classificar',tema:`Questão ${record.numero} — Espanhol`}:{})}));
}
export function normalizeExactNotation(text,discipline){
 if(!['matematica','fisica','quimica','biologia','ciencias','ciencias-da-natureza'].includes(discipline))return {text,changes:0};
 let changes=0;
 const parts=String(text).split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|```[\s\S]*?```)/g);
 const converted=parts.map((part,index)=>{
  if(index%2)return part;
  const rules=[[/\bCO\s+2\b/g,'\\mathrm{CO}_2'],[/\bH\s+2\s+O\b/g,'\\mathrm{H}_2\\mathrm{O}'],[/\bFe\s+3\s*\+(?=\s|[,.);]|$)/g,'\\mathrm{Fe}^{3+}'],[/\bm\s*\/\s*s\s+2\b/g,'\\mathrm{m/s}^2']];
  let value=part;
  for(const [pattern,latex]of rules)value=value.replace(pattern,original=>{try{katex.renderToString(latex,{throwOnError:true,trust:false});changes++;return '$'+latex+'$';}catch{return original;}});
  value=value.replace(/\b10\s+[-−]\s*3\b/g,(original,offset)=>{const prefix=value.slice(Math.max(0,offset-70),offset);if(!/(?:[×x*]\s*$|notação científica|potência|ordem de grandeza|expoente)/i.test(prefix))return original;try{katex.renderToString('10^{-3}',{throwOnError:true,trust:false});changes++;return '$10^{-3}$';}catch{return original;}});
  return value;
 }).join('');
 return {text:converted,changes};
}
export function officialKey(text,exam,bank){
 let source=text;
 if(bank==='ifsp'&&/tipo[12]$/.test(exam.id)){const type=exam.id.slice(-1);const start=new RegExp(`(?:INTEGRADO\\s*[-–]\\s*)?PROVA\\s+TIPO\\s+${type}\\b`,'i').exec(source);if(!start)return null;source=source.slice(start.index);const next=/PROVA\s+TIPO\s+[12]\b/i.exec(source.slice(start[0].length));if(next)source=source.slice(0,start[0].length+next.index);}
 const map=new Map();let conflict=false;
 const add=(number,letter)=>{number=Number(number);if(number<1||number>exam.questions.length)return;const previous=map.get(number);if(previous&&previous!==letter)conflict=true;map.set(number,letter);};
 if(bank==='coluni'&&/QUEST[ÃA]O\s+1\s+2\s+3\s+4/i.test(source)){
  if(!/GABARITO\s+1\b/i.test(exam.pages[0]?.text??''))return null;
  for(const m of source.matchAll(/\b(\d{1,3})\s+((?:(?:ANULADA|[A-D])\s+){3}(?:ANULADA|[A-D]))\b/g))add(m[1],m[2].split(/\s+/)[0]);
 }else{
  // Só pares explícitos número/letra; não interpreta sequências ambíguas.
  for(const m of source.matchAll(/(?:^|\s)(\d{1,3})\s+(ANULADA|ANULADO|[A-E*])(?=\s|$)/g))add(m[1],m[2]==='ANULADO'?'ANULADA':m[2]);
 }
 if(conflict||map.size!==exam.questions.length||exam.questions.some(q=>map.get(q.number)!==q.answer))return null;
 return map;
}
export function textProof(question,record,pages){
 if(!record.pageMapped)return {valid:false,reason:'pagina-sem-mapeamento'};
 const stem=normalized(question.enunciado);
 if(stem.length<35)return {valid:false,reason:'enunciado-insuficiente'};
 if(/\b(?:texto|trecho|figura|gráfico|tabela|imagem|esquema|tirinha|charge|mapa|ilustraç|foto|observe|abaixo|acima|anterior|representad[oa]|mostrad[oa]|indicad[oa])\w*/iu.test(stem))return {valid:false,reason:'contexto-compartilhado-ou-visual-requer-revisao'};
 const window=pages.slice(Math.max(0,record.page-1),record.page+1).map(p=>p.text).join('\n');
 const start=new RegExp(`(?:^|\\n)\\s*(?:QUEST[ÃA]O\\s*0*${record.number}\\b|0*${record.number}[.)]\\s)`,'i').exec(window);
 if(!start)return {valid:false,reason:'marcador-oficial-nao-localizado'};
 const rest=window.slice(start.index+start[0].length);const end=new RegExp(`(?:^|\\n)\\s*(?:QUEST[ÃA]O\\s*0*${record.number+1}\\b|0*${record.number+1}[.)]\\s)`,'i').exec(rest);
 const block=normalized(rest.slice(0,end?.index??rest.length));
 if(!block.includes(stem))return {valid:false,reason:'enunciado-nao-coincide-com-bloco-oficial'};
 let cursor=block.indexOf(stem)+stem.length;
 for(const option of question.alternativas){
  const marker=new RegExp(`(?:^|\\s)(?:\\(${option.letra}\\)|${option.letra}[.)])\\s*`,'gi');let found=false;
  for(const m of block.matchAll(marker)){if(m.index<cursor)continue;const position=m.index+m[0].length;if(block.slice(position).startsWith(normalized(option.texto))){cursor=position+normalized(option.texto).length;found=true;break;}}
  if(!found)return {valid:false,reason:'alternativas-nao-coincidem-em-ordem-no-bloco-oficial'};
 }
 return {valid:true,page:record.page};
}
export function adaptOfflineEnem(data,{year,examId,language,booklet}){
 if(year<2000||year>2008||!examId||!booklet)throw new Error('Fonte offline sem ano/edição/caderno inequívocos');
 const records=Array.isArray(data)?data:data.questions??[];
 return records.map(q=>{if(q.year&&q.year!==year)throw new Error('Ano divergente no dataset');const number=q.index??q.numero;const answer=q.correctAlternative??q.gabarito;const lang=q.language??q.idiomaTexto??language??'pt-BR';
  if(!Number.isInteger(number)||!/^([A-E])$/.test(answer??''))throw new Error('Questão offline sem número/gabarito válido');
  if(!['pt-BR','en','es','ingles','espanhol'].includes(lang))throw new Error('Idioma não reconhecido');
  return {id:q.id??`${examId}-q${String(number).padStart(3,'0')}`,numero:number,correta:answer,idioma:lang,booklet,enunciado:q.context??q.texto??'',alternativas:(q.alternatives??[]).map(a=>({letra:a.letter,texto:a.text??''}))};});
}
