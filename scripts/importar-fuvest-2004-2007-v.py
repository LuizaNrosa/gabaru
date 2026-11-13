#!/usr/bin/env python3
"""Importa provas V FUVEST 2004–2007. Uso: python scripts/importar-fuvest-2004-2007-v.py /pasta/com/pdfs.
Requer PDFs fuvest-ANO-V.pdf e fuvest-ANO-key.pdf (exceto 2004, cujo gabarito está no próprio caderno), pdftotext e pdfinfo.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
if len(sys.argv)!=2:raise SystemExit(__doc__)
folder=Path(sys.argv[1]);result=[]
for year,pages,total in [(2004,17,100),(2005,16,100),(2006,18,100),(2007,22,90)]:
 proof=folder/f'fuvest-{year}-V.pdf';key=proof if year==2004 else folder/f'fuvest-{year}-key.pdf'
 keypage='17' if year==2004 else '1'
 text=subprocess.check_output(['pdftotext','-f',keypage,'-l',keypage,'-layout',str(key),'-'],text=True)
 if year==2004:
  if '30/11/2003' not in text or 'PROVA V' not in text:raise SystemExit('Gabarito 2004 inesperado')
  rows=[re.findall(r'(\d+)\s*[‐\-–]\s*([A-E*])',l) for l in text.splitlines()];rows=[r for r in rows if len(r)==10]
  if len(rows)!=50:raise SystemExit('Tabela 2004 inesperada')
  pairs=[(n,a) for r in rows for n,a in r[:2]]
 else:
  rows=[re.findall(r'\b(?:[A-E]|\d{1,3})\b',l) for l in text.splitlines()];rows=[r for r in rows if len(r)==12 and r[0] in 'ABCDE' and r[6] in 'ABCDE']
  if len(rows)!=total//2:raise SystemExit(f'Tabela inesperada {year}: {len(rows)}')
  pairs=[(r[i+1],r[i]) for r in rows for i in (0,6)]
 answers={}
 for n,a in pairs:
  n=int(n)
  if n in answers:raise SystemExit(f'Questão duplicada: {year} {n}')
  answers[n]=a
 if sorted(answers)!=list(range(1,total+1)) or any(a not in 'ABCDE' for a in answers.values()):raise SystemExit(f'Gabarito incompleto: {year}')
 info=subprocess.check_output(['pdfinfo',str(proof)],text=True,stderr=subprocess.DEVNULL)
 if not re.search(rf'^Pages:\s*{pages}\s*$',info,re.M):raise SystemExit(f'Páginas inesperadas: {year}')
 cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(proof),'-'],text=True,stderr=subprocess.DEVNULL)
 if not re.search(r'\bV\b',cover):raise SystemExit(f'Versão não identificada: {year}')
 base='https://www.fuvest.br/wp-content/uploads/'
 prova={2004:'fuvest_2004_prova_primeira_fase.pdf',2005:'fuvest_2005_prova_primeira_fase.pdf',2006:'fuvest_2006_1fase_prova_V.pdf',2007:'fuvest_2007_1fase_prova_V.pdf'}[year]
 gab={2004:prova,2005:'fuvest_2005_1fase_gab_1.pdf',2006:'fuvest_2006_1fase_prova_gab.pdf',2007:'fuvest_2007_1fase_prova_gab.pdf'}[year]
 result.append({'id':f'fuvest-{year}-fase1-v','ano':year,'fase':'1ª fase','versao':'V','gabarito':[answers[n] for n in range(1,total+1)],'fonte_prova':base+prova,'fonte_gabarito':base+gab,'sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest()})
print(json.dumps(result,ensure_ascii=False,indent=2))
