#!/usr/bin/env python3
"""Gera dados e imagens de quatro provas oficiais UNESP; requer PyMuPDF e Pillow.
Uso: python scripts/importar-unesp-lote-2.py /pasta/dos/pdfs
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
 ('2024-regular-d92735849ccb','2024-regular-a2f863f9d05a','2024','regular','001','15.11.2023','vestibular regular'),
 ('2024-meio-de-ano-8b6277736f6e','2024-meio-de-ano-7a976a12788c','2024','meio-de-ano','001','26.05.2024','vestibular de meio de ano'),
 ('2023-regular-112e58e8a5f4','2023-regular-e1958e8bcf9a','2023','regular','001','15.11.2022','vestibular regular'),
 ('2022-regular-8f9a7b32abdd','2022-regular-4a092ecc3069','2022','exatas-humanidades','002','15.11.2021','vestibular regular — Exatas e Humanidades'),
]
result=[]
for pid,kid,year,slug,code,date,label in configs:
 p=next(d for d in archive if d['id']==pid);k=next(d for d in archive if d['id']==kid)
 assert p['year']==k['year']==int(year) and p['application']==k['application'] and p['phase']=='1ª fase' and k['kind']=='gabarito'
 paths=[folder/f'{id}.pdf' for id in (pid,kid)]
 for path,d in zip(paths,(p,k)):
  assert hashlib.sha256(path.read_bytes()).hexdigest()==d['sha256'],f'hash divergente: {path}'
 cover=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(paths[0]),'-'],text=True).lower()
 key=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(paths[1]),'-'],text=True).lower()
 assert year in cover and (year in key or (year == "2024" and slug == "regular" and "vnsp2303" in key)) and code+'. prova de conhecimentos gerais' in cover and code+'. prova de conhecimentos gerais' in key and '90 questões' in cover and date in key and re.search(r'versão\s+1',key)
 if slug=='meio-de-ano': assert 'meio de ano' in cover and 'meio de ano' in key
 if slug=='exatas-humanidades': assert 'exatas e humanidades' in cover and 'exatas e humanidades' in key
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
(root/'src/data/unesp-lote-seguinte.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
