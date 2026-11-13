#!/usr/bin/env python3
"""Importa IFRS 2026/1 a partir dos PDFs oficiais conferidos localmente."""
import hashlib, json, re, subprocess, sys
from pathlib import Path
import fitz
from PIL import Image

root = Path(__file__).resolve().parents[1]
prova = Path(sys.argv[1]).read_bytes()
gabarito = Path(sys.argv[2]).read_bytes()
assert hashlib.sha256(prova).hexdigest() == '9ffe4ac7056d7981ef4e34c077e9ffdee8132333d8b55852100d79a4c1f2cfdb'
assert hashlib.sha256(gabarito).hexdigest() == 'b4b5a5acda2a5e4bfa87c93e6e5097b18e14cca68065b902df657b6650e05b4c'
texto = subprocess.check_output(['pdftotext', '-layout', str(sys.argv[2]), '-'], text=True)
pares = re.findall(r'\b(\d{1,2})\)\s*(ANULADA|[A-E])\b', texto)
respostas = {int(numero): '*' if valor == 'ANULADA' else valor for numero, valor in pares}
assert len(pares) == 40 and sorted(respostas) == list(range(1, 41))
assert [n for n, r in respostas.items() if r == '*'] == [35]
doc = fitz.open(stream=prova, filetype='pdf')
assert len(doc) == 16
destino = root / 'public/acervo/ifrs-2026-1'
destino.mkdir(parents=True, exist_ok=True)
(destino / 'prova.pdf').write_bytes(prova)
(destino / 'gabarito.pdf').write_bytes(gabarito)
for indice, pagina in enumerate(doc, 1):
    imagem = pagina.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    Image.frombytes('RGB', (imagem.width, imagem.height), imagem.samples).save(destino / f'{indice:02}.webp', 'WEBP', quality=80, method=4)
registros = [dict(id='ifrs-2026-1', instituicao='IFRS', titulo='IFRS 2026/1 · Técnico integrado', paginas=len(doc), inicio=2, total=40, alternativas=list('ABCDE'), gabarito=[respostas[n] for n in range(1,41)], fonte='https://ingresso.ifrs.edu.br/2026/publicacoes/gabarito-definitivo/', sha256_prova=hashlib.sha256(prova).hexdigest(), sha256_gabarito=hashlib.sha256(gabarito).hexdigest())]
(root / 'src/data/ifrs-2026-1.json').write_text(json.dumps(registros, ensure_ascii=False, indent=2) + '\n')
print('IFRS 2026/1: 16 páginas, 40 questões, Q35 anulada')
