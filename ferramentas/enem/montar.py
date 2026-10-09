#!/usr/bin/env python3
"""Reúne as saídas do extrair.py em content/enem/<prova>/ (imagens + dados.json), com nomes padronizados.

Uso: montar.py <pasta_saidas> <destino>
"""
import json, sys
from PIL import Image
from pathlib import Path

PROVAS = {
    # pasta de saída -> (id, ano, dia, descrição)
    **{str(a): (f"enem-{a}", a, None, "Prova única (caderno amarelo)") for a in range(2000, 2009)},
    "2009d1": ("enem-2009-d1", 2009, 1, "1º dia, caderno 2 amarelo (Ciências Humanas e da Natureza)"),
    "2011d1": ("enem-2011-d1", 2011, 1, "1º dia, caderno 1 azul (Ciências Humanas e da Natureza)"),
    "2011d2": ("enem-2011-d2", 2011, 2, "2º dia, caderno 5 amarelo (Linguagens e Matemática)"),
    "2012d1": ("enem-2012-d1", 2012, 1, "1º dia, caderno 1 azul (Ciências Humanas e da Natureza)"),
}

def main():
    origem, destino = Path(sys.argv[1]), Path(sys.argv[2])
    for pasta, (pid, ano, dia, desc) in PROVAS.items():
        d = origem / pasta
        j = next(d.glob("*.json"))
        dados = json.load(open(j))
        out = destino / pid
        (out / "img").mkdir(parents=True, exist_ok=True)
        qs = []
        for q in dados["questoes"]:
            nome = f"{pid}-q{q['numero']:03d}.webp"
            if q["imagem"]:
                Image.open(d / q["imagem"]).convert("RGB").save(out / "img" / nome, "WEBP", quality=86, method=6)
            qs.append(dict(numero=q["numero"], imagem=f"img/{nome}" if q["imagem"] else None, texto=q["texto"].strip()))
        json.dump(dict(id=pid, banca="INEP", exame="ENEM", ano=ano, dia=dia, descricao=desc, total=len(qs), questoes=qs),
                  open(out / "dados.json", "w"), ensure_ascii=False, indent=1)
        print(pid, len(qs))

if __name__ == "__main__":
    main()
