#!/usr/bin/env python3
"""Importa gabaritos V FUVEST 2016 e 2017 de PDFs oficiais.
Uso: python scripts/importar-fuvest-2016-2017-v.py /pasta/com/pdfs
Arquivos: fuvest-2016-V.pdf, fuvest-2016-key.pdf, fuvest-2017-V.pdf e
fuvest-2017-key.pdf. Requer pdftotext e pdfinfo.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
if len(sys.argv)!=2:raise SystemExit(__doc__)
folder=Path(sys.argv[1]);result=[]
for year,pages,date in [(2016,30,'29/11/2015'),(2017,28,'27/11/2016')]:
 proof=folder/f'fuvest-{year}-V.pdf';key=folder/f'fuvest-{year}-key.pdf'
 text=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key),'-'],text=True)
 if date not in text or 'PROVA V' not in text:raise SystemExit(f'Gabarito inesperado: {year}')
 pairs=re.findall(r'\bV\s*(\d{1,2})\s*[‐\-–]\s*([A-E*])',text);answers={}
 for n,a in pairs:
  n=int(n)
  if n in answers:raise SystemExit('Questão duplicada')
  answers[n]=a
 if sorted(answers)!=list(range(1,91)) or any(a not in 'ABCDE' for a in answers.values()):raise SystemExit(f'Gabarito incompleto ou com marcação especial: {year}')
 info=subprocess.check_output(['pdfinfo',str(proof)],text=True,stderr=subprocess.DEVNULL)
 if not re.search(rf'^Pages:\s*{pages}\s*$',info,re.M):raise SystemExit(f'Número de páginas inesperado: {year}')
 cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(proof),'-'],text=True,stderr=subprocess.DEVNULL)
 if not re.search(r'\bV\b',cover):raise SystemExit(f'Versão não identificada: {year}')
 prefix=f'https://www.fuvest.br/wp-content/uploads/fuvest_{year}_1fase_prova_'
 result.append({'id':f'fuvest-{year}-fase1-v','ano':year,'fase':'1ª fase','versao':'V','gabarito':[answers[n] for n in range(1,91)],'fonte_prova':prefix+'V.pdf','fonte_gabarito':prefix+'gab.pdf','sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest()})
print(json.dumps(result,ensure_ascii=False,indent=2))
