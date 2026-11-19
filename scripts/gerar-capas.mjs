import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const subjects=read('src/data/disciplinas-capas.json');
const advances=read('src/data/archivo-metricas.json').advance;
const displaySize=value=>Math.min(112,Math.floor(1024/Array.from(value).reduce((n,c)=>n+(advances[c]??1),0)));
const planned=read('src/data/colecao-vestibulinho.json'),base=read('src/data/livros-base.json');
const catalog=read('src/data/catalogo-v2.json');
const palette = {
  paper: '#f6f2e9',
  ink: '#1c1e1b',
  forest: '#2e3f38',
  ochre: '#be965e',
  stamp: '#b1251b',
  line: '#d5ccb8',
};
const font=fs.readFileSync('public/fonts/archivo/archivo-black.woff2').toString('base64');
const regular=fs.readFileSync('public/fonts/archivo/archivo-regular.woff2').toString('base64');
const mono=fs.readFileSync('public/fonts/atkinson/50a63ac321745c44.p.202x5_1668z2o.woff2').toString('base64');
const style=`@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:900}@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${regular}) format('woff2');font-weight:400}@font-face{font-family:AtkinsonMono;src:url(data:font/woff2;base64,${mono}) format('woff2');font-weight:200 800}text{fill:${palette.ink};font-family:Archivo,sans-serif}.mono{font-family:AtkinsonMono,monospace}.paper{fill:${palette.paper}}.stamp{fill:${palette.stamp}}`;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function lines(text,max=30){const out=[];for(const word of text.split(/\s+/)){const i=out.length-1;if(i>=0&&(out[i]+' '+word).length<=max)out[i]+=' '+word;else out.push(word)}return out;}
const text=(value,x,y,size=32,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" ${extra}>${esc(value)}</text>`;
const brandAsset = fs.readFileSync('public/marca/gabaru-carimbo.svg', 'utf8');
const brand = brandAsset.match(/^<svg[^>]* viewBox="([^"]+)">(<path[^>]+\/>)<\/svg>\s*$/);
if (!brand) throw new Error('Carimbo Gabaru inválido');
const [, brandViewBox, brandPath] = brand;

