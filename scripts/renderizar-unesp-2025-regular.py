#!/usr/bin/env python3
"""Renderiza prova regular UNESP 2025 após conferir hash. Requer PyMuPDF e Pillow.
Uso: python scripts/renderizar-unesp-2025-regular.py /pasta/com/pdfs
"""
import hashlib,json,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:raise SystemExit(__doc__)
source=Path(sys.argv[1])/'unesp-2025-prova.pdf';exam=json.loads((root/'src/data/unesp-2025-regular.json').read_text())
if hashlib.sha256(source.read_bytes()).hexdigest()!=exam['sha256_prova']:raise SystemExit('Hash divergente')
doc=fitz.open(source)
if len(doc)!=32:raise SystemExit('Páginas incorretas')
out=root/'public/acervo/unesp/2025/regular';out.mkdir(parents=True,exist_ok=True)
for n,page in enumerate(doc,1):
 pix=page.get_pixmap(matrix=fitz.Matrix(1.75,1.75),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/f'{n:02}.webp','WEBP',quality=82,method=4)
print(len(doc),'páginas')
