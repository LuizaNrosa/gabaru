import json,sys,re
from pathlib import Path
from PIL import Image
for d in sys.argv[1:]:
    d=Path(d); j=next(d.glob("*.json")); r=json.load(open(j))
    ns=[q["numero"] for q in r["questoes"]]
    dup=sorted({n for n in ns if ns.count(n)>1})
    falta=[n for n in range(min(ns),max(ns)+1) if n not in ns]
    bad=[]
    for q in r["questoes"]:
        letras=set(re.findall(r"^\(?([A-E])\)?(?:\s|$)","\n".join(l.strip() for l in q["texto"].split("\n")),re.M))
        if len(letras)<5: bad.append((q["numero"],"".join(sorted(letras))))
    out=[]
    for q in r["questoes"]:
        if q["imagem"]:
            w,h=Image.open(d/q["imagem"]).size
            if h<150 or h>1900: out.append((q["numero"],w,h))
    print(d.name,len(ns),"min",min(ns),"max",max(ns),"faltam",falta[:20],"dup",dup,"sem A-E:",bad,"outliers",out)
