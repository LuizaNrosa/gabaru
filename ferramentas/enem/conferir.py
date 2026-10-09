import json,sys
from PIL import Image
from pathlib import Path
for d in sys.argv[1:]:
    d=Path(d); j=next(d.glob("*.json")); r=json.load(open(j))
    ns=[q["numero"] for q in r["questoes"]]
    esp=range(1,max(ns)+1)
    falta=[n for n in esp if n not in ns]
    dup=sorted({n for n in ns if ns.count(n)>1})
    out=[]
    sem=[q["numero"] for q in r["questoes"] if not q["imagem"]]
    for q in r["questoes"]:
        if q["imagem"]:
            w,h=Image.open(d/q["imagem"]).size
            if h<120 or h>1500: out.append((q["numero"],w,h))
    print(j.stem,r["modo"],len(ns),"max",max(ns),"faltam",falta,"dup",dup,"semimg",sem,"outliers",out)
