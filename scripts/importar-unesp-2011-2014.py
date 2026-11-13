#!/usr/bin/env python3
"""Importa quatro cadernos e gabaritos históricos. Uso: python scripts/importar-unesp-2011-2014.py PASTA_PDFS. Requer PyMuPDF, Pillow e pdftotext."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1];folder=Path(sys.argv[1]);outdata=[]
configs=[
 (2011,'14.11.2010','vnsp1004','https://estaticog1.globo.com/2010/11/14/unesp/provacg.pdf','https://estaticog1.globo.com/2010/11/14/unesp/gabaritocg.pdf',False),
 (2012,'06.11.2011','vnsp1108','https://estaticog1.globo.com/2011/11/unesp/001_ConhecGerais.pdf','https://renataquartieri.com/wp-content/uploads/2015/06/001-Gabarito-da-prova-de-conhecimentos-gerais4.pdf',False),
 (2013,'18.11.2012','vnsp1207','https://www.curso-objetivo.br/vestibular/resolucao-comentada/unesp/2013/1fase/UNESP2013_1fase_prova.pdf','https://media.folha.uol.com.br/cotidiano/2012/11/18/gabarito-unesp_conhecimentos_gerais.pdf',True),
 (2014,'17.11.2013','vnsp1308','https://www.curso-objetivo.br/vestibular/resolucao-comentada/unesp/2014/1fase/UNESP2014_1fase_prova.pdf','https://www.curso-objetivo.br/vestibular/resolucao-comentada/unesp/2014/1fase/UNESP2014_1fase_gabarito.pdf',True)]
for year,date,code,url,key_url,versioned in configs:
 p=folder/f'{year}-prova.pdf';k=folder/f'{year}-gabarito.pdf';pb=p.read_bytes();kb=k.read_bytes();assert pb.startswith(b'%PDF-') and kb.startswith(b'%PDF-')
 proof=fitz.open(p);cover=proof[0].get_text().lower();text=' '.join(x.get_text() for x in list(proof)[:3]).lower();key=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(k),'-'],text=True).lower()
 assert str(year) in cover and date in cover and '90 questões' in cover and code in key
 if year!=2011:assert code in text
 if year in (2011,2012,2013):assert date in key
 if versioned:
  assert re.search(r'versão\s+1',key);key=re.split(r'versão\s+2',key,maxsplit=1)[0]
 pairs=re.findall(r'(?<!\d)(\d{1,2})\s*[-–]\s*([a-e])(?!\w)',key);answers={int(n):a.upper() for n,a in pairs};assert len(pairs)==90 and sorted(answers)==list(range(1,91))
 sha=hashlib.sha256(pb).hexdigest();ident=f'{year}-regular-{sha[:12]}';out=root/'public/acervo/unesp'/str(year)/'regular';out.mkdir(parents=True,exist_ok=True);(out/'prova.pdf').write_bytes(pb)
 for n,page in enumerate(proof,1):
  pix=page.get_pixmap(matrix=fitz.Matrix(1.75,1.75),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/f'{n:02}.webp','WEBP',quality=82,method=4)
 outdata.append({'id':ident,'ano':year,'aplicacao':'regular','titulo':f'UNESP {year} — vestibular regular, primeira fase','versao':'1' if versioned else 'caderno divulgado','gabarito':[answers[n] for n in range(1,91)],'fonte_prova':url,'fonte_gabarito':key_url,'sha256_prova':sha,'sha256_gabarito':hashlib.sha256(kb).hexdigest(),'pages':len(proof),'bytes':len(pb)})
 print(year,ident,len(proof))
(root/'src/data/unesp-2011-2014.json').write_text(json.dumps(outdata,ensure_ascii=False,indent=2)+'\n')
