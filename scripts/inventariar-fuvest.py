#!/usr/bin/env python3
"""Inventaria PDFs de páginas oficiais da FUVEST. Não modifica o catálogo público.

Exemplo: python scripts/inventariar-fuvest.py 2023 2025 > /tmp/fuvest-candidatos.json
A saída é um inventário de candidatos: não comprova que o conteúdo e a fase
foram corretamente identificados, e requer revisão antes de publicação.
"""
import json
import re
import sys
import unicodedata
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.current = None; self.links = []
    def handle_starttag(self, tag, attrs):
        if tag == 'a': self.current = [dict(attrs).get('href', ''), '']
    def handle_data(self, data):
        if self.current is not None: self.current[1] += data
    def handle_endtag(self, tag):
        if tag == 'a' and self.current is not None:
            self.links.append(self.current); self.current = None

def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')

if len(sys.argv) != 3:
    raise SystemExit(__doc__)
start, end = map(int, sys.argv[1:])
if start < 1977 or end > 2100 or start > end:
    raise SystemExit('Intervalo de anos inválido.')
results = []
for year in range(start, end + 1):
    source = f'https://www.fuvest.br/acervo-vestibular-{year}/'
    entry = {'ano': year, 'pagina': source, 'status': 'pendente_revisao', 'documentos': []}
    try:
        with urlopen(Request(source, headers={'User-Agent': 'Gabaru/1.0 (inventario de provas)'}), timeout=30) as response:
            if urlparse(response.url).hostname != 'www.fuvest.br': raise ValueError('Redirecionamento fora da FUVEST')
            html = response.read(5_000_000).decode('utf-8', errors='replace')
        parser = Links(); parser.feed(html); seen = set()
        for href, label in parser.links:
            url = urljoin(source, href); name = ' '.join(label.split()); normalized = norm(name + ' ' + url)
            if urlparse(url).hostname != 'www.fuvest.br' or not urlparse(url).path.lower().endswith('.pdf') or url in seen: continue
            if not re.search(r'prova|gabarito|nota.?de.?corte|notas.?minimas', normalized): continue
            seen.add(url); entry['documentos'].append({'rotulo': name, 'url': url, 'status': 'pendente_revisao'})
    except Exception as exc:
        entry['erro'] = str(exc)
    results.append(entry)
print(json.dumps(results, ensure_ascii=False, indent=2))
