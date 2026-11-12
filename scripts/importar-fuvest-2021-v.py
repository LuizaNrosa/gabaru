#!/usr/bin/env python3
"""Extrai o gabarito V da primeira fase FUVEST 2021 de PDFs oficiais.

Uso: python scripts/importar-fuvest-2021-v.py /pasta/com/pdfs
Arquivos: fuvest-2021-prova.pdf e fuvest-2021-gabarito.pdf. Requer pdftotext.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
if len(sys.argv)!=2:raise SystemExit(__doc__)
folder=Path(sys.argv[1]); proof=folder/'fuvest-2021-prova.pdf'; key=folder/'fuvest-2021-gabarito.pdf'
text=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key),'-'],text=True)
if '10/01/2021' not in text or 'PROVA V' not in text:raise SystemExit('Cabeçalho inesperado')
rows=[]
for line in text.splitlines():
 pairs=re.findall(r'(\d+)\s+([A-E*])(?=\s|$)',line)
 if len(pairs)==10:rows.append(pairs)
if len(rows)!=45:raise SystemExit('Tabela inesperada')
answers={}
for row in rows:
 for number,answer in row[:2]:
  number=int(number)
  if number in answers:raise SystemExit('Questão duplicada')
  answers[number]=answer
if sorted(answers)!=list(range(1,91)) or any(x not in 'ABCDE' for x in answers.values()):raise SystemExit('Gabarito incompleto ou com marcação especial')
cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(proof),'-'],text=True)
if 'FUVEST 2021' not in cover or not re.search(r'\bV\b',cover):raise SystemExit('Capa inesperada')
item={'id':'fuvest-2021-fase1-v','ano':2021,'fase':'1ª fase','versao':'V','gabarito':[answers[n] for n in range(1,91)],'fonte_prova':'https://www.fuvest.br/wp-content/uploads/fuvest_2021_primeira_fase.pdf','fonte_gabarito':'https://www.fuvest.br/wp-content/uploads/fuvest_2021_primeira_fase_gabarito_v2.pdf','sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest()}
print(json.dumps([item],ensure_ascii=False,indent=2))
