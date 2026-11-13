#!/usr/bin/env python3
"""Importa gabaritos oficiais Unicamp, sem copiar cadernos. Uso: python scripts/importar-unicamp-lote1.py PASTA_PDFS. Requer pdftotext."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1];folder=Path(sys.argv[1]);docs=json.loads((root/'src/data/unicamp-archive.json').read_text())['documents']
configs=[
 (2026,'2026-regular-8f6955a3d2b3','2026-regular-13c5e846462f','Q e X',None,None),
 (2025,'2025-regular-41564e9bbd20',None,'Q e Z','2025-qz.pdf','2025-qz-gabarito.pdf'),
 (2024,'2024-regular-f6c8212438d9','2024-regular-6253a17b84ac','Q e Y',None,None),
 (2023,'2023-regular-520cf58ec2d0','2023-regular-be77271c63a7','Q e Z',None,None)]
exams=[]
for year,pid,kid,version,customp,customk in configs:
 p=next(d for d in docs if d['id']==pid);proof=folder/(customp or f'{pid}.pdf'); key=folder/(customk or f'{kid}.pdf');pbytes=proof.read_bytes();kbytes=key.read_bytes()
 assert hashlib.sha256(pbytes).hexdigest()==p['sha256']
 if kid:
  kd=next(d for d in docs if d['id']==kid);assert hashlib.sha256(kbytes).hexdigest()==kd['sha256'];key_url=kd['url']
 else:
  key_url='https://www.comvest.unicamp.br/wp-content/uploads/2024/10/QZ_gabarito_2025_FINAL_site.pdf';assert hashlib.sha256(kbytes).hexdigest()=='26cc09a657c54357a84fbe23a6e8af34eb150c6a0012556929a481bf29a3f008'
 cover=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(proof),'-'],text=True);ktxt=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key),'-'],text=True)
 assert str(year) in cover and re.search(r'72 questões de múltipla escolha',cover,re.I) and re.search(r'4\s+alternativas',cover,re.I)
 parts=version.split(' e '); assert re.search(r'\b'+parts[0]+r'\s*e\s*'+parts[1]+r'\b',cover,re.I) and re.search(r'PROVAS?\s+'+parts[0]+r'\s*e\s*'+parts[1]+r'\b',ktxt,re.I)
 pairs=re.findall(r'(?<!\d)(\d{2})\s+([A-D*])(?!\w)',ktxt);answers={int(n):a for n,a in pairs}
 assert len(pairs)==72 and sorted(answers)==list(range(1,73))
 if '*' in answers.values(): assert re.search(r'anulad[ao]|anular',ktxt,re.I)
 exams.append({'id':pid,'ano':year,'versao':version,'alternativas':['A','B','C','D'],'gabarito':[answers[n] for n in range(1,73)],'fonte_prova':p['url'],'fonte_gabarito':key_url,'sha256_prova':p['sha256'],'sha256_gabarito':hashlib.sha256(kbytes).hexdigest()})
 print(year,version,'anuladas:',[n for n in answers if answers[n]=='*'])
(root/'src/data/unicamp-lote1.json').write_text(json.dumps(exams,ensure_ascii=False,indent=2)+'\n')
