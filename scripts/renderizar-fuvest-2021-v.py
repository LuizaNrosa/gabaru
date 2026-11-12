#!/usr/bin/env python3
"""Gera páginas WebP do caderno V da FUVEST 2021 a partir do PDF conferido.
Uso: python scripts/renderizar-fuvest-2021-v.py /pasta/com/pdfs
Requer PyMuPDF e Pillow; o PDF deve coincidir com o hash do catálogo.
"""
import hashlib,json,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:raise SystemExit(__doc__)
source=Path(sys.argv[1])/'fuvest-2021-prova.pdf'
exam=json.loads((root/'src/data/fuvest-2021-versoes.json').read_text())[0]
if hashlib.sha256(source.read_bytes()).hexdigest()!=exam['sha256_prova']:raise SystemExit('Hash do PDF divergente')
doc=fitz.open(source)
if len(doc)!=28:raise SystemExit('Número de páginas inesperado')
output=root/'public/acervo/fuvest/2021/v';output.mkdir(parents=True,exist_ok=True)
for n,page in enumerate(doc,1):
 pix=page.get_pixmap(matrix=fitz.Matrix(1.75,1.75),alpha=False)
 Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(output/f'{n:02}.webp','WEBP',quality=82,method=4)
print('V',len(doc))
