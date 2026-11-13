#!/usr/bin/env python3
"""Importa provas 2021 do relatório oficial e cópias das provas 2015–2016.
Uso: python scripts/importar-unesp-2015-2016-2021.py PASTA_PDFS RELATORIO_2021
Requer PyMuPDF, Pillow e pdftotext.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1];folder=Path(sys.argv[1]);report=Path(sys.argv[2]);report_url='https://documento.vunesp.com.br/documento/RelatorioUnesp/MXwyMDIxfDB8MHxUcnVl'
assert hashlib.sha256(report.read_bytes()).hexdigest()=='2a40825b56027855c42a1d85b2681b98005f6b5961d0f51a6a9543b720a87b66'
configs=[
 (2021,'biologicas','Biológicas','001','30.01.2021','2021-biologicas-gabarito.pdf','https://www.curso-objetivo.br/vestibular/resolucao-comentada/unesp/2021/1fase/1dia/UNESP2021_1fase_gabarito.pdf',181,212),
 (2021,'exatas-humanidades','Exatas e Humanidades','002','31.01.2021','2021-exatas-gabarito.pdf','https://www.curso-objetivo.br/vestibular/resolucao-comentada/unesp/2021/1fase/2dia/UNESP2021_1fase_gabarito.pdf',213,244),
 (2016,'regular','regular','001','15.11.2015','2016-gabarito.pdf','https://network.grupoabril.com.br/wp-content/uploads/sites/4/2017/10/unesp2016-1fase-gabarito.pdf',0,0),
 (2015,'regular','regular','001','16.11.2014','2015-gabarito.pdf','https://network.grupoabril.com.br/wp-content/uploads/sites/4/2017/10/unesp2015-1fase-gabarito.pdf',0,0),
]
urls={2015:'https://network.grupoabril.com.br/wp-content/uploads/sites/4/2017/10/unesp2015-1fase.pdf',2016:'https://network.grupoabril.com.br/wp-content/uploads/sites/4/2017/10/unesp2016-1fase.pdf'}
a_path=root/'src/data/unesp-archive.json';archive=json.loads(a_path.read_text());result=[];new=[]
for year,slug,label,code,date,key_file,key_url,start,end in configs:
 key_path=folder/key_file;key_bytes=key_path.read_bytes();key=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key_path),'-'],text=True).lower()
 if start:
  orig=fitz.open(report);doc=fitz.open();doc.insert_pdf(orig,from_page=start-1,to_page=end-1);source=report_url
 else:doc=fitz.open(folder/f'{year}-prova.pdf');source=urls[year]
 cover=doc[0].get_text().lower();second=doc[1].get_text().lower()
 assert re.search(code+r'\.\s*prova\s+de\s+conhecimentos\s+gerais',cover) and '90 questões' in cover
 if year==2021:
  assert 'biológicas' in cover and 'biológicas' in key if slug=='biologicas' else 'exatas' in cover and 'humanidades' in cover and 'exatas' in key and 'humanidades' in key
  assert '2021' in key and date in key and code+'. prova de conhecimentos gerais' in key and 'vnsp2006' in second
 else:
  assert str(year) in cover and date in cover
  assert ('vnsp1503' if year==2016 else 'vnsp1406') in second and ('vnsp1503' if year==2016 else 'vnsp1406') in key
  if year==2016:assert date in key
 assert re.search(r'versão\s+1',key)
 pairs=re.findall(r'(?<!\d)(\d{1,2})\s*[-–]\s*([a-e])(?!\w)',key);answers={int(n):a.upper() for n,a in pairs};assert len(pairs)==90 and sorted(answers)==list(range(1,91))
 out=root/'public/acervo/unesp'/str(year)/slug;out.mkdir(parents=True,exist_ok=True);pdf=out/'prova.pdf'
 if start:doc.save(pdf,garbage=4,deflate=True)
 else:pdf.write_bytes((folder/f'{year}-prova.pdf').read_bytes())
 pdf_bytes=pdf.read_bytes();sha=hashlib.sha256(pdf_bytes).hexdigest();ident=f'{year}-regular-{sha[:12]}'
 for n,page in enumerate(doc,1):
  pix=page.get_pixmap(matrix=fitz.Matrix(1.75,1.75),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/f'{n:02}.webp','WEBP',quality=82,method=4)
 result.append({'id':ident,'ano':year,'aplicacao':slug,'titulo':f'UNESP {year} — vestibular regular'+(f' — {label}' if year==2021 else '')+', primeira fase','versao':'1','gabarito':[answers[n] for n in range(1,91)],'fonte_prova':source,'fonte_gabarito':key_url,'sha256_prova':sha,'sha256_gabarito':hashlib.sha256(key_bytes).hexdigest(),'pages':len(doc),'bytes':len(pdf_bytes),'report_start':start,'report_end':end})
 if year<2021:
  new.append({'institution':'unesp','year':year,'application':'regular','label':'Prova de Conhecimentos Gerais — versão 1 (cópia do Guia do Estudante)','kind':'prova','url':source,'source':'https://www.vunesp.com.br/Institucional/EstatisticaVestibular','sha256':sha,'bytes':len(pdf_bytes),'pages':len(doc),'startPage':1,'status':'verified','id':ident,'phase':'1ª fase'})
 print(year,slug,ident,len(doc))
assert not any(d['id'] in {n['id'] for n in new} for d in archive['documents']);archive['documents']=new+archive['documents'];a_path.write_text(json.dumps(archive,ensure_ascii=False,indent=2)+'\n');(root/'src/data/unesp-2015-2016-2021.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
