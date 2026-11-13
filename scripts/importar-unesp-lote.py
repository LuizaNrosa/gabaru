#!/usr/bin/env python3
"""Gera dados e imagens de quatro provas oficiais UNESP; requer PyMuPDF e Pillow.
Uso: python scripts/importar-unesp-lote.py /pasta/dos/pdfs
Os nomes dos PDFs devem ser os IDs do catálogo oficial, seguidos de .pdf.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1]
folder=Path(sys.argv[1])
archive=json.loads((root/'src/data/unesp-archive.json').read_text())['documents']
configs=[
 ('2026-regular-fda4e93aa4b1','2026-regular-6fb7957cffb6','2026','regular','001','02.11.2025','vestibular regular'),
 ('2026-meio-de-ano-0f790bbaf9e9','2026-meio-de-ano-6ed34f6ff375','2026','meio-de-ano','001','24.05.2026','vestibular de meio de ano'),
 ('2025-meio-de-ano-f66a29024b39','2025-meio-de-ano-c8a4a9d47672','2025','meio-de-ano','001','08.06.2025','vestibular de meio de ano'),
 ('2022-regular-4f7c409ccb6a','2022-regular-5dd8221c3fb6','2022','biologicas','001','14.11.2021','vestibular regular — Biológicas'),
]
result=[]
for pid,kid,year,slug,code,date,label in configs:
 p=next(d for d in archive if d['id']==pid);k=next(d for d in archive if d['id']==kid)
 assert p['year']==k['year']==int(year) and p['application']==k['application'] and p['phase']==k['phase']=='1ª fase'
 paths=[folder/f'{id}.pdf' for id in (pid,kid)]
 for path,d in zip(paths,(p,k)):
  assert hashlib.sha256(path.read_bytes()).hexdigest()==d['sha256'],f'hash divergente: {path}'
 cover=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(paths[0]),'-'],text=True).lower()
 key=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(paths[1]),'-'],text=True).lower()
 assert year in cover and year in key and code+'. prova de conhecimentos gerais' in cover and code+'. prova de conhecimentos gerais' in key and '90 questões' in cover and date in key and re.search(r'versão\s+1',key)
 if slug=='meio-de-ano': assert 'meio de ano' in cover and 'meio de ano' in key
 if slug=='biologicas': assert 'biológicas' in cover and 'biológicas' in key
 pairs=re.findall(r'(?<!\d)(\d{1,2})\s*-\s*([a-e])(?!\w)',key)
 answers={int(n):a.upper() for n,a in pairs}
 assert len(pairs)==90 and sorted(answers)==list(range(1,91))
 doc=fitz.open(paths[0]); assert len(doc)==p['pages']
 out=root/'public/acervo/unesp'/year/slug;out.mkdir(parents=True,exist_ok=True)
 for n,page in enumerate(doc,1):
  pix=page.get_pixmap(matrix=fitz.Matrix(1.75,1.75),alpha=False)
  Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/f'{n:02}.webp','WEBP',quality=82,method=4)
 result.append({'id':pid,'ano':int(year),'aplicacao':slug,'titulo':f'UNESP {year} — {label}, primeira fase','versao':'1','gabarito':[answers[n] for n in range(1,91)],'fonte_prova':p['url'],'fonte_gabarito':k['url'],'sha256_prova':p['sha256'],'sha256_gabarito':k['sha256']})
 print(pid,len(doc),'páginas')
(root/'src/data/unesp-lote-quatro.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
