import json,re,hashlib
from pathlib import Path
import fitz
root=Path(__file__).parent
sources=json.loads((root/'sources.json').read_text())
downloads={(x['id'],x['kind']):x for x in json.loads((root/'downloads.json').read_text())}
output=[];reports=[]
for s in sources:
 id=s['id'];exam=fitz.open(root/f'{id}-prova.pdf');answer=fitz.open(root/f'{id}-gabarito.pdf')
 pages=[{'number':p.number+1,'image':'','text':p.get_text()} for p in exam]
 matches={n:[] for n in range(1,31)}
 for p in exam:
  for block in p.get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    spans=line['spans'];t=' '.join(x['text'] for x in spans).strip()
    if id=='2026-1':
     m=re.fullmatch(r'QUESTÃO\s+0?(\d{1,2})',t)
     if m and int(m[1]) in matches:matches[int(m[1])].append({'page':p.number+1,'text':t,'bbox':line['bbox']})
    else:
     for x in spans:
      t=x['text'].strip()
      if t.isdigit() and 'Arial-Black' in x['font'] and abs(x['size']-18)<0.01 and int(t) in matches:matches[int(t)].append({'page':p.number+1,'text':t,'bbox':x['bbox']})
 keys={}
 # The 2026 final sheet has Type 1 on page 1 and Type 2 on page 2; only page 1 is imported.
 for n,a in re.findall(r'\b(\d{1,2})\s+(ANULADA|Anulada|[ABCDE])\b',answer[0].get_text(sort=True)):
  n=int(n)
  if n in keys:raise ValueError(f'Duplicate official answer {id}/{n}')
  keys[n]=a.upper()
 assert set(keys)==set(range(1,31)),(id,keys)
 assert sorted(n for n in keys if keys[n]=='ANULADA')==s['annulled'],(id,keys)
 warnings=[{'number':n,'matchCount':len(v)} for n,v in matches.items() if len(v)!=1]
 questions=[{'number':n,'page':matches[n][0]['page'] if len(matches[n])==1 else 1,'pageMapped':len(matches[n])==1,'answer':keys[n]} for n in range(1,31)]
 output.append({**{k:s[k] for k in ['id','title','source','examUrl','answerUrl','alternatives']},'institution':'IFSP','kind':'integrado','examSha256':downloads[id,'prova']['sha256'],'answerSha256':downloads[id,'gabarito']['sha256'],'pageCount':len(exam),'answerKeyRevised':True,'questions':questions,'pages':pages})
 reports.append({'id':id,'questionCount':len(questions),'warnings':warnings,'matches':matches,'answerSheetPageUsed':1,'answerSheetPageCount':len(answer)})
 for name,doc in [('cover',exam),('answer',answer)]:doc[0].get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(root/f'{id}-{name}.png')
(root/'loteifsp2026-2024.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':')))
(root/'page-reports.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
manifest={'status':'staging-awaiting-independent-review','institution':'IFSP','kind':'integrado','totalExams':len(output),'totalQuestions':sum(len(e['questions']) for e in output),'notes':['Only 2026 Type 1 and 2025/2024 Prova A are imported; Type 2/Prova B excluded.','2026 has five alternatives A-E;2025/2024 have four A-D.','2025/2024 official caderno is common to integrated and concomitant/subsequent candidates; stored once.','2026/2 and2025/2 are concomitant/subsequent and excluded.'],'editions':[{**s,'questionCount':len(e['questions']),'pageCount':e['pageCount'],'examSha256':e['examSha256'],'answerSha256':e['answerSha256'],'annulled':[q['number'] for q in e['questions'] if q['answer']=='ANULADA'],'mappedQuestions':sum(q['pageMapped'] for q in e['questions'])} for s,e in zip(sources,output)],'files':list(downloads.values())}
(root/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps([{k:e[k] for k in ['id','pageCount','examSha256','answerSha256']}|{'questions':len(e['questions']),'mapped':sum(q['pageMapped'] for q in e['questions']),'annulled':[q['number'] for q in e['questions'] if q['answer']=='ANULADA']} for e in output],indent=2))
