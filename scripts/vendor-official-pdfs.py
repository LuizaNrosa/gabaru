"""Download only official catalog PDFs, retaining exact reviewed SHA256 bytes."""
import concurrent.futures,hashlib,json,os,urllib.request,urllib.error
from pathlib import Path
root=Path(__file__).resolve().parent.parent
hosts={'fatweb.s3.amazonaws.com','vestibulinho.etec.sp.gov.br','www.pse.coluni.ufv.br','coluni.ufv.br'}
jobs=[]
for institution in ['etec','coluni']:
 for exam in json.loads((root/f'src/data/{institution}-exams.json').read_text()):
  for name,url,sha in [('prova',exam['examUrl'],exam['examSha256']),('gabarito',exam['answerUrl'],exam['answerSha256'])]:
   from urllib.parse import urlparse
   source=urlparse(url)
   if source.scheme!='https' or source.hostname not in hosts:raise ValueError('Unapproved source')
   jobs.append((root/f'public/acervo/{institution}/{exam["id"]}/{name}.pdf',url,sha))
def recover(job):
 path,url,sha=job
 if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest()==sha:return 'cached'
 data=urllib.request.urlopen(url,timeout=35).read()
 if not data.startswith(b'%PDF') or hashlib.sha256(data).hexdigest()!=sha:raise ValueError(f'PDF hash differs: {path.relative_to(root)}')
 path.parent.mkdir(parents=True,exist_ok=True);temp=path.with_suffix('.pdf.tmp');temp.write_bytes(data);os.replace(temp,path)
 return str(path.relative_to(root))
failures=[];downloaded=0
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 futures={pool.submit(recover,j):j for j in jobs}
 for f in concurrent.futures.as_completed(futures):
  try:
   result=f.result()
   if result!='cached':downloaded+=1;print('Verified:',result,flush=True)
  except Exception as error:failures.append(f'{futures[f][0].relative_to(root)}: {error}')
print(f'{len(jobs)} catalog PDFs; {downloaded} recovered; {len(failures)} failures')
if failures:raise SystemExit('\n'.join(failures))
