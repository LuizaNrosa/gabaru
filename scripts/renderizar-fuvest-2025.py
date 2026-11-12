#!/usr/bin/env python3
"""Renderiza páginas dos PDFs oficiais da FUVEST 2025 para o leitor do Gabaru.

Uso: python scripts/renderizar-fuvest-2025.py /pasta/com/pdfs
Arquivos esperados: prova-v1.pdf a prova-v4.pdf. Requer PyMuPDF e Pillow.
Cada PDF precisa coincidir com o SHA-256 registrado no catálogo conferido.
"""
import hashlib
import json
import sys
from pathlib import Path
import fitz
from PIL import Image

root = Path(__file__).resolve().parents[1]
if len(sys.argv) != 2:
    raise SystemExit(__doc__)
source = Path(sys.argv[1])
exams = json.loads((root / 'src/data/fuvest-2025-versoes.json').read_text())
for exam in exams:
    version = exam['versao'].lower()
    pdf = source / f'prova-{version}.pdf'
    if hashlib.sha256(pdf.read_bytes()).hexdigest() != exam['sha256_prova']:
        raise SystemExit(f'Arquivo diferente do PDF conferido: {pdf}')
    document = fitz.open(pdf)
    if len(document) != 34:
        raise SystemExit(f'Número de páginas inesperado em {pdf}')
    output = root / 'public/acervo/fuvest/2025' / version
    output.mkdir(parents=True, exist_ok=True)
    for number, page in enumerate(document, 1):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.75, 1.75), alpha=False)
        Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(output / f'{number:02}.webp', 'WEBP', quality=82, method=4)
    print(f'{exam["versao"]}: {len(document)} páginas')
