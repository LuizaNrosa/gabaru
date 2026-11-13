#!/usr/bin/env python3
"""Renderiza cadernos FUVEST 2000–2003 verificados; requer PyMuPDF e Pillow.
Uso: python scripts/renderizar-fuvest-2000-2003.py /pasta/com/pdfs
"""
import hashlib,json,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:raise SystemExit(__doc__)
folder=Path(sys.argv[1])
for exam in json.loads((root/'src/data/fuvest-2000-2003-versoes.json').read_text()):
 year=exam['ano'];day=exam['exame'];source=folder/(f'fuvest-{year}-d{day}.pdf' if day else f'fuvest-{year}-V.pdf')
 if hashlib.sha256(source.read_bytes()).hexdigest()!=exam['sha256_prova']:raise SystemExit(f'Hash divergente: {source}')
 doc=fitz.open(source)
 if len(doc)<exam['paginas_prova']:raise SystemExit(f'Páginas incorretas: {source}')
 output=root/f'public/acervo/fuvest/{year}/{exam["versao"].lower()}';output.mkdir(parents=True,exist_ok=True)
 for n in range(1,exam['paginas_prova']+1):
  pix=doc[n-1].get_pixmap(matrix=fitz.Matrix(1.75,1.75),alpha=False)
  Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(output/f'{n:02}.webp','WEBP',quality=82,method=4)
 print(year,day,exam['paginas_prova'])
