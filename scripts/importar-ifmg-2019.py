#!/usr/bin/env python3
"""Separa caderno e gabarito pós-recursos do PDF oficial do IFMG Betim."""
import sys,re,json,hashlib,subprocess
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1];src=Path(sys.argv[1]);raw=src.read_bytes();assert raw.startswith(b'%PDF');original=fitz.open(stream=raw,filetype='pdf');assert len(original)==21
answer=fitz.open();answer.insert_pdf(original,from_page=20,to_page=20);prova=fitz.open();prova.insert_pdf(original,from_page=0,to_page=19)
id='ifmg-2019-1';dest=root/'public/acervo'/id;dest.mkdir(parents=True,exist_ok=True);prova.save(dest/'prova.pdf');answer.save(dest/'gabarito.pdf');pb=(dest/'prova.pdf').read_bytes();kb=(dest/'gabarito.pdf').read_bytes();txt=subprocess.check_output(['pdftotext','-layout',str(dest/'gabarito.pdf'),'-'],text=True);assert 'PÓS RECURSOS' in txt
pairs=re.findall(r'^\s*(\d{1,2})\s+(ANULADA|[A-D])\s*$',txt,re.I|re.M);assert [int(n) for n,a in pairs]==list(range(1,51));key=['*' if v.upper()=='ANULADA' else v.upper() for n,v in pairs];assert [i+1 for i,v in enumerate(key) if v=='*']==[35]
for n,p in enumerate(prova,1):
 pix=p.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest/f'{n:02}.webp','WEBP',quality=80,method=4)
r={'id':id,'instituicao':'IFMG','titulo':'IFMG 2019.1 · Cursos técnicos','paginas':len(prova),'inicio':3,'total':50,'alternativas':list('ABCD'),'gabarito':key,'fonte':'https://www.ifmg.edu.br/betim/ingresso/arquivo-de-provas','sha256_prova':hashlib.sha256(pb).hexdigest(),'sha256_gabarito':hashlib.sha256(kb).hexdigest(),'sha256_documento_origem':hashlib.sha256(raw).hexdigest()};Path('/tmp/ifmg-2019-record.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(id,'50 questões; anulada 35')
