#!/usr/bin/env python3
"""Importa os cadernos V, K, Q, X e Z da FUVEST 2022 e o gabarito retificado.

Uso: python scripts/importar-fuvest-2022-vk.py /pasta/com/pdfs
Arquivos: fuvest-2022-key.pdf, fuvest-2022-V.pdf e fuvest-2022-K.pdf.
Requer pdftotext e pdfinfo; a saída deve ser revisada antes da publicação.
"""
import hashlib, json, re, subprocess, sys
from pathlib import Path
if len(sys.argv)!=2: raise SystemExit(__doc__)
folder=Path(sys.argv[1]); key=folder/'fuvest-2022-key.pdf'
text=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key),'-'],text=True)
if '12/12/2021' not in text or '15/12/2021' not in text or 'Questão anulada' not in text:
 raise SystemExit('Cabeçalho ou retificação não encontrados')
rows=[]
for line in text.splitlines():
 pairs=re.findall(r'(\d+)\s+([A-E*])(?=\s|$)',line)
 if len(pairs)==10: rows.append(pairs)
if len(rows)!=45:raise SystemExit('Tabela inesperada')
result=[]
for i,v in enumerate('VKQXZ'):
 answers={}
 for row in rows:
  for n,a in row[2*i:2*i+2]:
   n=int(n)
   if n in answers:raise SystemExit('Questão repetida')
   answers[n]=a
 expected={'V':54,'K':90,'Q':7,'X':38,'Z':88}[v]
 if sorted(answers)!=list(range(1,91)) or [n for n,a in answers.items() if a=='*']!=[expected]:raise SystemExit(f'Gabarito incompleto ou anulação inesperada em {v}')
 proof=folder/f'fuvest-2022-{v}.pdf';cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(proof),'-'],text=True)
 if not re.match(rf'^\s*{v}\s',cover) or 'FUVEST 2022' not in cover:raise SystemExit(f'Capa incorreta: {v}')
 info=subprocess.check_output(['pdfinfo',str(proof)],text=True)
 if not re.search(r'^Pages:\s*26\s*$',info,re.M):raise SystemExit(f'Número de páginas inesperado: {v}')
 result.append({'id':f'fuvest-2022-fase1-{v.lower()}','ano':2022,'fase':'1ª fase','versao':v,'gabarito':[answers[n] for n in range(1,91)],'fonte_prova':f'https://www.fuvest.br/wp-content/uploads/fuvest_2022_primeira_fase_tipo_{v}.pdf','fonte_gabarito':'https://www.fuvest.br/wp-content/uploads/fuvest_2022_primeira_fase_gabarito_retificado.pdf','sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest()})
print(json.dumps(result,ensure_ascii=False,indent=2))
