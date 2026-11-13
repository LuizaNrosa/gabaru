#!/usr/bin/env python3
"""Extrai os cinco gabaritos do PDF oficial da FUVEST 2023.

Uso: python scripts/importar-fuvest-2023.py /pasta/com/pdfs
A pasta deve conter fuvest-2023-key.pdf e fuvest-2023-{V,K,Q,X,Z}.pdf.
Requer pdftotext e pdfinfo. Revisar a saída e testar antes de publicar.
"""
import hashlib, json, re, subprocess, sys
from pathlib import Path
if len(sys.argv) != 2: raise SystemExit(__doc__)
folder=Path(sys.argv[1]); key=folder/'fuvest-2023-key.pdf'
text=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key),'-'],text=True)
if not all(f'PROVA {v}' in text for v in 'VKQXZ') or '04/12/2022' not in text:
 raise SystemExit('Documento não é o gabarito esperado.')
rows=[]
for line in text.splitlines():
 pairs=re.findall(r'(\d+)\s+([A-E](?:\s*[A-E])?)(?=\s|$)',line)
 if len(pairs)==10: rows.append(pairs)
if len(rows)!=45: raise SystemExit(f'Quantidade inesperada de linhas: {len(rows)}')
result=[]
for i,v in enumerate('VKQXZ'):
 answers={}
 for row in rows:
  for n,a in row[2*i:2*i+2]:
   num=int(n);answer=''.join(a.split())
   if num in answers or not re.fullmatch('[A-E]{1,2}',answer) or len(set(answer)) != len(answer): raise SystemExit('Resposta inválida')
   answers[num]=answer
 if sorted(answers)!=list(range(1,91)) or sum(len(a)==2 for a in answers.values())!=0: raise SystemExit(f'Gabarito incompleto ou múltipla alternativa inesperada em {v}')
 proof=folder/f'fuvest-2023-{v}.pdf';cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(proof),'-'],text=True)
 if not re.match(rf'^\s*{v}\s',cover) or 'FUVEST 2023' not in cover: raise SystemExit(f'Capa não corresponde a {v}')
 info=subprocess.check_output(['pdfinfo',str(proof)],text=True)
 if not re.search(r'^Pages:\s*28\s*$',info,re.M): raise SystemExit(f'Número de páginas inesperado: {v}')
 result.append({'id':f'fuvest-2023-fase1-{v.lower()}','ano':2023,'fase':'1ª fase','versao':v,'gabarito':[answers[n] for n in range(1,91)],'fonte_prova':f'https://www.fuvest.br/wp-content/uploads/fuvest2023_primeira_fase_prova_{v}.pdf','fonte_gabarito':'https://www.fuvest.br/wp-content/uploads/fuvest2023_gabarito_primeira_fase.pdf','sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest()})
print(json.dumps(result,ensure_ascii=False,indent=2))
