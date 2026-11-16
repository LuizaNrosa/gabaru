"""Local geometry-first extraction. No HTTP, OCR guesses or model calls."""
import json,re,sys,hashlib
from pathlib import Path
import pymupdf
job=json.load(sys.stdin); doc=pymupdf.open(job['pdf']); keydoc=pymupdf.open(job['gabarito'])
keytext='\n'.join(p.get_text(sort=True) for p in keydoc)
# Official key tables use padded numbers followed by A-E or cancellation.
key={}
for match in re.finditer(r'(?m)(?<!\d)(\d{1,3})\s+(?:[.\-:]\s*)?(ANULADA|Anulada|[A-E]|\*)(?=\s|$)',keytext):
 n=int(match[1]);letter=match[2].upper();
 if n in key and key[n]!=letter:key[n]='DIVERGENTE'
 else:key[n]=letter
marker=re.compile(r'(?im)^\s*QUEST[ÃA]O\s*(\d{1,3})\b')
records=[];current=None;prefix=[];page_metrics=[]; collecting=False; contexts={}; context_regions=[]
for pi,page in enumerate(doc):
 page_text=page.get_text()
 if re.search(r'FOLHA DE RESPOSTAS|RASCUNHO',page_text,re.I) and not marker.search(page_text):continue
 blocks=[b for b in page.get_text('blocks') if b[6]==0 and b[1]<page.rect.height*.94]
 heads=[b for b in blocks if marker.search(b[4])]
 left=any(b[0]<page.rect.width*.45 for b in heads);right=any(b[0]>page.rect.width*.5 for b in heads)
 crossing=sum(b[0]<page.rect.width*.4 and b[2]>page.rect.width*.65 for b in blocks)
 columns=2 if left and right and crossing<max(2,len(blocks)*.15) else 1
 blocks.sort(key=lambda b:((int(b[0]>=page.rect.width*.5) if columns==2 else 0),round(b[1],1),b[0]))
 page_metrics.append({'pagina':pi+1,'colunas':columns,'blocos':len(blocks)})
 for b in blocks:
  text=b[4];matches=[m for m in marker.finditer(text) if 0<int(m[1])<=job.get('numeroMaximo',job.get('esperadas',200))];match=matches[-1] if matches else None
  if re.search(r'(?is)^\s*Leia.{0,180}respon(?:der|da).{0,80}quest[õoãa]',text) or (re.match(r'^\s*Leia\b',text) and current and any(re.search(r'(?m)^\s*\(?E\)',v) for v in current['blocos'])):
   collecting=True;prefix=[];context_regions=[]
  if collecting and not match:
   prefix.append(text);context_regions.append({'pagina':pi+1,'bbox':list(b[:4])});continue
  if match:
   if collecting:
    prompt=' '.join(prefix)[:260];numbers=[int(n) for n in re.findall(r'\b\d{1,3}\b',prompt) if 0<int(n)<=job.get('numeroMaximo',job.get('esperadas',200))]
    first=numbers[0] if numbers else int(match[1]);last=numbers[1] if len(numbers)>1 and numbers[1]>=first else first
    for n in range(first,last+1):contexts[n]={'texto':'\n'.join(prefix).strip(),'regioes':list(context_regions)}
    collecting=False
   current={'numero':int(match[1]),'blocos':[],'regioes':[],'prefixo':'','colunas':columns};prefix=[];records.append(current)
   text=text[match.end():]
  if current:
   if text.strip():current['blocos'].append(text.strip())
   current['regioes'].append({'pagina':pi+1,'bbox':list(b[:4]),'coluna':int(b[0]>=page.rect.width*.5) if columns==2 else 0,'colunas':columns})
  else:prefix.append(text)
