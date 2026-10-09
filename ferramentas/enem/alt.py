import json,re,sys
from pathlib import Path
for d in sys.argv[1:]:
    j=next(Path(d).glob("*.json")); r=json.load(open(j)); bad=[]
    for q in r["questoes"]:
        t=q["texto"]
        letras=set()
        letras |= set(re.findall(r"\(([A-E])\)", t))
        for ln in t.split("\n"):
            m=re.match(r"^\(?([A-E])\)?(\s|$)",ln.strip())
            if m: letras.add(m.group(1))
        if len(letras)<5: bad.append((q["numero"],"".join(sorted(letras))))
    print(j.stem,len(r["questoes"]),"sem A-E completo:",bad)
