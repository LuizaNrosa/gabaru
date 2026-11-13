#!/usr/bin/env python3
"""Importa IFMT 2025/1 de PDFs oficiais já baixados.

Uso: python3 scripts/importar-ifmt-2025-1.py PROVA.pdf GABARITO.pdf
A prova e o gabarito devem pertencer ao edital 030/2024. O script
confere hash, cabeçalho, posições e alternativas antes de gerar os ativos.
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

import fitz
from PIL import Image

if len(sys.argv) != 3:
    raise SystemExit(__doc__)
prova, gabarito = map(Path, sys.argv[1:])
prova_bytes, gabarito_bytes = prova.read_bytes(), gabarito.read_bytes()
if not prova_bytes.startswith(b'%PDF') or not gabarito_bytes.startswith(b'%PDF'):
    raise SystemExit('Os dois arquivos precisam ser PDFs.')
sha_prova = hashlib.sha256(prova_bytes).hexdigest()
sha_gabarito = hashlib.sha256(gabarito_bytes).hexdigest()
# Mantidos fixos para não associar por engano outra edição ou versão.
assert sha_prova == '9d869ba65e668a25a19ed3d00bbf4ea75ef5d1577fc60458612837cbb14a6230'
assert sha_gabarito == '2caf2dffed8ab2a05179392249ff60bfe15d97d71f44767eb089fd5294d0fa2e'
texto = subprocess.check_output(['pdftotext', '-layout', str(gabarito), '-'], text=True)
assert 'GABARITO DEFINITIVO' in texto and '030/2024' in texto
pares = re.findall(r'\b(\d{2})\s+([A-E])\b', texto)
respostas = {int(numero): alternativa for numero, alternativa in pares}
assert len(pares) == len(respostas) == 40 and sorted(respostas) == list(range(1, 41)), pares
chave = [respostas[i] for i in range(1, 41)]
# Conferência separada com extração geométrica do PyMuPDF.
doc_gab = fitz.open(gabarito)
palavras = doc_gab[0].get_text('words')
pares_geometricos = {}
for x0, y0, x1, y1, texto_palavra, *_ in palavras:
    if not re.fullmatch(r'\d{2}', texto_palavra):
        continue
    numero = int(texto_palavra)
    if not 1 <= numero <= 40:
        continue
    candidatos = [(abs(y0 - y), letra) for x, y, _, _, letra, *_ in palavras
                  if re.fullmatch(r'[A-E]', letra) and 35 < x - x0 < 80 and abs(y0 - y) < 3]
    if len(candidatos) == 1:
        pares_geometricos[numero] = candidatos[0][1]
assert pares_geometricos == respostas, (pares_geometricos, respostas)

doc = fitz.open(prova)
assert len(doc) == 18
capa = doc[0].get_text()
assert '030/2024' in capa and '40 questões' in capa and '2025/1' in capa
destino = Path('public/acervo/ifmt-2025-1')
destino.mkdir(parents=True, exist_ok=True)
(destino / 'prova.pdf').write_bytes(prova_bytes)
(destino / 'gabarito.pdf').write_bytes(gabarito_bytes)
for numero, pagina in enumerate(doc, 1):
    imagem = pagina.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    Image.frombytes('RGB', (imagem.width, imagem.height), imagem.samples).save(destino / f'{numero:02}.webp', 'WEBP', quality=80, method=4)
registro = {
    'id': 'ifmt-2025-1', 'instituicao': 'IFMT',
    'titulo': 'IFMT 2025/1 · Técnico integrado',
    'paginas': len(doc), 'inicio': 2, 'total': 40,
    'alternativas': list('ABCDE'), 'gabarito': chave,
    'fonte': 'https://sites.google.com/ifmt.edu.br/provas-anteriores-ifmt/provas/ens-med-integrado/provas-2025/20251',
    'sha256_prova': sha_prova, 'sha256_gabarito': sha_gabarito,
}
Path('src/data/ifmt-2025-1.json').write_text(json.dumps([registro], ensure_ascii=False, indent=2) + '\n')
print('IFMT 2025/1: 18 páginas, 40 respostas verificadas por dois métodos')
