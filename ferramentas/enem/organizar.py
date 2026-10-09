#!/usr/bin/env python3
"""Distribui as questões classificadas em content/questoes/<disciplina>/<subtopico>/ (imagem + .md).

Uso: organizar.py <content_dir> <classificacoes_dir>
Lê content/enem/<prova>/dados.json + <classificacoes>/<prova>.json.
"""
import json, shutil, sys
from pathlib import Path

DISC_NOME = {"matematica": "Matemática", "fisica": "Física", "quimica": "Química", "biologia": "Biologia", "historia": "História",
             "geografia": "Geografia", "filosofia": "Filosofia", "sociologia": "Sociologia", "portugues": "Português", "literatura": "Literatura",
             "artes": "Artes", "ingles": "Inglês", "espanhol": "Espanhol", "interdisciplinar": "Interdisciplinar"}

def main():
    content, classes = Path(sys.argv[1]), Path(sys.argv[2])
    taxon = json.load(open(content / "taxonomia.json"))
    destino = content / "questoes"
    total = 0
    indice = []
    for pasta in sorted((content / "enem").iterdir()):
        dj = pasta / "dados.json"
        cj = classes / f"{pasta.name}.json"
        if not dj.exists() or not cj.exists():
            continue
        dados, cl = json.load(open(dj)), json.load(open(cj))
        for q in dados["questoes"]:
            c = cl[str(q["numero"])]
            assert c["disciplina"] in taxon and c["subtopico"] in taxon[c["disciplina"]], (pasta.name, q["numero"], c)
            nome = f"{dados['id']}-q{q['numero']:03d}"
            pasta_q = destino / c["disciplina"] / c["subtopico"]
            pasta_q.mkdir(parents=True, exist_ok=True)
            img = None
            if q.get("imagem"):
                src = pasta / q["imagem"]
                if src.exists():
                    shutil.move(str(src), pasta_q / f"{nome}.webp")
                img = f"{nome}.webp"
            fm = [
                "---",
                f"id: {nome}",
                f"banca: {dados['banca']}",
                f"exame: {dados['exame']}",
                f"ano: {dados['ano']}",
                f"dia: {dados['dia'] if dados['dia'] else 'null'}",
                f"numero: {q['numero']}",
                "origem: oficial",
                f"disciplina: {c['disciplina']}",
                f"subtopico: {c['subtopico']}",
                f"habilidade: {c['habilidade'] if c.get('habilidade') else 'null'}",
                f"tema: \"{c['tema']}\"",
                f"classificacao_confianca: {c['confianca']}",
                "gabarito: pendente",
                f"imagem: {img if img else 'null'}",
            ]
            if c.get("obs"):
                fm.append("obs: " + json.dumps(c["obs"], ensure_ascii=False))
            fm.append("---")
            corpo = f"\n![Questão {q['numero']} — {dados['exame']} {dados['ano']}]({img})\n\n" if img else "\n"
            corpo += "<details><summary>Texto extraído (pode conter ruído)</summary>\n\n" + q["texto"].replace("\n", "  \n") + "\n\n</details>\n"
            (pasta_q / f"{nome}.md").write_text("\n".join(fm) + corpo)
            q.update(disciplina=c["disciplina"], subtopico=c["subtopico"], habilidade=c.get("habilidade"), tema=c["tema"],
                     confianca=c["confianca"], obs=c.get("obs", ""), arquivo=f"questoes/{c['disciplina']}/{c['subtopico']}/{nome}.md")
            q["imagem"] = f"questoes/{c['disciplina']}/{c['subtopico']}/{img}" if img else None
            indice.append(dict(id=nome, ano=dados["ano"], dia=dados["dia"], numero=q["numero"], disciplina=c["disciplina"], subtopico=c["subtopico"], habilidade=c.get("habilidade"), tema=c["tema"], arquivo=q["arquivo"]))
            total += 1
        json.dump(dados, open(dj, "w"), ensure_ascii=False, indent=1)
        shutil.rmtree(pasta / "img", ignore_errors=True)
    json.dump(indice, open(destino / "indice.json", "w"), ensure_ascii=False, indent=1)
    # README por disciplina
    por = {}
    for i in indice:
        por.setdefault(i["disciplina"], {}).setdefault(i["subtopico"], 0)
        por[i["disciplina"]][i["subtopico"]] += 1
    linhas = ["# Banco de questões oficiais", "", "Questões de provas oficiais, separadas por disciplina e subtópico. Gabaritos pendentes. Cada questão tem imagem + `.md` com metadados.", ""]
    for d, subs in sorted(por.items(), key=lambda x: -sum(x[1].values())):
        linhas.append(f"## {DISC_NOME.get(d, d)} — {sum(subs.values())}")
        for s, n in sorted(subs.items(), key=lambda x: -x[1]):
            linhas.append(f"- `{d}/{s}` — {n}")
        linhas.append("")
    (destino / "README.md").write_text("\n".join(linhas))
    print(total, "questões organizadas")

if __name__ == "__main__":
    main()