questions=[]
for i,rec in enumerate(records):
 text='\n'.join(rec['blocos']);parts=list(re.finditer(r'(?m)^\s*\(?([A-E])\)[\t ]*',text))
 # ENEM uses unparenthesized A-E labels; use only when no parenthesized sequence exists.
 if not parts:parts=list(re.finditer(r'(?m)^\s*([A-E])\s+(?=\S)',text))
 options={}
 for j,m in enumerate(parts):options[m[1]]=text[m.end():parts[j+1].start() if j+1<len(parts) else len(text)].strip()
 statement=text[:parts[0].start()].strip() if parts else text.strip()
 regions=rec['regioes']; assets=[]; detected_visual=False
 # Reproduce the exact question regions. Each crop has page/bounds provenance.
 for page_no in sorted(set(r['pagina'] for r in regions)):
  page=doc[page_no-1];rr=[r for r in regions if r['pagina']==page_no]
  if not rr:continue
  bbox=pymupdf.Rect(min(r['bbox'][0] for r in rr)-3,min(r['bbox'][1] for r in rr)-3,max(r['bbox'][2] for r in rr)+3,max(r['bbox'][3] for r in rr)+3)
  if rec['colunas']==1:bbox.x0=25;bbox.x1=page.rect.width-25
  # Include vector/raster diagrams between text blocks, bounded by the next question.
  same_page_next=[r for later in records[i+1:i+2] for r in later['regioes'] if r['pagina']==page_no and r['coluna']==rr[0]['coluna']]
  bbox.y1=min(r['bbox'][1] for r in same_page_next)-4 if same_page_next else page.rect.height*.94
  bbox=bbox & page.rect
  if bbox.is_empty:continue
  raster=any(bbox.contains(pymupdf.Rect(im['bbox'])) and pymupdf.Rect(im['bbox']).height>35 and pymupdf.Rect(im['bbox']).get_area()>3000 for im in page.get_image_info())
  vector=any(bbox.contains(pymupdf.Rect(d['rect'])) and pymupdf.Rect(d['rect']).height>25 and pymupdf.Rect(d['rect']).y0>min(r['bbox'][3] for r in rr)+8 and (pymupdf.Rect(d['rect'])&bbox).get_area()>3000 for d in page.get_drawings())
  detected_visual=detected_visual or raster or vector
  if not job.get('todosAssets',False) and not raster and not vector and not contexts.get(rec['numero']) and not re.search(r'(?i)\b(figura|gráfico|tabela|charge|mapa|imagem|esquema|quadrinho|tirinha)',statement):continue
  name=f"q-{rec['numero']:03d}-p{page_no:02d}.png";destination=Path(job['assets'])/name;destination.parent.mkdir(parents=True,exist_ok=True)
  page.get_pixmap(matrix=pymupdf.Matrix(1.5,1.5),clip=bbox,alpha=False).save(destination)
  assets.append({'arquivo':str(destination),'pagina':page_no,'bbox':list(bbox)})
 # Missing raster/vector semantics stay in quarantine until an explicit description exists.
 context=contexts.get(rec['numero']);tables=[]
 if context:
  for page_no in sorted(set(r['pagina'] for r in context['regioes'])):
   page=doc[page_no-1];rr=[r['bbox'] for r in context['regioes'] if r['pagina']==page_no];clip=pymupdf.Rect(25,min(r[1] for r in rr)-3,page.rect.width-25,max(r[3] for r in rr)+3)&page.rect
   dest=Path(job['assets'])/f"q-{rec['numero']:03d}-base-p{page_no:02d}.png";page.get_pixmap(matrix=pymupdf.Matrix(1.5,1.5),clip=clip,alpha=False).save(dest);assets.append({'arquivo':str(dest),'pagina':page_no,'bbox':list(clip)})
   try:
    for table in page.find_tables(clip=clip).tables:tables.append({'linhas':table.extract(),'pagina':page_no})
   except (ValueError,RuntimeError):pass
 references=detected_visual or bool(re.search(r'(?i)\b(?:figuras?|gr[áa]ficos?|tabelas?|charges?|mapas?|imagem|imagens|esquemas?|quadrinhos?|tirinhas?)\b',statement))
 questions.append({'numero':rec['numero'],'enunciado':statement,'alternativas':options,'gabaritoPdf':key.get(rec['numero']),'imagensExtraidas':assets,'referenciaVisual':references,'paginas':sorted(set(r['pagina'] for r in regions)),'layout':rec['colunas'],'prefixo':rec['prefixo'],'textoBase':context['texto'] if context else '', 'tabelas':tables,'contextoRaster':bool(context and any(pymupdf.Rect(im['bbox']).intersects(pymupdf.Rect(*r['bbox'])) for r in context['regioes'] for im in doc[r['pagina']-1].get_image_info()))})
print(json.dumps({'parser':'PyMuPDF','versao':pymupdf.VersionBind,'paginas':page_metrics,'gabaritoExtraido':key,'questoes':questions},ensure_ascii=False))
