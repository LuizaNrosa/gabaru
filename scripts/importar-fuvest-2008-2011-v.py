#!/usr/bin/env python3
"""Importa provas V FUVEST 2008–2011. Uso: python scripts/importar-fuvest-2008-2011-v.py /pasta/com/pdfs.
Requer PDFs fuvest-ANO-V.pdf e fuvest-ANO-key.pdf, pdftotext e pdfinfo.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
if len(sys.argv)!=2:raise SystemExit(__doc__)
folder=Path(sys.argv[1]);result=[]
for year,pages,date in [(2008,22,'25/11/2007'),(2009,22,'23/11/2008'),(2010,22,'22/11/2009'),(2011,24,'28/11/2010')]:
 proof=folder/f'fuvest-{year}-V.pdf';key=folder/f'fuvest-{year}-key.pdf'
 text=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key),'-'],text=True)
 if date not in text or f'FUVEST {year}' not in text:raise SystemExit(f'Gabarito inesperado: {year}')
 if year==2010:
  rows=[re.findall(r'\b(?:[A-E]|\d{1,2})\b',l) for l in text.splitlines()];rows=[r for r in rows if len(r)==12 and r[0] in 'ABCDE' and r[6] in 'ABCDE']
  if len(rows)!=45:raise SystemExit('Tabela 2010 inesperada')
  pairs=[(r[i+1],r[i]) for r in rows for i in (0,6)]
 else:
  if 'PROVA V' not in text:raise SystemExit('Versão ausente')
  pairs=re.findall(r'\bV\s*(\d{1,2})\s*[‐\-–]\s*(ANULADA|[A-E*])',text,re.I)
 answers={}
 for n,a in pairs:
  n=int(n);a=a.upper()
  if n in answers:raise SystemExit(f'Questão duplicada: {year} {n}')
  answers[n]='*' if a=='ANULADA' else a
 if sorted(answers)!=list(range(1,91)) or any(a not in 'ABCDE' for a in answers.values()):raise SystemExit(f'Gabarito incompleto ou marcação especial inesperada: {year}')
 info=subprocess.check_output(['pdfinfo',str(proof)],text=True,stderr=subprocess.DEVNULL)
 if not re.search(rf'^Pages:\s*{pages}\s*$',info,re.M):raise SystemExit(f'Páginas inesperadas: {year}')
 cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(proof),'-'],text=True,stderr=subprocess.DEVNULL)
 if not re.search(r'\bV\b',cover):raise SystemExit(f'Versão não identificada: {year}')
 prefix=f'https://www.fuvest.br/wp-content/uploads/fuvest_{year}_1fase_prova_'
 result.append({'id':f'fuvest-{year}-fase1-v','ano':year,'fase':'1ª fase','versao':'V','gabarito':[answers[n] for n in range(1,91)],'fonte_prova':prefix+'V.pdf','fonte_gabarito':prefix+'gab.pdf','sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest()})
print(json.dumps(result,ensure_ascii=False,indent=2))
