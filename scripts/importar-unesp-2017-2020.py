#!/usr/bin/env python3
"""Importa cadernos 2017–2020 e gabaritos versão 1. Requer PyMuPDF, Pillow e pdftotext.
Uso: python scripts/importar-unesp-2017-2020.py /pasta/pdfs
Arquivos esperados: ANO-prova.pdf e ANO-gabarito.pdf.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1];folder=Path(sys.argv[1]);archive_path=root/'src/data/unesp-archive.json';archive=json.loads(archive_path.read_text())
config={
 2020:('15.11.2019','https://vestibular.unesp.br/Home/2020/unesp_caderno_de_questoes_prova_de_conhecimentos_gerais_15_nov_2019__v1.pdf','https://vestibular.unesp.br/Home/2020/unesp_gabarito_prova_de_conhecimentos_gerais_15_nov_2019__v1.pdf'),
 2019:('15.11.2018','https://vestibular.unesp.br/Home/2019/caderno-cg-1a-fase-versao-1-2019.pdf','https://vestibular.unesp.br/Home/2019/gabarito-cg-1a-fase-versao-1-2019.pdf'),
 2018:('15.11.2017','https://network.grupoabril.com.br/wp-content/uploads/sites/4/2017/11/prova-unesp.pdf','https://network.grupoabril.com.br/wp-content/uploads/sites/4/2017/11/unesp-gabarito1.pdf'),
 2017:('13.11.2016','https://network.grupoabril.com.br/wp-content/uploads/sites/4/2016/11/caderno-de-prova-primeira-fase-unesp2017.pdf','https://network.grupoabril.com.br/wp-content/uploads/sites/4/2016/11/gabarito-primeira-fase-unesp2017.pdf')}
result=[]; new=[]
for year,(date,url,key_url) in config.items():
 paths=[folder/f'{year}-prova.pdf',folder/f'{year}-gabarito.pdf'];data=[p.read_bytes() for p in paths]
 for b in data: assert b.startswith(b'%PDF-')
 cover=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(paths[0]),'-'],text=True).lower(); key=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(paths[1]),'-'],text=True).lower()
 for text in [cover,key]:
  assert str(year) in text and date in text and re.search(r'001\.\s*prova\s+de\s+conhecimentos\s+gerais',text)
 assert re.search(r'versão\s+1',key) and '90 questões' in cover
 pairs=re.findall(r'(?<!\d)(\d{1,2})\s*-\s*([a-e])(?!\w)',key);answers={int(n):a.upper() for n,a in pairs}
 assert len(pairs)==90 and sorted(answers)==list(range(1,91))
 sha=[hashlib.sha256(b).hexdigest() for b in data];doc=fitz.open(paths[0]);id=f'{year}-regular-{sha[0][:12]}'
 out=root/'public/acervo/unesp'/str(year)/'regular';out.mkdir(parents=True,exist_ok=True)
 (out/'prova.pdf').write_bytes(data[0])
 for n,page in enumerate(doc,1):
  pix=page.get_pixmap(matrix=fitz.Matrix(1.75,1.75),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/f'{n:02}.webp','WEBP',quality=82,method=4)
 new.append({'institution':'unesp','year':year,'application':'regular','label':'Prova de Conhecimentos Gerais — versão 1'+(' (cópia do Guia do Estudante)' if year<2019 else ''),'kind':'prova','url':url,'source':'https://www.vunesp.com.br/Institucional/EstatisticaVestibular','sha256':sha[0],'bytes':len(data[0]),'pages':len(doc),'startPage':1,'status':'verified','id':id,'phase':'1ª fase'})
 result.append({'id':id,'ano':year,'aplicacao':'regular','titulo':f'UNESP {year} — vestibular regular, primeira fase','versao':'1','gabarito':[answers[n] for n in range(1,91)],'fonte_prova':url,'fonte_gabarito':key_url,'sha256_prova':sha[0],'sha256_gabarito':sha[1]})
 print(year,id,len(doc))
assert not any(d['id'] in {n['id'] for n in new} for d in archive['documents'])
archive['documents']=new+archive['documents'];archive_path.write_text(json.dumps(archive,ensure_ascii=False,indent=2)+'\n');(root/'src/data/unesp-2017-2020.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
