import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const subjects=read('src/data/disciplinas-capas.json');
const advances=read('src/data/archivo-metricas.json').advance;
const displaySize=value=>Math.min(112,Math.floor(1024/Array.from(value).reduce((n,c)=>n+(advances[c]??1),0)));
const planned=read('src/data/colecao-vestibulinho.json'),base=read('src/data/livros-base.json');
const catalog=read('src/data/catalogo-v2.json');
const palette={paper:'#f8f8f2',ink:'#123d35',stamp:'#c8501e'};
const font=fs.readFileSync('public/fonts/archivo/archivo-black.woff2').toString('base64');
const regular=fs.readFileSync('public/fonts/archivo/archivo-regular.woff2').toString('base64');
const mono=fs.readFileSync('public/fonts/atkinson/50a63ac321745c44.p.202x5_1668z2o.woff2').toString('base64');
const style=`@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:900}@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${regular}) format('woff2');font-weight:400}@font-face{font-family:AtkinsonMono;src:url(data:font/woff2;base64,${mono}) format('woff2');font-weight:200 800}text{fill:${palette.ink};font-family:Archivo,sans-serif}.mono{font-family:AtkinsonMono,monospace}.paper{fill:${palette.paper}}.stamp{fill:${palette.stamp}}`;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function lines(text,max=30){const out=[];for(const word of text.split(/\s+/)){const i=out.length-1;if(i>=0&&(out[i]+' '+word).length<=max)out[i]+=' '+word;else out.push(word)}return out;}
const text=(value,x,y,size=32,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" ${extra}>${esc(value)}</text>`;
function logo(x,y){return `<g transform="translate(${x} ${y})"><path d="M38 12A17 17 0 1 0 40 29H25V21H48V29A25 25 0 1 1 43 6Z" fill="${palette.ink}"/>${text('gabaru',68,42,58,'font-weight="900" letter-spacing="-1.74"')}${text('.',265,42,58,'class="stamp" font-weight="900"')}</g>`;}
function stamp(verified,kind,x,y){const labels=verified?(kind==='book'?['EDITAL','CONFERIDO','2026']:['QUESTÕES','OFICIAIS','VERIFICADAS']):['EM','PREPARAÇÃO','EDITORIAL'];return `<g transform="translate(${x} ${y}) rotate(-9 190 100)"><rect width="380" height="205" rx="4" fill="${palette.paper}" stroke="${palette.stamp}" stroke-width="8"/><rect x="10" y="10" width="360" height="185" fill="none" stroke="${palette.stamp}" stroke-width="2.5"/>${labels.map((s,i)=>text(s,190,58+i*52,42,'class="stamp mono" text-anchor="middle" font-weight="700"')).join('')}</g>`;}
const generated=[];
function svg(item,variant){const social=variant==='social',thumb=variant==='thumb',W=thumb?320:social?1200:1240,H=thumb?452:social?1200:1754,VW=social?1200:1240,VH=social?1200:1754,m=social?48:56;let body=`<rect width="${VW}" height="${VH}" fill="${palette.paper}"/><rect x="${m}" y="${m}" width="${VW-2*m}" height="${VH-2*m}" fill="none" stroke="${palette.ink}" stroke-width="3"/>${logo(88,96)}`;
 body+=text(item.kind==='book'?'COLEÇÃO GABARU · IFs, ETEC & ENEM':'ACERVO · PROVAS OFICIAIS',VW-88,126,22,'text-anchor="end" class="mono"');
 body+=`<path d="M88 198H${VW-88}" fill="none" stroke="${palette.ink}" stroke-width="4"/><path d="M88 210H${VW-88}" fill="none" stroke="${palette.ink}" stroke-width="1.5"/>`;
 body+=text(item.kind==='book'?'LIVRO-TEXTO · TEORIA E QUESTÕES':'CADERNO DE QUESTÕES',88,270,26,'class="mono" letter-spacing="3"');
 const titleLines=lines(item.title.toLocaleUpperCase('pt-BR'),18);body+=titleLines.map((l,i)=>text(l,88,390+i*120,displaySize(l),'font-weight="900"')).join('');
 if(thumb){body+=stamp(item.verified,item.kind,740,1320);body+=text(item.kind==='book'?'SUMÁRIO E PRÁTICA':'PROVAS E GABARITOS',88,1050,46,'class="mono"');}
 else{
  const subtitle=lines(item.subtitle,52);body+=subtitle.map((l,i)=>text(l,88,650+i*40,32)).join('');
  body+=text(item.kind==='book'?'FOCO DE EDITAL · BNCC & BANCAS':'CONFERÊNCIA POR CADERNO E VERSÃO',88,760,25,'class="mono"');
  if(social){body+=text(item.kind==='book'?'IFs · ETEC · ENEM':'FONTES OFICIAIS NO ACERVO',88,830,30,'font-weight="700"');body+=stamp(item.verified,item.kind,720,850);}
  else if(item.kind==='book'){
   body+=`<rect x="88" y="830" width="1064" height="455" fill="none" stroke="${palette.ink}" stroke-width="2"/><rect x="88" y="830" width="1064" height="64" fill="${palette.ink}"/>${text('SUMÁRIO DO VOLUME',112,874,28,'class="paper mono"')}`;
   body+=item.axes.map((axis,i)=>text(String(i+1).padStart(2,'0'),112,948+i*96,30,'class="mono"')+lines(axis,55).map((l,j)=>text(l,190,948+i*96+j*29,26)).join('')).join('');body+=text(item.count===null?'CONTEÚDO EM PREPARAÇÃO':`${item.count} QUESTÕES OFICIAIS VINCULADAS`,88,1390,26,'class="mono"');body+=stamp(item.verified,item.kind,742,1370);
  }else{
   body+=`<rect x="88" y="830" width="1064" height="450" fill="none" stroke="${palette.ink}" stroke-width="2"/><rect x="88" y="830" width="1064" height="64" fill="${palette.ink}"/>${text('FOLHA DE RESPOSTAS',112,874,28,'class="paper mono"')}`;
   for(let c=0;c<5;c++)body+=text(String.fromCharCode(65+c),390+c*135,938,30,'class="mono" text-anchor="middle"');
   for(let r=0;r<4;r++){body+=text(String(r+1).padStart(2,'0'),145,1008+r*74,28,'class="mono"');for(let c=0;c<5;c++)body+=`<circle cx="${390+c*135}" cy="${1000+r*74}" r="19" fill="${c===r?(r===2?palette.stamp:palette.ink):'none'}" stroke="${palette.ink}" stroke-width="2"/>`;}
   body+=text('O DOCUMENTO OFICIAL DA BANCA PREVALECE.',88,1390,24,'class="mono"');body+=stamp(item.verified,item.kind,742,1370);
  }
 }
 body+=`<rect x="${m}" y="${VH-120}" width="${VW-2*m}" height="64" fill="${palette.ink}"/>${text('GABARU · A GENTE ESTUDA JUNTO',VW/2,VH-77,social?29:32,'class="paper" text-anchor="middle" font-weight="700"')}`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${VW} ${VH}" role="img"><title>${esc(item.subtitle)}</title><desc>${esc(item.kind==='book'?'Capa editorial com sumário, situação de preparação e marca Gabaru.':'Capa de acervo com folha ilustrativa de respostas; as bolhas não constituem gabarito de uma prova.')}</desc><style>${style}</style>${body}</svg>\n`;
}
const actual=planned.concat(base).map(b=>{const subject=b.slug.startsWith('portugues')?'portugues':b.slug.startsWith('matematica')||b.slug==='vestibulinho-etec'?'matematica':'interdisciplinar';const ids=new Set();for(const c of b.capitulos){if(c.status==='amostra')for(const q of catalog.questoes.filter(q=>q.nivelQualidade!=='nivel-0-quarentena'&&q.disciplina===(c.slug==='moleculas-e-leitura-cientifica'?'quimica':'matematica')).slice(0,5))ids.add(q.id);}return {key:'livro-'+b.slug,kind:'book',title:b.slug==='enem-exatas-e-linguagens'?'Exatas e Linguagens':b.slug.startsWith('ciencias-natureza')?'Ciências da Natureza':b.slug.startsWith('ciencias-humanas')?'Ciências Humanas':subjects.find(s=>s.slug===subject).titulo,subtitle:b.titulo,axes:b.capitulos.map(c=>c.titulo).slice(0,4),count:ids.size||null,verified:false};});
const items=[...subjects.map(s=>({key:'livro-'+s.slug,kind:'book',title:s.titulo,subtitle:'IFs · ETEC · ENEM — volume em preparação',axes:s.eixos,count:null,verified:false})),...['etec','enem','coluni','fuvest','unicamp','unesp','ifsp','ifsc','ifrn','ifmg'].map(bank=>({key:'capa-'+bank,kind:'exam',title:bank.toUpperCase(),subtitle:'Acervo de provas · consulte edição e versão',verified:catalog.cadernos.some(e=>e.banca===bank&&['nivel-1-gabarito-oficial','nivel-2-resolucao-comentada'].includes(e.nivelQualidade))})),...actual];
fs.mkdirSync('public/capas',{recursive:true});
for(const item of items)for(const variant of ['a4','social','thumb']){const name=variant==='a4'?item.key:variant==='social'?(item.kind==='exam'?'social-'+item.key.slice(5):'social-'+item.key):'mini-'+item.key;const file=`public/capas/${name}.svg`,data=svg(item,variant);fs.writeFileSync(file,data);generated.push({file,width:variant==='social'?1200:variant==='thumb'?320:1240,height:variant==='social'?1200:variant==='thumb'?452:1754,sha256:createHash('sha256').update(data).digest('hex')});}
// Social PNG is a deterministic rasterization of the editable SVG, never an AI image.
await sharp('public/capas/social-etec.svg').resize(1200,630,{fit:'contain',background:palette.paper}).png().toFile('public/og/gabaru.png');
fs.writeFileSync('src/data/capas-manifesto.json',JSON.stringify({palette,generated},null,2)+'\n');
console.log(`${generated.length} SVGs: 14 disciplinas, 10 bancas e ${actual.length} livros reais, em A4/social/miniatura.`);
