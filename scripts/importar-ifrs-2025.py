#!/usr/bin/env python3
"""Gera o acervo IFRS 2025/1 a partir dos dois PDFs oficiais previamente obtidos."""
import hashlib, json, re, subprocess, sys
from pathlib import Path
import fitz
from PIL import Image

root = Path(__file__).resolve().parents[1]
origem = Path(sys.argv[1])
prova = origem / 'prova.pdf'
gabarito = origem / 'gabarito.pdf'
pb, gb = prova.read_bytes(), gabarito.read_bytes()
assert pb.startswith(b'%PDF') and gb.startswith(b'%PDF')
# SHA da publicação IFRS expressamente rotulada como gabarito definitivo.
assert hashlib.sha256(gb).hexdigest() == '1be8d89767652aa68357f5f70c11fef956d17c1f30081a6eb69ad9cfa7192882'
doc = fitz.open(prova)
assert len(doc) == 20
texto = subprocess.check_output(['pdftotext', '-layout', str(gabarito), '-'], text=True)
assert 'GABARITO PROVA CURSOS INTEGRADOS PS 2025/1' in texto
pares = re.findall(r'\b(\d{1,2})\)\s*(ANULADA|[A-E])\b', texto)
dados = {int(num): ('*' if letra == 'ANULADA' else letra) for num, letra in pares}
assert sorted(dados) == list(range(1, 41)) and dados[28] == '*'
assert [n for n, letra in dados.items() if letra == '*'] == [28]
dest = root / 'public/acervo/ifrs-2025-1'
dest.mkdir(parents=True, exist_ok=True)
(dest / 'prova.pdf').write_bytes(pb)
(dest / 'gabarito.pdf').write_bytes(gb)
for n, pg in enumerate(doc, 1):
    pix = pg.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(dest / f'{n:02}.webp', 'WEBP', quality=80, method=4)
registro = {
    'id': 'ifrs-2025-1', 'instituicao': 'IFRS', 'titulo': 'IFRS 2025/1 · Técnico integrado',
    'paginas': len(doc), 'inicio': 2, 'total': 40, 'alternativas': list('ABCDE'),
    'gabarito': [dados[n] for n in range(1, 41)],
    'fonte': 'https://ingresso.ifrs.edu.br/2025/publicacoes/gabarito-definitivo/',
    'sha256_prova': hashlib.sha256(pb).hexdigest(), 'sha256_gabarito': hashlib.sha256(gb).hexdigest(),
}
(root / 'src/data/ifrs-2025-1.json').write_text(json.dumps([registro], ensure_ascii=False, indent=2) + '\n')
print('IFRS 2025/1:', len(doc), 'páginas; 40 questões; 28 anulada no gabarito definitivo; correção automática.')
