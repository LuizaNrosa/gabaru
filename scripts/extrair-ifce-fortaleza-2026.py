#!/usr/bin/env python3
"""Extrai apenas referências agregadas da classificação retificada IFCE Fortaleza.
Uso: python scripts/extrair-ifce-fortaleza-2026.py resultado.pdf > saida.json
Não imprime nem armazena nomes, matrículas ou datas pessoais.
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

pdf = Path(sys.argv[1])
sha = hashlib.sha256(pdf.read_bytes()).hexdigest()
assert sha == 'e2f2567edc78bb56db4562d263ca844214c923fe09d282fd25de0b1836fa0931', 'PDF inesperado'
text = subprocess.check_output(['pdftotext', '-layout', str(pdf), '-'], text=True)
heads = list(re.finditer(r'(\d{2}) · Técnico Integrado em ([^\n]+)', text))
assert len(heads) == 6
rows = []
pattern = re.compile(r'^\s*(\d+)º\s+\d{10,}\s+.*?\s+(\d+,\d+)\s+\d+,\d+\s+\d+,\d+\s+\d+,\d+\s+\d+,\d+\s+Classificado\s+\d{2}/\d{2}/\d{4}\s*$', re.M)
for i, head in enumerate(heads):
    block = text[head.end():heads[i+1].start() if i+1 < len(heads) else len(text)]
    ac = re.search(r'Ampla Concorrência\s+(\d+) vagas\s*·\s*(\d+) ocupadas', block)
    assert ac and ac.group(1) == ac.group(2) == '16'
    accepted = pattern.findall(block[ac.end():])[:16]
    assert [int(row[0]) for row in accepted] == list(range(1,17))
    rows.append({'curso': head.group(2).strip(), 'turno': 'Integral (matutino e vespertino)', 'vagas_totais': 35, 'vagas_ac': 16, 'posicao': 16, 'nota': float(accepted[-1][1].replace(',','.')), 'pagina': text[:head.start()].count('\f') + 1})
assert len(rows) == 6
print(json.dumps({'edicao':'2026.2','campus':'Fortaleza','modalidade':'Ampla concorrência','classificacao_publicada':'2026-07-20','fonte':'https://concursos.faifce.ifce.edu.br/api/publicos/editais/900fe778-8a83-46cd-9473-80dd477e6432/atualizacoes/cd10b3c2-e094-4d85-8add-ed6a93cf0fbe_classificacao.pdf','fonte_vagas':'https://concursos.faifce.ifce.edu.br/concursos/detalhes?editalId=900fe778-8a83-46cd-9473-80dd477e6432','sha256':sha,'ofertas':rows},ensure_ascii=False,indent=2))
