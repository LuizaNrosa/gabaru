#!/usr/bin/env python3
"""Monta content/fuvest/<prova>/ (imagens WebP + dados.json) a partir das saídas do extrair.py (1ª fase) e extrair_2fase.py.

Uso: montar_fuvest.py <dir_1fase> <dir_2fase> <gabaritos.json> <destino>
 - 1ª fase: <dir_1fase>/f<ano>-1f/fuvest-<ano>-1f.json  (+ gabarito do caderno V)
 - 2ª fase: <dir_2fase>/fuvest-<ano>-2f-<x>/dados.json   (numero = grupo*100 + n)
"""
import json, sys, glob, re
from PIL import Image
from pathlib import Path

DESC_2F = {
    "d1": "2ª fase, 1º dia (Língua Portuguesa e Literatura; discursiva)",
    "d2": "2ª fase, 2º dia (discursiva)",
    "d3": "2ª fase, 3º dia (provas específicas, discursivas)",
    "esp": "2ª fase, provas específicas (discursivas)",
}

def salvar(d, out, pid, q, num):
    nome = f"{pid}-q{num:03d}.webp"
    if q.get("imagem"):
        (out / "img").mkdir(parents=True, exist_ok=True)
        Image.open(d / q["imagem"]).convert("RGB").save(out / "img" / nome, "WEBP", quality=86, method=6)
    return nome

def main():
    d1, d2, gab, destino = Path(sys.argv[1]), Path(sys.argv[2]), json.load(open(sys.argv[3])), Path(sys.argv[4])
    for pasta in sorted(d1.glob("f*-1f")):
        ano = int(re.search(r"f(\d{4})-1f", pasta.name).group(1))
        dados = json.load(open(next(pasta.glob("*.json"))))
        pid = f"fuvest-{ano}-1f"
        out = destino / pid
        qs = []
        for q in dados["questoes"]:
            nome = salvar(pasta, out, pid, q, q["numero"])
            g = gab[str(ano)]["V"].get(str(q["numero"]))
            qs.append(dict(numero=q["numero"], imagem=f"img/{nome}" if q["imagem"] else None, texto=q["texto"].strip(),
                           gabarito=("anulada" if g == "*" else g)))
        json.dump(dict(id=pid, banca="FUVEST", exame="Vestibular FUVEST", ano=ano, dia=None, fase=1,
                       descricao=f"1ª fase, Conhecimentos Gerais, caderno V (múltipla escolha). Gabarito oficial do caderno V.",
                       total=len(qs), questoes=qs), open(out / "dados.json", "w"), ensure_ascii=False, indent=1)
        print(pid, len(qs))
    for pasta in sorted(d2.glob("fuvest-*-2f-*")):
        m = re.match(r"fuvest-(\d{4})-2f-(\w+)", pasta.name)
        ano, tag = int(m.group(1)), m.group(2)
        dados = json.load(open(pasta / "dados.json"))
        pid = pasta.name
        out = destino / pid
        qs = []
        for q in dados["questoes"]:
            num = q["grupo"] * 100 + q["numero"]
            nome = salvar(pasta, out, pid, q, num)
            qs.append(dict(numero=num, imagem=f"img/{nome}" if q["imagem"] else None, texto=q["texto"].strip(), gabarito="discursiva"))
        json.dump(dict(id=pid, banca="FUVEST", exame="Vestibular FUVEST", ano=ano, dia=None, fase=2,
                       descricao=DESC_2F.get(tag, "2ª fase") + ". numero = grupo×100 + questão dentro do grupo.",
                       total=len(qs), questoes=qs), open(out / "dados.json", "w"), ensure_ascii=False, indent=1)
        print(pid, len(qs))

main()
