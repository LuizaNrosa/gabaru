import json,re,hashlib,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path.cwd();src=Path(sys.argv[1]); records=[]
configs=[('ifrn','ifrn-2023','IFRN 2023 · Técnico integrado',40,'ABCD','https://portal.ifrn.edu.br/campus/reitoria/processo-seletivos-estude-no-ifrn/exame-de-selecao-2023/'),('ifce','ifce-fortaleza-2023-2','IFCE Fortaleza 2023.2 · Técnico integrado',45,'ABCDE','https://funetec.org.br/index.php?vars=noticias%2Fver%2F529'),('ifmg','ifmg-2023-1','IFMG 2023.1 · Cursos técnicos',50,'ABCD','https://www.ifmg.edu.br/portal/processo-seletivo/processos-seletivos-anteriores-1')]
for prefix,id,title,total,letters,source in configs:
 p=src/f'{prefix}-prova.pdf';k=src/f'{prefix}-gabarito.pdf';pb=p.read_bytes();kb=k.read_bytes();assert pb.startswith(b'%PDF') and kb.startswith(b'%PDF');doc=fitz.open(p); key=None
 if prefix.startswith('ifmg'):
  text=subprocess.check_output(['pdftotext','-layout',str(k),'-'],text=True); matches=re.findall(r'\s(\d{1,2})\s+(anulada|[A-D])\s*$',text,re.I|re.M);assert [int(n) for n,_ in matches]==list(range(1,51)),(prefix,len(matches));key=['*' if a.lower()=='anulada' else a.upper() for _,a in matches]
  assert [i+1 for i,x in enumerate(key) if x=='*']==[28,46]
 dest=root/'public/acervo'/id;dest.mkdir(parents=True,exist_ok=True);(dest/'prova.pdf').write_bytes(pb);(dest/'gabarito.pdf').write_bytes(kb)
 for n,pg in enumerate(doc,1):
  pix=pg.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest/f'{n:02}.webp','WEBP',quality=80,method=4)
 records.append(dict(id=id,instituicao=('IFMG' if prefix=='ifmg25' else prefix.upper()),titulo=title,paginas=len(doc),inicio=3 if prefix.startswith("ifmg") else 2,total=total,alternativas=list(letters),gabarito=key,fonte=source,sha256_prova=hashlib.sha256(pb).hexdigest(),sha256_gabarito=hashlib.sha256(kb).hexdigest()))
 print(id,len(doc),'paginas', 'correcao automatica' if key else 'conferencia manual',flush=True)
(root/'src/data/ifs-2023.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
