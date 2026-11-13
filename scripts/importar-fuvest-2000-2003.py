#!/usr/bin/env python3
"""Importa cadernos oficiais de FUVEST 2000–2003, excluindo 2001/2 em conferência.
Uso: python scripts/importar-fuvest-2000-2003.py /pasta/com/pdfs
Requer PDFs fuvest-ANO-dDIA.pdf, fuvest-2000-gDIA.pdf e fuvest-2003-V.pdf,
pdftotext e pdfinfo. PDFs de 2001–2003 contêm gabarito anexo.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
if len(sys.argv)!=2:raise SystemExit(__doc__)
folder=Path(sys.argv[1]);result=[]
for year,day,version,pdfpages,visible,start in [(2000,1,'V',15,15,1),(2000,2,'T',15,15,1),(2001,1,'V',17,16,2),(2002,1,'V',18,16,2),(2002,2,'T',18,16,2),(2003,0,'V',17,16,2)]:
 proof=folder/(f'fuvest-{year}-d{day}.pdf' if day else f'fuvest-{year}-V.pdf')
 key=folder/f'fuvest-2000-g{day}.pdf' if year==2000 else proof
 text=subprocess.check_output(['pdftotext','-layout',str(key),'-'],text=True,stderr=subprocess.DEVNULL)
 if year==2000:
  if f'FUVEST {year}' not in text or f'GRUPO {version}' not in text:raise SystemExit(f'Cabeçalho incorreto {year}/{day}')
  rows=[]
  for line in text.splitlines():
   m=re.match(r'^\s*([A-E])\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s*$',line)
   if m:rows.append(m.groups())
  pairs=[(r[1],r[0]) for r in rows]
 else:
  part=text[text.upper().find('GABARITO'):]
  pairs=re.findall(rf'\b{version}\s*(\d{{1,3}})\s*[‐\-–]\s*(ANULADA|[A-E*])',part,re.I)
 answers={}
 for number,answer in pairs:
  number=int(number);answer=answer.upper()
  if number in answers:raise SystemExit(f'Questão duplicada {year}/{day}: {number}')
  answers[number]='*' if answer=='ANULADA' else answer
 total=100 if year==2003 else 80
 if sorted(answers)!=list(range(1,total+1)) or any(a not in 'ABCDE' for a in answers.values()):raise SystemExit(f'Gabarito incompleto ou marcação especial {year}/{day}')
 info=subprocess.check_output(['pdfinfo',str(proof)],text=True,stderr=subprocess.DEVNULL)
 if not re.search(rf'^Pages:\s*{pdfpages}\s*$',info,re.M):raise SystemExit(f'Páginas inesperadas {year}/{day}')
 source=f'https://www.fuvest.br/wp-content/uploads/fuvest_{year}_prova_primeira_fase'+(f'_dia_{day}.pdf' if day else '.pdf')
 keyurl=f'https://www.fuvest.br/wp-content/uploads/fuvest_2000_1fase_gab_{day}.pdf' if year==2000 else source
 result.append({'id':f'fuvest-{year}-fase1-'+(f'exame{day}-' if day else '')+version.lower(),'ano':year,'fase':'1ª fase','versao':version,'exame':day,'pagina_inicial':start,'gabarito':[answers[n] for n in range(1,total+1)],'fonte_prova':source,'fonte_gabarito':keyurl,'sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest(),'paginas_prova':visible})
print(json.dumps(result,ensure_ascii=False,indent=2))
