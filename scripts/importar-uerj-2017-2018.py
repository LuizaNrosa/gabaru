#!/usr/bin/env python3
"""Importa quatro cadernos e gabaritos UERJ disponíveis na fonte oficial."""
import hashlib,json,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1]; source=Path(sys.argv[1]); results=[]
configs=[(2018,1,'16/07/2017',7069),(2018,2,'17/09/2017',7069),(2017,1,'12/06/2016',7069),(2017,2,'16/10/2016',7069)]
for year,edition,date,page in configs:
 name=f'{year}-eq{edition}';p=source/f'{name}-prova.pdf';k=source/f'{name}-gabarito.pdf'; pb=p.read_bytes();kb=k.read_bytes();assert pb.startswith(b'%PDF-') and kb.startswith(b'%PDF-')
 doc=fitz.open(p);key=fitz.open(k); assert len(doc)==40 and len(key)==1 and date in doc[0].get_text() and date in key[0].get_text()
 words=key[0].get_text('words');columns=[[],[],[],[]]
 for x,y,_,_,n,*rest in words:
  if not n.isdigit() or not 1<=int(n)<=60 or y<240:continue
  options=[v for v in words if v[4] in ('A','B','C','D','ANULADA') and abs(v[1]-y)<3 and 10<v[0]-x<60]
  if not options:continue
  column=0 if x<180 else 1 if x<300 else 2 if x<430 else 3
  columns[column].append((round(y,1),int(n),('*' if min(options,key=lambda v:v[0])[4]=='ANULADA' else min(options,key=lambda v:v[0])[4])))
 for col in columns:col.sort()
 start={(2017,1):17,(2017,2):17,(2018,1):26,(2018,2):25}[(year,edition)]; split=41 if year==2017 else 46
 assert [n for _,n,_ in columns[0]]==list(range(1,start))
 assert [n for _,n,_ in columns[1]]==list(range(start,start+5))*3
 assert [n for _,n,_ in columns[2]]==list(range(start+5,split))
 assert [n for _,n,_ in columns[3]]==list(range(split,61))
 plain=[v for _,_,v in columns[0]];tail=[v for _,_,v in columns[2]+columns[3]];foreign=[v for _,_,v in columns[1]]
 keys={language:plain+foreign[i*5:i*5+5]+tail for i,language in enumerate(['espanhol','frances','ingles'])}
 assert all(len(v)==60 for v in keys.values())
 id='uerj-'+name;dest=root/'public/acervo'/id;dest.mkdir(parents=True,exist_ok=True);(dest/'prova.pdf').write_bytes(pb)
 for n,pg in enumerate(doc,1):
  pix=pg.get_pixmap(matrix=fitz.Matrix(1.6,1.6),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest/f'{n:02}.webp','WEBP',quality=80,method=4)
 results.append({'id':id,'instituicao':'UERJ','titulo':f'UERJ {year} · {edition}º Exame de Qualificação','ano':year,'paginas':len(doc),'inicio':3,'alternativas':list('ABCD'),'gabaritos':keys,'lingua_inicio':start,'lingua_fim':start+4,'fonte':f'https://www.vestibular.uerj.br/?page_id={page}','sha256_prova':hashlib.sha256(pb).hexdigest(),'sha256_gabarito':hashlib.sha256(kb).hexdigest(),'prova_arquivo':p.name,'gabarito_arquivo':k.name})
 print(id,'60 questões',flush=True)
(root/'src/data/uerj-2017-2018.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
