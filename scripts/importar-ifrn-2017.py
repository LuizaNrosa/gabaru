import json,re,hashlib,subprocess
import sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1];src=Path(sys.argv[1]);p=src/'prova.pdf';k=src/'gabarito.pdf';pb=p.read_bytes();kb=k.read_bytes();assert pb.startswith(b'%PDF') and kb.startswith(b'%PDF');doc=fitz.open(p);text=subprocess.check_output(['pdftotext','-layout',str(k),'-'],text=True);assert '26/2016' in text and '26/2016' in doc[0].get_text();assert re.search(r'X foram anuladas',text,re.I);lines=text.splitlines();key=[]
for i,line in enumerate(lines):
 nums=re.findall(r'\b\d+\b',line)
 if nums and [int(n) for n in nums] in [list(range(1,21)),list(range(21,41))]:
  row=next(x for x in lines[i+1:] if x.strip());v=re.findall(r'\b[A-DX]\b',row);assert len(v)==20;key+=['*' if x=='X' else x for x in v]
assert len(key)==40 and [i+1 for i,a in enumerate(key) if a=='*']==[14,33]
id='ifrn-2017';dest=root/'public/acervo'/id;dest.mkdir(parents=True,exist_ok=True);(dest/'prova.pdf').write_bytes(pb);(dest/'gabarito.pdf').write_bytes(kb)
for n,pg in enumerate(doc,1):
 pix=pg.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest/f'{n:02}.webp','WEBP',quality=80,method=4)
record=dict(id=id,instituicao='IFRN',titulo='IFRN 2017 · Técnico integrado',paginas=len(doc),inicio=2,total=40,alternativas=list('ABCD'),gabarito=key,fonte='https://portal.ifrn.edu.br/campus/reitoria/processo-seletivos-estude-no-ifrn/exame-de-selecao-2017/',sha256_prova=hashlib.sha256(pb).hexdigest(),sha256_gabarito=hashlib.sha256(kb).hexdigest())
(src/'record.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n');(src/'ifrn-2017-record.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n');print(id,'páginas',len(doc),'anuladas',[14,33],'gabarito',''.join(key))
