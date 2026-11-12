#!/usr/bin/env python3
"""Importa provas V da FUVEST 2018 e 2019 e gabaritos oficiais.

Uso: python scripts/importar-fuvest-2018-2019-v.py /pasta/com/pdfs
Arquivos: fuvest-2018-V.pdf, fuvest-2018-key.pdf, fuvest-2019-V.pdf e
fuvest-2019-key.pdf. Requer pdftotext e pdfinfo. Revisar antes de publicar.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
if len(sys.argv)!=2:raise SystemExit(__doc__)
folder=Path(sys.argv[1]); result=[]
for year,pages in [(2018,28),(2019,25)]:
 proof=folder/f'fuvest-{year}-V.pdf';key=folder/f'fuvest-{year}-key.pdf'
 text=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key),'-'],text=True)
 if f'FUVEST {year}' not in text or 'PROVA V' not in text:raise SystemExit(f'Gabarito inesperado: {year}')
 rows=[]
 for line in text.splitlines():
  pairs=re.findall(r'(\d+)\s*[‐\-–]\s*([A-E*])',line)
  if len(pairs)==10:rows.append(pairs)
 if len(rows)!=45:raise SystemExit(f'Tabela inesperada: {year}')
 answers={}
 for row in rows:
  for number,answer in row[:2]:
   number=int(number)
   if number in answers:raise SystemExit('Questão duplicada')
   answers[number]=answer
 if sorted(answers)!=list(range(1,91)) or any(x not in 'ABCDE' for x in answers.values()):raise SystemExit(f'Gabarito incompleto ou marcação especial: {year}')
 cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(proof),'-'],text=True,stderr=subprocess.DEVNULL)
 if not re.search(r'\bV\b',cover):raise SystemExit(f'Versão não identificada: {year}')
 info=subprocess.check_output(['pdfinfo',str(proof)],text=True,stderr=subprocess.DEVNULL)
 if not re.search(rf'^Pages:\s*{pages}\s*$',info,re.M):raise SystemExit(f'Páginas inesperadas: {year}')
 proofurl='https://www.fuvest.br/wp-content/uploads/'+('fuv2018_1fase_prova_V.pdf' if year==2018 else 'fuvest_2019_primeira_fase.pdf')
 keyurl='https://www.fuvest.br/wp-content/uploads/'+('fuv2018_1fase_prova_gab.pdf' if year==2018 else 'fuv2019.gabarito.oficial.pdf')
 result.append({'id':f'fuvest-{year}-fase1-v','ano':year,'fase':'1ª fase','versao':'V','gabarito':[answers[n] for n in range(1,91)],'fonte_prova':proofurl,'fonte_gabarito':keyurl,'sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest()})
print(json.dumps(result,ensure_ascii=False,indent=2))
