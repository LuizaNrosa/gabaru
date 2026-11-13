import sys
from pathlib import Path
import fitz,json,hashlib,re,subprocess
from PIL import Image
root=Path(__file__).resolve().parents[1];src=Path(sys.argv[1]);pb=(src/'prova.pdf').read_bytes();kb=(src/'gabarito.pdf').read_bytes();assert pb.startswith(b'%PDF') and kb.startswith(b'%PDF')
doc=fitz.open(stream=pb,filetype='pdf');assert len(doc)==12 and '39/2017' in doc[0].get_text();txt=subprocess.check_output(['pdftotext','-layout',str(src/'gabarito.pdf'),'-'],text=True);assert re.search('X foram anuladas',txt,re.I)
lines=txt.splitlines();key=[]
for i,line in enumerate(lines):
 nums=re.findall(r'\b\d+\b',line)
 if nums and [int(n) for n in nums] in [list(range(1,21)),list(range(21,41))]:
  row=next(x for x in lines[i+1:] if x.strip());vals=re.findall(r'\b[A-DX]\b',row);assert len(vals)==20,(row,vals);key+=['*' if v=='X' else v for v in vals]
assert len(key)==40 and [i+1 for i,v in enumerate(key) if v=='*']==[5]
id='ifrn-2018';dest=root/'public/acervo'/id;dest.mkdir(parents=True,exist_ok=True);(dest/'prova.pdf').write_bytes(pb);(dest/'gabarito.pdf').write_bytes(kb)
for n,pg in enumerate(doc,1):
 pix=pg.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest/f'{n:02}.webp','WEBP',quality=80,method=4)
r=dict(id=id,instituicao='IFRN',titulo='IFRN 2018 · Técnico integrado',paginas=len(doc),inicio=2,total=40,alternativas=list('ABCD'),gabarito=key,fonte='https://portal.ifrn.edu.br/campus/reitoria/processo-seletivos-estude-no-ifrn/exame-de-selecao-2018/',sha256_prova=hashlib.sha256(pb).hexdigest(),sha256_gabarito=hashlib.sha256(kb).hexdigest())
(src/'ifrn-2018-record.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print('OK',len(doc),'pages',len(key),'questions','annulled 5',flush=True)
