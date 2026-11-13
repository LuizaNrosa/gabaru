#!/usr/bin/env python3
"""Importa provas e gabaritos oficiais UERJ 2024–2025. Uso: python scripts/importar-uerj-2024-2025.py PASTA; requer pdftotext, PyMuPDF e Pillow."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1];folder=Path(sys.argv[1]);result=[]
configs=[(2025,1,'09/06/2024','https://www.vestibular.uerj.br/?page_id=14486'),(2025,2,'08/09/2024','https://www.vestibular.uerj.br/?page_id=14817'),(2024,1,'04/06/2023','https://www.vestibular.uerj.br/?page_id=13475'),(2024,2,'03/09/2023','https://www.vestibular.uerj.br/?page_id=13774')]
expected_stars={(2024,1):[29],(2024,2):[59],(2025,1):[],(2025,2):[38]}
for year,exam,date,source in configs:
 name=f'{year}-eq{exam}';p=folder/f'{name}-prova.pdf';k=folder/f'{name}-gabarito.pdf';pb=p.read_bytes();kb=k.read_bytes();assert pb.startswith(b'%PDF-') and kb.startswith(b'%PDF-')
 raw=subprocess.check_output(['pdftotext','-layout',str(k),'-'],text=True);lines=[x for x in raw.splitlines() if x.strip()];doc=fitz.open(p);cover=doc[0].get_text().lower()
 assert len(doc)==40 and date in cover and 'sessenta questões' in cover and str(year) in raw and date in raw
 # Header line followed by one row of question numbers and one row of answers.
 def answers_after(heading,n):
  i=next(i for i,line in enumerate(lines) if heading in line.upper());nums=[int(v) for v in re.findall(r'\d+',lines[i+1])]; vals=re.findall(r'\b(?:ANULADA|[A-D])\b',lines[i+2].upper());assert len(nums)==n and len(vals)==n,(heading,nums,vals);return nums,['*' if x=='ANULADA' else x for x in vals]
 nums,base=answers_after('TEXTO BASE',22);assert nums==list(range(1,23))
 nums,foreign=answers_after('ESPANHOL',15);assert nums==list(range(23,28))*3
 segments=[]
 for title,first,n in [('MATEMÁTICA',28,7),('CIÊNCIAS DA NATUREZA',35,12),('CIÊNCIAS HUMANAS',47,14)]:
  nums,values=answers_after(title,n);assert nums==list(range(first,first+n));segments+=values
 keys={lang:base+foreign[i*5:i*5+5]+segments for i,lang in enumerate(['espanhol','frances','ingles'])}
 for arr in keys.values():assert len(arr)==60 and [i+1 for i,a in enumerate(arr) if a=='*']==expected_stars[(year,exam)]
 id=f'uerj-{year}-eq{exam}';dest=root/'public/acervo'/id;dest.mkdir(parents=True,exist_ok=True);(dest/'prova.pdf').write_bytes(pb)
 for n,page in enumerate(doc,1):
  pix=page.get_pixmap(matrix=fitz.Matrix(1.6,1.6),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest/f'{n:02}.webp','WEBP',quality=80,method=4)
 result.append({'id':id,'instituicao':'UERJ','titulo':f'UERJ {year} · {exam}º Exame de Qualificação','ano':year,'paginas':len(doc),'inicio':3,'alternativas':list('ABCD'),'gabaritos':keys,'fonte':source,'sha256_prova':hashlib.sha256(pb).hexdigest(),'sha256_gabarito':hashlib.sha256(kb).hexdigest(),'prova_arquivo':p.name,'gabarito_arquivo':k.name})
 print(id,'60 questões; anuladas',expected_stars[(year,exam)])
(root/'src/data/uerj-2024-2025.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
