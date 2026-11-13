#!/usr/bin/env python3
"""Extrai os cinco gabaritos do PDF oficial retificado da FUVEST 2024.

Uso: python scripts/importar-fuvest-2024.py /pasta/com/pdfs
A pasta deve conter fuvest-2024-key.pdf e fuvest-2024-{V,K,Q,X,Z}.pdf.
Requer pdftotext e pdfinfo. Revisar a saída e testar antes de publicar.
"""
import hashlib, json, re, subprocess, sys
from pathlib import Path
if len(sys.argv) != 2: raise SystemExit(__doc__)
folder=Path(sys.argv[1]); key=folder/'fuvest-2024-key.pdf'
text=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key),'-'],text=True)
if not all(f'PROVA {v}' in text for v in 'VKQXZ') or '19/11/2023' not in text or '24/11/2023' not in text:
 raise SystemExit('Documento não é o gabarito retificado esperado.')
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
 if sorted(answers)!=list(range(1,91)) or sum(len(a)==2 for a in answers.values())!=1: raise SystemExit(f'Gabarito incompleto ou dupla alternativa inesperada em {v}')
 proof=folder/f'fuvest-2024-{v}.pdf';cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(proof),'-'],text=True)
 if not re.match(rf'^\s*{v}\s',cover) or 'FUVEST 2024' not in cover: raise SystemExit(f'Capa não corresponde a {v}')
 info=subprocess.check_output(['pdfinfo',str(proof)],text=True)
 if not re.search(r'^Pages:\s*36\s*$',info,re.M): raise SystemExit(f'Número de páginas inesperado: {v}')
 result.append({'id':f'fuvest-2024-fase1-{v.lower()}','ano':2024,'fase':'1ª fase','versao':v,'gabarito':[answers[n] for n in range(1,91)],'fonte_prova':f'https://www.fuvest.br/wp-content/uploads/fuvest2024_primeira_fase_prova_{v}.pdf','fonte_gabarito':'https://www.fuvest.br/wp-content/uploads/fuvest2024_gabarito_primeira_fase_retificado_2023-11-24.pdf','sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest()})
print(json.dumps(result,ensure_ascii=False,indent=2))
