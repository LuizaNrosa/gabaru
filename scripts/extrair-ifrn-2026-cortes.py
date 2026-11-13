#!/usr/bin/env python3
"""Extrai somente agregados da classificação oficial IFRN 2026.
Uso: python3 scripts/extrair-ifrn-2026-cortes.py resultado.pdf > src/data/ifrn-2026-cortes.json
Não escreve nomes, inscrições ou informações individuais. Requer pdftotext.
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

pdf = Path(sys.argv[1])
assert hashlib.sha256(pdf.read_bytes()).hexdigest() == '2ee9c7345136afe95426f8be68b656a524e2086d28c456ab8efee9ff305d0568', 'PDF diferente da versão conferida'
texto = subprocess.check_output(['pdftotext', '-layout', str(pdf), '-'], text=True)
grupos = []
atual = None
total_aprovados = 0
for pagina, conteudo in enumerate(texto.split('\f'), 1):
    linhas = conteudo.splitlines()
    for i, linha in enumerate(linhas):
        cab = re.search(r'nº\s*(\d+)\s+(.+?),\s*forma INTEGRADA\s*-\s*(.*?)\s*-\s*(\S.*?)\s*$', linha)
        if cab:
            modalidade = re.search(r'Lista\s+(\S+)\s+\((\d+)\s+vagas?\)', '\n'.join(linhas[i+1:i+4]))
            if not modalidade:
                # Documento traz listagem sem modalidade nem vagas; não atribuir dados ao grupo anterior.
                atual = None
                continue
            atual = {'oferta': int(cab[1]), 'curso': cab[2], 'campus': cab[3], 'turno': cab[4], 'modalidade': modalidade[1], 'vagas': int(modalidade[2]), 'pagina': pagina, '_aprovados': []}
            grupos.append(atual)
        if 'Aprovado' in linha:
            total_aprovados += 1
            linha_aprovado = re.search(r'(\d+)º\s+Aprovado\s+(\d+\.\d+|-)\s+(\d+\.\d+|-)', linha)
            if not linha_aprovado:
                raise ValueError(f'Linha de aprovado não reconhecida na página {pagina}')
            if atual is None:
                continue
            pos, escore, bonificado = linha_aprovado.groups()
            atual['_aprovados'].append((int(pos), None if escore == '-' else float(escore), None if bonificado == '-' else float(bonificado)))
assert len(grupos) == 643 and total_aprovados == 3334
assert sum(len(g['_aprovados']) for g in grupos) == 3295
for grupo in grupos:
    aprovados = grupo.pop('_aprovados')
    assert len(aprovados) <= grupo['vagas']
    assert len({p for p, _, _ in aprovados}) == len(aprovados)
    ultimo = max(aprovados, key=lambda a: a[0]) if aprovados else None
    grupo['aprovados'] = len(aprovados)
    grupo['ultimo_aprovado_escore_final'] = ultimo[1] if ultimo else None
    grupo['ultimo_aprovado_escore_final_bonificado'] = ultimo[2] if ultimo else None
    grupo['referencia_disponivel'] = bool(ultimo and ultimo[1] is not None and ultimo[2] is not None and len(aprovados) == grupo['vagas'])
    # Apenas a página de início do grupo é usada como localização da fonte.
print(json.dumps({'edicao':'2026', 'processo':'Exame de Seleção 2026 — cursos técnicos integrados', 'fase':'resultado final — lista de classificação', 'fonte':'https://portal.ifrn.edu.br/documents/24904/Resultado_Final___Integrado_IFRN_2026_-_Lista_de_Classifica%C3%A7%C3%A3o.pdf', 'sha256':'2ee9c7345136afe95426f8be68b656a524e2086d28c456ab8efee9ff305d0568', 'listas':grupos}, ensure_ascii=False, indent=2))
