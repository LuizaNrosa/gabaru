import json,hashlib,urllib.request,urllib.error,concurrent.futures,re,time
from pathlib import Path
import fitz
root=Path(__file__).parent
sources=[
 {'id':'2026-1','title':'IFSP 2026/1 · Integrado · Tipo 1','source':'https://concurso30.fundacaocefetminas.org.br/site/processo_seletivo_detalhes.aspx?id=8E2B67E9A3806F9F','examUrl':'https://concurso30.fundacaocefetminas.org.br/documentos/CadernodeProvaTIPO1Integrado122639008142733807990.pdf','answerUrl':'https://concurso30.fundacaocefetminas.org.br/documentos/GabaritoFinalIntegrado122639014208834868178.pdf','alternatives':list('ABCDE'),'annulled':[27]},
 {'id':'2025-1','title':'IFSP 2025/1 · Prova A · Manhã','source':'https://processoseletivo.ifsp.edu.br/cursos-tecnicos-2025-1/todos-documentos/','examUrl':'https://processoseletivo.ifsp.edu.br/media/public/8/8qgf9tz1lbiv2axxso73djdss/9z/9zhhn2yc4pckn2ptvq9qy4sft.pdf','answerUrl':'https://processoseletivo.ifsp.edu.br/media/public/8/8qgf9tz1lbiv2axxso73djdss/9q/9q0ijty2sm074vi52c4fm9x5v.pdf','alternatives':list('ABCD'),'annulled':[5]},
 {'id':'2024-1','title':'IFSP 2024/1 · Prova A · Manhã','source':'https://processoseletivo.ifsp.edu.br/cursos-tecnicos-2024-1/todos-documentos/','examUrl':'https://processoseletivo.ifsp.edu.br/media/public/b/bwjctxb8f3ngkl7ybi9f94db/56/567pzirta5t1y18hkrthpt3cj.pdf','answerUrl':'https://processoseletivo.ifsp.edu.br/media/public/b/bwjctxb8f3ngkl7ybi9f94db/96/96i12dn3fnbnrn4z5rmrb4as.pdf','alternatives':list('ABCD'),'annulled':[20,25]}
]
(root/'sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2))
jobs=[(s,n,f) for s in sources for n,f in [('prova','examUrl'),('gabarito','answerUrl')]]
def download(j):
 s,n,f=j;p=root/f'{s["id"]}-{n}.pdf'
 if p.exists():b=p.read_bytes()
 else:
  for attempt in range(3):
   try:b=urllib.request.urlopen(s[f],timeout=45).read();break
   except urllib.error.HTTPError as e:
    if e.code not in [408,429,500,502,503,504] or attempt==2:raise
    time.sleep(1+attempt)
 assert b[:4]==b'%PDF',(s['id'],n)
 p.write_bytes(b)
 return {'id':s['id'],'kind':n,'file':p.name,'url':s[f],'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:downloads=list(pool.map(download,jobs))
(root/'downloads.json').write_text(json.dumps(downloads,indent=2))
for s in sources:
 for n in ['prova','gabarito']:
  d=fitz.open(root/f'{s["id"]}-{n}.pdf')
  texts=[p.get_text(sort=True) for p in d]
  (root/f'{s["id"]}-{n}.txt').write_text('\f'.join(texts))
  print(s['id'],n,'pages',len(d))
print('Six official PDFs downloaded and hashed')
