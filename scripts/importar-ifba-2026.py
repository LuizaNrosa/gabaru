#!/usr/bin/env python3
"""Importa caderno e gabarito final IFBA 2026 obtidos da organizadora oficial.
Uso: python3 scripts/importar-ifba-2026.py PASTA > ifba-2026-registro.json
A pasta deve conter prova.pdf e gabarito.pdf; requer PyMuPDF, Pillow e pdftotext.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image

root=Path(__file__).resolve().parents[1];src=Path(sys.argv[1])
p=src/'prova.pdf';k=src/'gabarito.pdf';pb=p.read_bytes();kb=k.read_bytes()
assert pb.startswith(b'%PDF') and kb.startswith(b'%PDF')
doc=fitz.open(stream=pb,filetype='pdf');assert len(doc)==26
cover=doc[0].get_text();assert 'INTEGRADO 2026' in cover and '36 questões' in cover
text=subprocess.check_output(['pdftotext','-layout',str(k),'-'],text=True)
assert 'INGRESSO 2026' in text and 'GABARITO FINAL' in text
pairs=re.findall(r'^.*?\s+(\d{1,2})\s+(ANULADA|[A-E])\s*$',text,re.I|re.M)
assert [int(n) for n,a in pairs]==list(range(1,37)),pairs
key=['*' if a.upper()=='ANULADA' else a.upper() for n,a in pairs]
assert [i+1 for i,a in enumerate(key) if a=='*']==[21]
id='ifba-2026';dest=root/'public/acervo'/id;dest.mkdir(parents=True,exist_ok=True)
(dest/'prova.pdf').write_bytes(pb);(dest/'gabarito.pdf').write_bytes(kb)
for n,page in enumerate(doc,1):
 pix=page.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False)
 Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest/f'{n:02}.webp','WEBP',quality=80,method=4)
record={'id':id,'instituicao':'IFBA','titulo':'IFBA 2026 · Técnico integrado','paginas':len(doc),'inicio':3,'total':36,'alternativas':list('ABCDE'),'gabarito':key,'fonte':'https://concurso4.fundacaocefetminas.org.br/site/processo_seletivo_detalhes.aspx?id=D7495A1442A6910F','sha256_prova':hashlib.sha256(pb).hexdigest(),'sha256_gabarito':hashlib.sha256(kb).hexdigest()}
print(json.dumps(record,ensure_ascii=False,indent=2))