function logo(x, y, size, wordSize) {
  return `<g transform="translate(${x} ${y})">
    <svg width="${size}" height="${size}" viewBox="${brandViewBox}" aria-hidden="true">${brandPath}</svg>
    ${text('gabaru', size + Math.round(size * .14), Math.round((size + wordSize * .66) / 2), wordSize, 'font-weight="900" letter-spacing="-1.7"')}
  </g>`;
}
function examStamp(verified, x, y) {
  const labels = verified ? ['QUESTÕES', 'OFICIAIS', 'VERIFICADAS'] : ['EM', 'PREPARAÇÃO', 'EDITORIAL'];
  return `<g transform="translate(${x} ${y}) rotate(-9 190 100)"><rect width="380" height="205" rx="4" fill="${palette.paper}" stroke="${palette.stamp}" stroke-width="8"/><rect x="10" y="10" width="360" height="185" fill="none" stroke="${palette.stamp}" stroke-width="2.5"/>${labels.map((s,i)=>text(s,190,58+i*52,42,'class="stamp mono" text-anchor="middle" font-weight="700"')).join('')}</g>`;
}
function bookFace(item, width, height, margin, social) {
  const center = width / 2;
  const emblem = [
    ...Array.from({length: 7}, (_, i) => `M${center - 105} ${300 + i * 25}h210`),
    ...Array.from({length: 7}, (_, i) => `M${center - 90 + i * 30} 300v155`),
  ].join(' ');
  const title = lines(item.title.toLocaleUpperCase('pt-BR'), 18);
  const titleStart = social ? 550 : 620;
  const obiStart = social ? 770 : 1130;
  const sealX = social ? 935 : 975;
  const sealY = social ? 880 : 1404;
  const centered = 'class="mono" text-anchor="middle"';
  const sealed = 'class="stamp mono" text-anchor="middle" font-weight="700"';

  return `<rect width="${width}" height="${height}" fill="${palette.paper}"/>
    <rect x="${margin}" y="${margin}" width="${width - 2 * margin}" height="${height - 2 * margin}" fill="none" stroke="${palette.forest}" stroke-width="2"/>
    ${logo(92, 93, social ? 152 : 174, social ? 96 : 107)}
    <path d="${emblem}" fill="none" stroke="${palette.line}" stroke-width="2"/>
    ${title.map((part, i) => text(part, center, titleStart + i * (social ? 88 : 112), Math.min(social ? 90 : 112, displaySize(part)), 'font-weight="900" text-anchor="middle"')).join('')}
    ${text('LIVRO-TEXTO · TEORIA E QUESTÕES', center, social ? 720 : 920, 25, centered)}
    <rect x="${margin}" y="${obiStart}" width="${width - 2 * margin}" height="${social ? 130 : 180}" fill="${palette.ochre}"/>
    ${text('VOLUME I · NÚCLEO IFs, ETEC & ENEM', center, obiStart + (social ? 75 : 105), 28, centered)}
    <g transform="translate(${sealX} ${sealY}) rotate(-4 80 110)">
      <rect width="160" height="230" rx="5" fill="${palette.paper}" stroke="${palette.stamp}" stroke-width="8"/>
      <rect x="10" y="10" width="140" height="210" rx="2" fill="none" stroke="${palette.stamp}" stroke-width="2.5"/>
      ${text('EM', 80, 70, 26, sealed)}${text('PREPARAÇÃO', 80, 118, 18, sealed)}${text('EDITORIAL', 80, 166, 18, sealed)}
    </g>
    ${text('GABARU · A GENTE ESTUDA JUNTO', 88, social ? 1110 : 1664, 25, 'class="mono"')}`;
}
const generated=[];
function svg(item,variant){const social=variant==='social',thumb=variant==='thumb',W=thumb?320:social?1200:1240,H=thumb?452:social?1200:1754,VW=social?1200:1240,VH=social?1200:1754,m=social?48:56;
 const book = item.kind === 'book';
 const description = book
   ? 'Capa editorial com emblema geométrico, cinta e selo de preparação.'
   : 'Capa de acervo com folha ilustrativa de respostas; as bolhas não constituem gabarito de uma prova.';
 let body;
 if (book) {
  body = bookFace(item, VW, VH, m, social);
 } else {
  body =`<rect width="${VW}" height="${VH}" fill="${palette.paper}"/><rect x="${m}" y="${m}" width="${VW-2*m}" height="${VH-2*m}" fill="none" stroke="${palette.ink}" stroke-width="3"/>${logo(88,78,106,66)}`;
 body+=text('ACERVO · PROVAS OFICIAIS',VW-88,126,22,'text-anchor="end" class="mono"');
 body+=`<path d="M88 198H${VW-88}" fill="none" stroke="${palette.ink}" stroke-width="4"/><path d="M88 210H${VW-88}" fill="none" stroke="${palette.ink}" stroke-width="1.5"/>`;
 body+=text('CADERNO DE QUESTÕES',88,270,26,'class="mono" letter-spacing="3"');
 const titleLines=lines(item.title.toLocaleUpperCase('pt-BR'),18);body+=titleLines.map((l,i)=>text(l,88,390+i*120,displaySize(l),'font-weight="900"')).join('');
 if(thumb){body+=examStamp(item.verified,740,1320);body+=text('PROVAS E GABARITOS',88,1050,46,'class="mono"');}
 else{
  const subtitle=lines(item.subtitle,52);body+=subtitle.map((l,i)=>text(l,88,650+i*40,32)).join('');
  body+=text('CONFERÊNCIA POR CADERNO E VERSÃO',88,760,25,'class="mono"');
  if(social){body+=text('FONTES OFICIAIS NO ACERVO',88,830,30,'font-weight="700"');body+=examStamp(item.verified,720,850);}
  else{
   body+=`<rect x="88" y="830" width="1064" height="450" fill="none" stroke="${palette.ink}" stroke-width="2"/><rect x="88" y="830" width="1064" height="64" fill="${palette.forest}"/>${text('FOLHA DE RESPOSTAS',112,874,28,'class="paper mono"')}`;
   for(let c=0;c<5;c++)body+=text(String.fromCharCode(65+c),390+c*135,938,30,'class="mono" text-anchor="middle"');
   for(let r=0;r<4;r++){body+=text(String(r+1).padStart(2,'0'),145,1008+r*74,28,'class="mono"');for(let c=0;c<5;c++)body+=`<circle cx="${390+c*135}" cy="${1000+r*74}" r="19" fill="${c===r?(r===2?palette.stamp:palette.ink):'none'}" stroke="${palette.ink}" stroke-width="2"/>`;}
   body+=text('O DOCUMENTO OFICIAL DA BANCA PREVALECE.',88,1390,24,'class="mono"');body+=examStamp(item.verified,742,1370);
  }
 }
 body+=`<rect x="${m}" y="${VH-120}" width="${VW-2*m}" height="64" fill="${palette.forest}"/>${text('GABARU · A GENTE ESTUDA JUNTO',VW/2,VH-77,social?29:32,'class="paper" text-anchor="middle" font-weight="700"')}`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${VW} ${VH}" role="img"><title>${esc(item.subtitle)}</title><desc>${esc(description)}</desc><style>${style}</style>${body}</svg>\n`;
}
const titlesByBook = {
  'enem-exatas-e-linguagens': 'Exatas e Linguagens',
  'vestibulinho-etec': 'Vestibulinho ETEC',
  'ciencias-natureza-ifs-etec': 'Ciências da Natureza',
  'ciencias-humanas-atualidades-etec': 'Ciências Humanas',
};
const actual = planned.concat(base).map(book => ({
  key: 'livro-' + book.slug,
  kind: 'book',
  title: titlesByBook[book.slug] ?? subjects.find(subject => book.slug.startsWith(subject.slug + '-'))?.titulo ?? book.titulo,
  subtitle: book.titulo,
}));
const items=[...subjects.map(s=>({key:'livro-'+s.slug,kind:'book',title:s.titulo,subtitle:'IFs · ETEC · ENEM — volume em preparação'})),...['etec','enem','coluni','fuvest','unicamp','unesp','ifsp','ifsc','ifrn','ifmg'].map(bank=>({key:'capa-'+bank,kind:'exam',title:bank.toUpperCase(),subtitle:'Acervo de provas · consulte edição e versão',verified:catalog.cadernos.some(e=>e.banca===bank&&['nivel-1-gabarito-oficial','nivel-2-resolucao-comentada'].includes(e.nivelQualidade))})),...actual];
fs.mkdirSync('public/capas',{recursive:true});
for(const item of items)for(const variant of ['a4','social','thumb']){const name=variant==='a4'?item.key:variant==='social'?(item.kind==='exam'?'social-'+item.key.slice(5):'social-'+item.key):'mini-'+item.key;const file=`public/capas/${name}.svg`,data=svg(item,variant);fs.writeFileSync(file,data);generated.push({file,width:variant==='social'?1200:variant==='thumb'?320:1240,height:variant==='social'?1200:variant==='thumb'?452:1754,sha256:createHash('sha256').update(data).digest('hex')});}
// Social PNG is a deterministic rasterization of the editable SVG, never an AI image.
await sharp('public/capas/social-etec.svg').resize(1200,630,{fit:'contain',background:palette.paper}).png().toFile('public/og/gabaru.png');
fs.writeFileSync('src/data/capas-manifesto.json',JSON.stringify({palette,generated},null,2)+'\n');
console.log(`${generated.length} SVGs: 14 disciplinas, 10 bancas e ${actual.length} livros reais, em A4/social/miniatura.`);
