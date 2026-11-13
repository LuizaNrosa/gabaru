#!/usr/bin/env python3
"""Importa os gabaritos das quatro versões FUVEST 2025 a partir do PDF oficial.

Uso: python scripts/importar-fuvest-2025.py /caminho/gabarito.pdf /pasta/das/provas
A pasta deve conter prova-v1.pdf, prova-v2.pdf, prova-v3.pdf e prova-v4.pdf.
Não publica: a saída deve ser revisada antes de alterar o catálogo de produção.
Requer pdftotext e pdfinfo (Poppler).
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

if len(sys.argv) != 3:
    raise SystemExit(__doc__)
key_pdf, proofs = Path(sys.argv[1]), Path(sys.argv[2])
text = subprocess.check_output(['pdftotext', '-f', '1', '-l', '1', '-layout', str(key_pdf), '-'], text=True)
if 'PROVA V1' not in text or 'PROVA V4' not in text or '2024' not in text:
    raise SystemExit('Cabeçalho do gabarito não corresponde à FUVEST 2025.')
rows = []
for line in text.splitlines():
    fields = re.findall(r'\b(?:\d+|[A-E])\b', line)
    if len(fields) == 16 and fields[0].isdigit():
        rows.append(fields)
if len(rows) != 45:
    raise SystemExit(f'Esperadas 45 linhas; encontradas {len(rows)}. Revisão manual necessária.')
result = []
for version in range(1, 5):
    answers = {}
    for row in rows:
        for offset in (4*(version-1), 4*(version-1)+2):
            number, answer = int(row[offset]), row[offset+1]
            if number in answers or answer not in 'ABCDE':
                raise SystemExit(f'Gabarito inválido na versão V{version}.')
            answers[number] = answer
    if sorted(answers) != list(range(1, 91)):
        raise SystemExit(f'Questões ausentes na versão V{version}.')
    proof = proofs / f'prova-v{version}.pdf'
    cover = subprocess.check_output(['pdftotext', '-f', '1', '-l', '1', str(proof), '-'], text=True)
    if not re.search(rf'\bV{version}\b', cover) or 'FUVEST 2025' not in cover:
        raise SystemExit(f'A capa de {proof} não confirma ano e versão.')
    metadata = subprocess.check_output(['pdfinfo', str(proof)], text=True)
    match = re.search(r'^Pages:\s*(\d+)\s*$', metadata, re.M)
    if not match or int(match.group(1)) != 34:
        raise SystemExit(f'Páginas inesperadas em {proof}.')
    result.append({
      'id': f'fuvest-2025-fase1-v{version}', 'ano': 2025, 'fase': '1ª fase', 'versao': f'V{version}',
      'gabarito': [answers[i] for i in range(1, 91)],
      'fonte_prova': f'https://www.fuvest.br/wp-content/uploads/fuvest2025_primeira_fase_prova_V{version}.pdf',
      'fonte_gabarito': 'https://www.fuvest.br/wp-content/uploads/fuvest2025_gabarito_primeira_fase.pdf',
      'sha256_prova': hashlib.sha256(proof.read_bytes()).hexdigest(),
      'sha256_gabarito': hashlib.sha256(key_pdf.read_bytes()).hexdigest(),
    })
print(json.dumps(result, ensure_ascii=False, indent=2))
