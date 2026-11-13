#!/usr/bin/env python3
"""Gera as páginas WebP dos cinco cadernos oficiais da FUVEST 2023.
Uso: python scripts/renderizar-fuvest-2023.py /pasta/com/pdfs
Requer PyMuPDF e Pillow. Só aceita PDFs com o hash do catálogo conferido.
"""
import hashlib, json, sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2: raise SystemExit(__doc__)
folder=Path(sys.argv[1])
for exam in json.loads((root/'src/data/fuvest-2023-versoes.json').read_text()):
 version=exam['versao'];source=folder/f'fuvest-2023-{version}.pdf'
 if hashlib.sha256(source.read_bytes()).hexdigest()!=exam['sha256_prova']:raise SystemExit(f'Hash diferente: {source}')
 doc=fitz.open(source)
 if len(doc)!=28:raise SystemExit(f'Número de páginas incorreto: {source}')
 output=root/'public/acervo/fuvest/2023'/version.lower();output.mkdir(parents=True,exist_ok=True)
 for n,page in enumerate(doc,1):
  pix=page.get_pixmap(matrix=fitz.Matrix(1.75,1.75),alpha=False)
  Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(output/f'{n:02}.webp','WEBP',quality=82,method=4)
 print(version,len(doc))
