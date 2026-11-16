#!/usr/bin/env python3
"""Importa quatro cadernos e valida as respostas nos gabaritos oficiais."""
import json,re,hashlib,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1];src=Path(sys.argv[1]);records=[]
configs=[('ifrn26','ifrn-2026','IFRN 2026 · Técnico integrado',40,'ABCD','https://portal.ifrn.edu.br/campus/reitoria/processo-seletivos-estude-no-ifrn/exame-de-selecao-2026/',[37]),('ifrn20','ifrn-2020','IFRN 2020 · Técnico integrado',40,'ABCD','https://portal.ifrn.edu.br/campus/reitoria/processo-seletivos-estude-no-ifrn/exame-de-selecao-2020/',[7,26]),('ifrn19','ifrn-2019','IFRN 2019 · Técnico integrado',40,'ABCD','https://portal.ifrn.edu.br/campus/reitoria/processo-seletivos-estude-no-ifrn/exame-de-selecao-2019/',[11]),('ifmg20','ifmg-2020-1','IFMG 2020.1 · Cursos técnicos',50,'ABCD','https://www.ifmg.edu.br/portal/processo-seletivo/processos-anteriores-1/provas-2020-1',[])]
for prefix,id,title,total,letters,source,annulled in configs:
 p=src/f'{prefix}-prova.pdf';k=src/f'{prefix}-gabarito.pdf';pb=p.read_bytes();kb=k.read_bytes();assert pb.startswith(b'%PDF') and kb.startswith(b'%PDF');doc=fitz.open(p);txt=subprocess.check_output(['pdftotext','-layout',str(k),'-'],text=True)
 if prefix=='ifmg20':
  pairs=re.findall(r'^\s*(\d{1,2})\s+([A-D])\s*$',txt,re.M);assert [int(n) for n,_ in pairs]==list(range(1,total+1));key=[a for _,a in pairs]
 elif prefix=='ifrn26':
  pairs=[]
  for line in txt.splitlines():
   m=re.fullmatch(r'\s*(\d{1,2})\s+([A-DX])\s+(\d{1,2})\s+([A-DX])\s*',line)
   if m:pairs.extend([(int(m[1]),m[2]),(int(m[3]),m[4])])
  pairs.sort();assert [n for n,_ in pairs]==list(range(1,total+1));assert re.search(r'X\s*=\s*QUESTÃO ANULADA',txt,re.I);key=['*' if a=='X' else a for _,a in pairs]
 else:
  assert re.search(r'X\s*(?:=|\()\s*questão anulada',txt,re.I);lines=txt.splitlines();key=[]
  for idx,line in enumerate(lines):
   nums=re.findall(r'\b\d+\b',line)
   if nums and [int(n) for n in nums] in [list(range(1,21)),list(range(21,41))]:
    row=next(x for x in lines[idx+1:] if x.strip());vals=re.findall(r'\b[A-DX]\b',row);assert len(vals)==20,(prefix,row,vals);key+=['*' if v=='X' else v for v in vals]
  assert len(key)==40
 assert [i+1 for i,a in enumerate(key) if a=='*']==annulled,(prefix,key)
 dest=root/'public/acervo'/id;dest.mkdir(parents=True,exist_ok=True);(dest/'prova.pdf').write_bytes(pb);(dest/'gabarito.pdf').write_bytes(kb)
 for n,pg in enumerate(doc,1):
  pix=pg.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest/f'{n:02}.webp','WEBP',quality=80,method=4)
 records.append(dict(id=id,instituicao=prefix[:4].upper(),titulo=title,paginas=len(doc),inicio=3 if prefix=="ifmg20" else 2,total=total,alternativas=list(letters),gabarito=key,fonte=source,sha256_prova=hashlib.sha256(pb).hexdigest(),sha256_gabarito=hashlib.sha256(kb).hexdigest()))
 print(id,len(doc),'páginas; anuladas',annulled,flush=True)
(root/'src/data/ifs-historicos.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
