#!/usr/bin/env python3
"""Importa IFRN 2015 usando prova.pdf e gabarito.pdf no diretório indicado."""
import fitz,json,re,hashlib,subprocess,sys
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1];src=Path(sys.argv[1]);pb=(src/'prova.pdf').read_bytes();kb=(src/'gabarito.pdf').read_bytes();assert pb[:4]==b'%PDF' and kb[:4]==b'%PDF'
doc=fitz.open(stream=pb,filetype='pdf');text=subprocess.check_output(['pdftotext','-layout',str(src/'gabarito.pdf'),'-'],text=True);assert '23/2014' in text and 'foi anulada' in text and 'Retificado 01' in text
lines=text.splitlines();key=[]
for i,line in enumerate(lines):
 nums=re.findall(r'\b\d+\b',line)
 if nums and [int(x) for x in nums] in [list(range(1,21)),list(range(21,41))]:
  row=next(x for x in lines[i+1:] if x.strip());v=re.findall(r'\b[A-DX]\b',row);assert len(v)==20;key.extend('*' if x=='X' else x for x in v)
assert len(key)==40 and [i+1 for i,x in enumerate(key) if x=='*']==[22];assert '23/2014' in doc[0].get_text();assert len(doc)==11
out=root/'public/acervo/ifrn-2015';out.mkdir(parents=True,exist_ok=True);(out/'prova.pdf').write_bytes(pb);(out/'gabarito.pdf').write_bytes(kb)
for n,pg in enumerate(doc,1):
 pix=pg.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/f'{n:02}.webp','WEBP',quality=80,method=4)
record={'id':'ifrn-2015','instituicao':'IFRN','titulo':'IFRN 2015 · Técnico integrado','paginas':len(doc),'inicio':2,'total':40,'alternativas':list('ABCD'),'gabarito':key,'fonte':'https://portal.ifrn.edu.br/campus/reitoria/processo-seletivos-estude-no-ifrn/exame-de-selecao-2015/','sha256_prova':hashlib.sha256(pb).hexdigest(),'sha256_gabarito':hashlib.sha256(kb).hexdigest()}
print(json.dumps(record,ensure_ascii=False,indent=2))
