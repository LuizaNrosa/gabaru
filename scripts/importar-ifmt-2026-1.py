#!/usr/bin/env python3
"""Importa o caderno integrado IFMT 2026/1 e seu gabarito definitivo.

Uso: python scripts/importar-ifmt-2026-1.py /caminho/prova.pdf /caminho/gabarito.pdf
Os arquivos devem ser provenientes do arquivo oficial do IFMT. O script valida
as posições e a anulação declarada antes de escrever imagens e metadados.
"""
import hashlib, json, re, subprocess, sys
from pathlib import Path
import fitz
from PIL import Image

root = Path(__file__).resolve().parents[1]
p, g = map(Path, sys.argv[1:])
pb, gb = p.read_bytes(), g.read_bytes()
assert pb.startswith(b'%PDF') and gb.startswith(b'%PDF')
doc = fitz.open(p)
assert len(doc) == 27
text = subprocess.check_output(['pdftotext', '-raw', str(g), '-'], text=True)
assert 'GABARITO DEFINITIVO' in text and '090/2025' in text
pairs = re.findall(r'(?<!\d)(\d{2})\s+(Anulada|[A-E])\b', text, flags=re.I)
answers = {int(n): '*' if a.lower() == 'anulada' else a.upper() for n, a in pairs}
assert len(pairs) == 50 and set(answers) == set(range(1, 51))
assert [n for n, a in answers.items() if a == '*'] == [39]
key = [answers[n] for n in range(1, 51)]
folder = root / 'public/acervo/ifmt-2026-1'
folder.mkdir(parents=True, exist_ok=True)
(folder/'prova.pdf').write_bytes(pb)
(folder/'gabarito.pdf').write_bytes(gb)
for n, page in enumerate(doc, 1):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(folder/f'{n:02}.webp', 'WEBP', quality=80, method=4)
record = {'id':'ifmt-2026-1','instituicao':'IFMT','titulo':'IFMT 2026/1 · Técnico integrado','paginas':27,'inicio':2,'total':50,'alternativas':list('ABCDE'),'gabarito':key,'fonte':'https://sites.google.com/ifmt.edu.br/provas-anteriores-ifmt/provas/ens-med-integrado/provas-2026/20261','sha256_prova':hashlib.sha256(pb).hexdigest(),'sha256_gabarito':hashlib.sha256(gb).hexdigest()}
(root/'src/data/ifmt-2026-1.json').write_text(json.dumps([record], ensure_ascii=False, indent=2)+'\n')
print('IFMT 2026/1:', len(doc), 'páginas,', len(key), 'respostas; questão 39 anulada.')
