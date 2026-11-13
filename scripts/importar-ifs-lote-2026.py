#!/usr/bin/env python3
"""Importa os quatro cadernos a partir dos PDFs obtidos nas fontes documentadas."""
import json,re,hashlib,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1];src=Path(sys.argv[1]);records=[]
configs=[('ifmg26','ifmg-2026-1','IFMG 2026.1 · Técnico integrado',48,'ABCD','https://www.ifmg.edu.br/portal/processo-seletivo/processos-seletivos-anteriores-1'),('ifce25','ifce-fortaleza-caucaia-2025-1','IFCE Fortaleza e Caucaia 2025.1 · Técnico integrado',45,'ABCDE','https://portal.ifce.edu.br/documents/10/Gabarito_Oficial_-_Integrados.pdf'),('ifrn25','ifrn-2025','IFRN 2025 · Técnico integrado',40,'ABCD','https://portal.ifrn.edu.br/campus/reitoria/processo-seletivos-estude-no-ifrn/exame-de-selecao-2025/'),('ifrn22','ifrn-2022','IFRN 2022 · Técnico integrado',40,'ABCD','https://portal.ifrn.edu.br/campus/reitoria/processo-seletivos-estude-no-ifrn/exame-de-selecao-2022/')]
for prefix,id,title,total,letters,source in configs:
 p=src/f'{prefix}-prova.pdf';k=src/f'{prefix}-gabarito.pdf';pb=p.read_bytes();kb=k.read_bytes();assert pb.startswith(b'%PDF') and kb.startswith(b'%PDF');doc=fitz.open(p);txt=subprocess.check_output(['pdftotext','-layout',str(k),'-'],text=True);key=None
 if prefix=='ifmg26':
  pairs=re.findall(r'\s(\d{1,2})\s+(ANULADA|[A-D])\s*$',txt,re.I|re.M);assert [int(n) for n,_ in pairs]==list(range(1,49));key=['*' if a.upper()=='ANULADA' else a.upper() for _,a in pairs];assert [i+1 for i,x in enumerate(key) if x=='*']==[22,39,47]
 if prefix=='ifrn22':
  part=txt.split('Gabarito Definitivo',1)[1];pairs=re.findall(r'^\s*(\d{1,2})\s+([A-D])\s*$',part,re.M);assert [int(n) for n,_ in pairs]==list(range(1,41));key=[a for _,a in pairs]
 if prefix=='ifrn25':
  rows=txt.splitlines();pairs=[]
  for idx,line in enumerate(rows):
   numbers=re.findall(r'\b\d+\b',line)
   if numbers and [int(n) for n in numbers] in [list(range(1,21)),list(range(21,41))]:
    subsequent=next(x for x in rows[idx+1:] if x.strip());vals=re.findall(r'\b[A-D]\b',subsequent);assert len(vals)==20;pairs+=vals
  assert len(pairs)==40;key=pairs
 dest=root/'public/acervo'/id;dest.mkdir(parents=True,exist_ok=True);(dest/'prova.pdf').write_bytes(pb);(dest/'gabarito.pdf').write_bytes(kb)
 for n,pg in enumerate(doc,1):
  pix=pg.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest/f'{n:02}.webp','WEBP',quality=80,method=4)
 records.append(dict(id=id,instituicao=prefix[:4].upper(),titulo=title,paginas=len(doc),inicio=3 if prefix=='ifmg26' else 2,total=total,alternativas=list(letters),gabarito=key,fonte=source,sha256_prova=hashlib.sha256(pb).hexdigest(),sha256_gabarito=hashlib.sha256(kb).hexdigest()))
 print(id,len(doc),'paginas', 'correcao automatica' if key else 'conferencia manual',flush=True)
(root/'src/data/ifs-lote-2026.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
