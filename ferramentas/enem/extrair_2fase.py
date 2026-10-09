#!/usr/bin/env python3
"""FUVEST 2ª fase (discursiva): recorta cada questão das páginas de enunciado (as de 'Área Reservada'), ignorando quadros de resposta.

Uso: extrair_2fase.py <pdf> <saida_dir> <rotulo>
Marcadores: 01..NN (ou M01, F01, Q01...). Um novo grupo começa quando o número volta a 01.
"""
import json, os, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import extrair as e

def main():
    pdf, saida, rotulo = sys.argv[1:4]
    Path(saida).mkdir(parents=True, exist_ok=True)
    pages = e.carregar(pdf)
    marc = []  # (pi, y, grupo, numero)
    grupo, prev = 0, 0
    for pi, pg in enumerate(pages):
        topo = " ".join(l["text"] for l in pg["lines"] if l["y0"] < 45)
        if "QUADRO DESTINADO" in topo or len(pg["lines"]) < 8:
            continue
        if os.environ.get("ESTRITO") and "Área Reservada" not in topo:
            continue
        ls = sorted([l for l in pg["lines"] if re.match(r"^[A-Z]?\d{2}$", l["text"].strip()) and l["x0"] < 90 and l["y0"] > 55], key=lambda l: l["y0"])
        for l in ls:
            n = int(re.sub(r"\D", "", l["text"]))
            if n == 1 and prev != 0:
                grupo += 1; prev = 1
            elif n == prev + 1 or (prev == 0 and n == 1):
                prev = n
            else:
                continue
            marc.append((pi, l["y0"], grupo + 1, n))
    res = []
    maxg = int(os.environ.get("MAXG", 99))
    marc = [m for m in marc if m[2] <= maxg]
    for k, (pi, y, g, n) in enumerate(marc):
        pg = pages[pi]
        prox = [m for m in marc[k + 1:] if m[0] == pi]
        if prox:
            fim = prox[0][1] - 4
        else:
            corpo = [l for l in pg["lines"] if l["y0"] > y and l["y0"] < pg["H"] - 30]
            fim = min(pg["H"] - 25, (max(l["y1"] for l in corpo) + 8) if corpo else y + 100)
        xs0 = min(l["x0"] for l in pg["lines"]) - 6
        xs1 = max(l["x1"] for l in pg["lines"]) + 6
        nome = f"{rotulo}-g{g}-q{n:02d}.png"
        ok = e.recortar(pdf, [(pi + 1, max(0, xs0), min(pg["W"], xs1), y - 4, fim, None)], str(Path(saida) / nome))
        txt = e.texto_regiao(pg, xs0, xs1, y - 4, fim)
        res.append(dict(grupo=g, numero=n, imagem=nome if ok else None, texto=txt))
    json.dump(dict(rotulo=rotulo, questoes=res), open(Path(saida) / "dados.json", "w"), ensure_ascii=False, indent=1)
    print(rotulo, len(res), "questões em", grupo + 1, "grupos")

main()
