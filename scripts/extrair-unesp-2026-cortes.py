#!/usr/bin/env python3
"""Extrai tabela oficial da Unesp 2026; entrada: PDF oficial e arquivo JSON de saída.

Requer PyMuPDF (fitz). Não armazena informações pessoais. Corte refere-se à
convocação para a segunda fase e não à matrícula ou aprovação final.
"""
import hashlib
import json
import re
import sys
from pathlib import Path
import fitz

source = Path(sys.argv[1])
output = Path(sys.argv[2])
rows = []
with fitz.open(source) as doc:
    if len(doc) != 8 or 'VESTIBULAR 2026' not in doc[0].get_text():
        raise ValueError('PDF não corresponde à tabela esperada da Unesp 2026')
    for page_number, page in enumerate(doc, 1):
        for block in page.get_text('blocks'):
            lines = [line.strip() for line in block[4].splitlines() if line.strip()]
            if len(lines) >= 5 and re.fullmatch(r'\d{3}', lines[-4]):
                name = ' '.join(lines[:-4])
                code, city, srvebp, su = lines[-4:]
            elif len(lines) == 4 and lines[0] == 'Treineiro' and lines[1] == '183':
                name, code, srvebp, su = lines
                city = None
            else:
                continue
            if not srvebp.isdigit() or not su.isdigit():
                raise ValueError(f'Valores inesperados no curso {code}: {lines}')
            rows.append({'codigo': code, 'curso': name, 'cidade': city,
                         'srvebp': int(srvebp), 'su': int(su), 'pagina': page_number})
if len(rows) != 183 or {int(r['codigo']) for r in rows} != set(range(1, 184)):
    raise ValueError('Tabela incompleta ou com códigos duplicados')
output.write_text(json.dumps({
    'edicao': 2026,
    'fonte': 'https://vestibular.unesp.br/Home/documentos150/corte.pdf',
    'descricao': 'Número mínimo de acertos para convocação à segunda fase',
    'sha256_pdf': hashlib.sha256(source.read_bytes()).hexdigest(),
    'registros': rows,
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
