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

NOTA_IDIOMA = "Questões 101–105 = versões em espanhol das questões 1–5 (que são em inglês)."
PROVAS_NOVAS = {
    "2020_PV_digital_D2_CD8": ("enem-2020-d2", 2020, 2, "2º dia, versão digital, caderno 8 (Ciências da Natureza e Matemática)"),
    "2021_PV_impresso_D1_CD1": ("enem-2021-d1", 2021, 1, "1º dia, caderno 1 azul (Linguagens e Ciências Humanas)"),
    "2021_PV_impresso_D2_CD5_superampliada": ("enem-2021-d2", 2021, 2, "2º dia, caderno 5 amarelo, versão superampliada (Ciências da Natureza e Matemática)"),
    "2022_PV_impresso_D1_CD1": ("enem-2022-d1", 2022, 1, "1º dia, caderno 1 azul (Linguagens e Ciências Humanas)"),
    "2022_PV_impresso_D2_CD6_ampliada": ("enem-2022-d2", 2022, 2, "2º dia, caderno 6 cinza, versão ampliada (Ciências da Natureza e Matemática)"),
    "2022_PV_reaplicacao_PPL_D1_CD3_superampliada": ("enem-2022-ppl-d1", 2022, 1, "Reaplicação (PPL), 1º dia, caderno 3, versão superampliada (Linguagens e Ciências Humanas)"),
    "2022_PV_reaplicacao_PPL_D2_CD8": ("enem-2022-ppl-d2", 2022, 2, "Reaplicação (PPL), 2º dia, caderno 8 (Ciências da Natureza e Matemática)"),
    "2023_PV_impresso_D1_CD1": ("enem-2023-d1", 2023, 1, "1º dia, caderno 1 azul (Linguagens e Ciências Humanas)"),
    "2023_PV_impresso_D2_CD7": ("enem-2023-d2", 2023, 2, "2º dia, caderno 7 azul (Ciências da Natureza e Matemática)"),
    "2024_PV_impresso_D1_CD1": ("enem-2024-d1", 2024, 1, "1º dia, caderno 1 azul (Linguagens e Ciências Humanas)"),
    "2024_PV_reaplicacao_PPL_D2_CD8_ampliada": ("enem-2024-ppl-d2", 2024, 2, "Reaplicação (PPL), 2º dia, caderno 8, versão ampliada (Ciências da Natureza e Matemática)"),
    "2025_PV_impresso_D1_CD1": ("enem-2025-d1", 2025, 1, "1º dia, caderno 1 azul (Linguagens e Ciências Humanas)"),
    "2025_PV_impresso_D4_CD6": ("enem-2025-d2", 2025, 2, "2º dia, caderno 6 (Ciências da Natureza e Matemática)"),
}


def main():
    origem, destino = Path(sys.argv[1]), Path(sys.argv[2])
    conj = PROVAS_NOVAS if len(sys.argv) > 3 and sys.argv[3] == "novas" else PROVAS
    for pasta, (pid, ano, dia, desc) in conj.items():
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
            item = dict(numero=q["numero"], imagem=f"img/{nome}" if q["imagem"] else None, texto=q["texto"].strip())
            if q["numero"] in range(101, 106) and dia == 1:
                item["idioma"] = "espanhol"
            qs.append(item)
        json.dump(dict(id=pid, banca="INEP", exame="ENEM", ano=ano, dia=dia, descricao=desc + (" " + NOTA_IDIOMA if any(q['numero'] > 100 and q['numero'] < 106 for q in qs) else ""), total=len(qs), questoes=qs),
                  open(out / "dados.json", "w"), ensure_ascii=False, indent=1)
        print(pid, len(qs))

if __name__ == "__main__":
    main()
