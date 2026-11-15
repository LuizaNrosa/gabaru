#!/usr/bin/env python3
"""Extrai acertos dos últimos convocados à 2ª fase, Unicamp 2027.
Uso: python3 extrair-unicamp2027.py [documento.pdf] [saida.json]
Requer PyMuPDF e pdftotext (Poppler); duas extrações são confrontadas.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import fitz
pdf=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/tmp/unicamp2027.pdf')
out=Path(sys.argv[2]) if len(sys.argv)>2 else Path('/tmp/unicamp2027.json')
blob=pdf.read_bytes();assert blob.startswith(b'%PDF-')
rows=[];doc=fitz.open(pdf);assert len(doc)==3
for pi,page in enumerate(doc,1):
 words=page.get_text('words');headings=[w for w in words if w[4]=='PAAIS'];assert len(headings)==8
 headings.sort(key=lambda w:w[0]);head_y=headings[0][1];assert all(abs(h[1]-head_y)<1 for h in headings)
 centers=[w[0]+22 for w in headings];groups={}
 for w in words:
  x,y,_,_,t,*_=w
  if x<260 and y>head_y+12:groups.setdefault(round(y,1),[]).append(w)
 assert len(groups)==[21,28,15][pi-1],(pi,len(groups))
 for y,coursewords in sorted(groups.items()):
  course=' '.join(w[4] for w in sorted(coursewords,key=lambda w:w[0]));cols=[None]*8;seen=[False]*8
  for x,v,x2,_,t,*_ in words:
   if x<280 or abs(v-y)>3:continue
   if not (t.isdigit() or t in ('-','–','−')):raise AssertionError((pi,course,t))
   midpoint=(x+x2)/2;j=min(range(8),key=lambda i:abs(midpoint-centers[i]));assert abs(midpoint-centers[j])<16 and not seen[j],(course,t,j);seen[j]=True
   if t.isdigit():cols[j]=int(t);assert 0<=cols[j]<=72
  turno=re.search(r'\(([IN])\)$',course);training=course.startswith('Treineiros')
  assert bool(turno)!=training,(pi,course)
  rows.append({'ano':2027,'fase':'convocacao_segunda_fase','curso':course,'turno':{'I':'Integral','N':'Noturno'}[turno.group(1)] if turno else None,'tipo':'treineiro' if training else 'curso','nao_cotistas':dict(zip(['0','20','40','60'],cols[:4])),'cotistas':dict(zip(['0','20','40','60'],cols[4:])),'pagina':pi})
assert len(rows)==64 and len({r['curso'] for r in rows})==64 and sum(r['tipo']=='treineiro' for r in rows)==3
# Confronto com segunda extração, pdftotext -layout, inclusive lacunas vazias.
text=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True);pages=[p for p in text.split('\f') if p.strip()];assert len(pages)==3
seenrows=[]
for pg in pages:
 lines=pg.splitlines();header=next(l for l in lines if l.count('PAAIS')==8);headers=list(re.finditer(r'PAAIS\s+(?:0|20|40|60)',header));assert len(headers)==8
 # Posições dos fins de cabeçalho de cada coluna, compensadas pelo alinhamento do PDF.
 targets=[m.end()-off for m,off in zip(headers,[2,3,3,3,2,3,0,3])]
 for line in lines:
  if not (re.search(r'\([IN]\)',line) or line.lstrip().startswith('Treineiros')):continue
  cols=[None]*8;used=set()
  for m in re.finditer(r'(?<!\w)(?:\d{1,2}|[-–−])(?!\w)',line):
   if m.start()<targets[0]-4:continue
   j=min(range(8),key=lambda i:abs(m.end()-targets[i]));assert abs(m.end()-targets[j])<=3 and j not in used,(line,m.group(),j);used.add(j)
   cols[j]=int(m.group()) if m.group().isdigit() else None
  seenrows.append(cols)
assert len(seenrows)==len(rows),(len(seenrows),len(rows))
for source,row in zip(seenrows,rows):
 actual=list(row['nao_cotistas'].values())+list(row['cotistas'].values());assert source==actual,(row['curso'],source,actual)
missing=sum(v is None for r in rows for group in ('nao_cotistas','cotistas') for v in r[group].values())
result={'titulo':'Unicamp 2027 — acertos dos últimos convocados à segunda fase','fonte':'https://www.comvest.unicamp.br/wp-content/uploads/2026/11/VU2027-nota-de-corte.pdf','sha256_fonte':hashlib.sha256(blob).hexdigest(),'unidade':'acertos','aviso':'Acertos dos últimos convocados à 2ª fase segundo curso, condição de cotista e pontuação PAAIS; lacunas e traços da fonte são null. Não é nota de matrícula nem garantia em outra edição.','quantidade_ofertas':len(rows),'quantidade_cursos':len(rows)-3,'quantidade_treineiros':3,'quantidade_celulas':len(rows)*8,'quantidade_sem_valor':missing,'ofertas':rows}
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(f"{len(rows)} ofertas, {len(rows)*8} células; {missing} vazias; PyMuPDF x pdftotext 512/512; SHA256 {result['sha256_fonte']}")
