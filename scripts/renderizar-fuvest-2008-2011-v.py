#!/usr/bin/env python3
"""Gera imagens das provas V FUVEST 2008 a 2011 depois de verificar os hashes.
Uso: python scripts/renderizar-fuvest-2008-2011-v.py /pasta/com/pdfs
Requer PyMuPDF, Pillow e arquivos fuvest-ANO-V.pdf.
"""
import hashlib,json,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:raise SystemExit(__doc__)
folder=Path(sys.argv[1]);pages={2008:22,2009:22,2010:22,2011:24}
for exam in json.loads((root/'src/data/fuvest-2008-2011-versoes.json').read_text()):
 year=exam['ano'];source=folder/f'fuvest-{year}-V.pdf'
 if hashlib.sha256(source.read_bytes()).hexdigest()!=exam['sha256_prova']:raise SystemExit(f'Hash divergente: {source}')
 doc=fitz.open(source)
 if len(doc)!=pages[year]:raise SystemExit(f'Páginas incorretas: {source}')
 output=root/f'public/acervo/fuvest/{year}/v';output.mkdir(parents=True,exist_ok=True)
 for n,page in enumerate(doc,1):
  pix=page.get_pixmap(matrix=fitz.Matrix(1.75,1.75),alpha=False)
  Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(output/f'{n:02}.webp','WEBP',quality=82,method=4)
 print(year,len(doc))
