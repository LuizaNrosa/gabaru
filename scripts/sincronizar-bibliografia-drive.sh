#!/usr/bin/env bash
# Os arquivos e o inventário resultante ficam no diretório privado ignorado pelo Git.
set -euo pipefail

exec python3 - "$@" <<'PY'
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata

FOLDER_ID = "1x-m0I_Nnir2NknS1X86eMPxmXw5C2Rp6"
PART_SIZE = 32_000_000
READ_SIZE = 1024 * 1024
FORMATOS = {".pdf", ".docx", ".odt", ".epub", ".txt", ".md"}
PORTUGUES = re.compile(r"\b(portugues|lingua portuguesa|gramatica|redacao|interpretacao(?: de textos?)?|"
                        r"producao textual|compreensao textual|leitura e escrita|literatura)\b")
OUTRAS_MATERIAS = re.compile(r"\b(matematica|algebra|aritmetica|geometria|polinomios?|estatistica|"
                             r"fisica|quimica|biologia|historia|geografia|ingles|frances|russo|espanhol|"
                             r"iezzi|ciencias|filosofia|sociologia)\b")
PASTA_MISTA = re.compile(r"^(?:bibliografia|acervo|materiais?) (?:em )?portugues$")


def normalizar(nome):
    decomposto = unicodedata.normalize("NFKD", nome.casefold())
    return " ".join(re.sub(r"[^a-z0-9]+", " ", decomposto.encode("ascii", "ignore").decode()).split())


def selecionar(item):
    remoto = item["Path"]
    caminho = PurePosixPath(remoto)
    if caminho.is_absolute() or any(parte in (".", "..") for parte in remoto.split("/")):
        raise ValueError(f"Caminho remoto inválido: {remoto!r}")
    if caminho.suffix.casefold() not in FORMATOS:
        return False
    segmentos = [normalizar(p) for p in (*caminho.parts[:-1], caminho.stem)]
    if any(OUTRAS_MATERIAS.search(p) for p in segmentos):
        return False
    return any(PORTUGUES.search(p) and not PASTA_MISTA.fullmatch(p) for p in segmentos)


def espaco_seguro(pasta, acrescimo=0):
    fs = os.statvfs(pasta)
    usado = (fs.f_blocks - fs.f_bfree) * fs.f_frsize
    livre = fs.f_bavail * fs.f_frsize
    # O df calcula a ocupação pelo espaço disponível ao usuário e arredonda para cima.
    if (usado + acrescimo) * 100 > (usado + livre) * 79 or acrescimo > livre:
        raise RuntimeError("Sincronização interrompida para manter o uso de disco abaixo de 80%.")


def inventario_existente(pasta):
    arquivo = pasta / "inventario-sincronizacao.json"
    if not arquivo.is_file():
        return {}
    return {item["caminho"]: item for item in json.loads(arquivo.read_text())["arquivos"]}


def gravar_inventario(pasta, itens):
    dados = {"materia": "portugues", "arquivos": sorted(itens, key=lambda x: x["caminho"])}
    with tempfile.NamedTemporaryFile(dir=pasta, mode="w", encoding="utf-8", delete=False) as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
        f.write("\n")
        temporario = Path(f.name)
    temporario.replace(pasta / "inventario-sincronizacao.json")


def metadados_pdf(arquivo):
    if shutil.which("pdfinfo") is None:
        return {}
    proc = subprocess.run(["pdfinfo", str(arquivo)], text=True, capture_output=True,
                          env={**os.environ, "LC_ALL": "C"})
    paginas = re.search(r"^Pages:\s+(\d+)$", proc.stdout, re.MULTILINE)
    return {"paginas_pdf": int(paginas[1])} if paginas else {"paginas_pdf": None}


def sincronizar(pasta, item, remoto, flags, anterior):
    relativo = item["Path"]
    tamanho = int(item["Size"])
    if tamanho < 0:
        raise RuntimeError(f"O Drive não informou o tamanho de {relativo!r}.")
    destino = pasta.joinpath(*PurePosixPath(relativo).parts)
    if not destino.parent.resolve().is_relative_to(pasta):
        raise RuntimeError(f"O destino de {relativo!r} sai da pasta privada.")
    destino.parent.mkdir(parents=True, exist_ok=True)
    partes = destino.suffix.casefold() == ".pdf" and tamanho > PART_SIZE
    final = destino.with_name(destino.name + ".partes") if partes else destino
    if final.is_symlink():
        raise RuntimeError(f"Destino com link simbólico: {relativo!r}")
    if anterior and final.exists() and anterior["tamanho"] == tamanho and (
        anterior.get("modificado") == item.get("ModTime")
    ) and item.get("ModTime"):
        nomes = anterior.get("partes", [])
        tamanho_local = (
            sum((final / n).stat().st_size for n in nomes if (final / n).is_file())
            if partes and final.is_dir() else final.stat().st_size if final.is_file() else -1
        )
        if tamanho_local == tamanho:
            return anterior
    if partes and final.exists():
        raise RuntimeError(f"Há partes diferentes em {final.name!r}. Preserve ou mova essa cópia local antes de atualizar.")
    espaco_seguro(pasta, tamanho + READ_SIZE)
    sha = hashlib.sha256()
    resto = tamanho
    with tempfile.TemporaryDirectory(prefix=".sync-", dir=destino.parent) as tmp:
        tmp = Path(tmp)
        nomes = []
        with subprocess.Popen(["rclone", "cat", remoto + relativo, *flags],
                              stdout=subprocess.PIPE) as proc:
            try:
                while resto or not nomes:
                    nome = f"parte-{len(nomes) + 1:04d}" if partes else "arquivo"
                    limite = min(PART_SIZE, resto) if partes else resto
                    with (tmp / nome).open("wb") as f:
                        while limite:
                            dados = proc.stdout.read(min(READ_SIZE, limite))
                            if not dados:
                                raise RuntimeError(f"Transferência incompleta: {relativo!r}.")
                            espaco_seguro(pasta, len(dados))
                            sha.update(dados)
                            f.write(dados)
                            limite -= len(dados)
                            resto -= len(dados)
                    nomes.append(nome)
                if proc.stdout.read(1) or proc.wait():
                    raise RuntimeError(f"Falha de transferência ou tamanho divergente: {relativo!r}.")
            except BaseException:
                proc.terminate()
                raise
        registro = {"caminho": relativo, "tamanho": tamanho, "sha256": sha.hexdigest(),
                    "modificado": item.get("ModTime"), "armazenado_em": str(final.relative_to(pasta))}
        if partes:
            registro["partes"] = nomes
            (tmp / "manifesto.json").write_text(json.dumps(registro, ensure_ascii=False, indent=2) + "\n")
            tmp.rename(final)
        else:
            (tmp / nomes[0]).replace(final)
            if destino.suffix.casefold() == ".pdf":
                registro.update(metadados_pdf(final))
    return registro


def main():
    parser = argparse.ArgumentParser(
        prog="sincronizar-bibliografia-drive.sh",
        description="Sincroniza referências de Português com um remoto Google Drive do rclone.",
        epilog="Configure autenticação no rclone e execute a partir do checkout do Gabaru."
    )
    parser.add_argument("--materia", choices=["portugues"], required=True)
    parser.add_argument("--remote", default=os.environ.get("GABARU_DRIVE_REMOTE", "gabaru-drive:"))
    parser.add_argument("--listar", action="store_true", help="Mostra os arquivos selecionados sem transferir.")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_. -]+:", args.remote):
        parser.error("--remote deve ser o nome de um remoto rclone, seguido de dois-pontos.")
    if not shutil.which("rclone"):
        parser.error("Instale o rclone para usar o remoto autenticado.")
    raiz = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip()).resolve()
    pasta = raiz / "bibliografia-pdfs" / args.materia
    if pasta.resolve() != pasta or subprocess.run(
        ["git", "-C", str(raiz), "check-ignore", "-q", "--", str(pasta / "teste.pdf")]
    ).returncode:
        raise RuntimeError("A pasta de destino precisa ser local e ignorada pelo Git.")
    if subprocess.check_output(["git", "-C", str(raiz), "ls-files", "--", str(pasta)], text=True):
        raise RuntimeError("A pasta privada já contém arquivos rastreados pelo Git.")
    espaco_seguro(raiz)
    flags = ["--drive-root-folder-id", FOLDER_ID, "--drive-skip-shortcuts", "--retries", "2"]
    itens = json.loads(subprocess.check_output(
        ["rclone", "lsjson", args.remote, "--recursive", "--files-only", *flags], text=True
    ))
    selecionados = [i for i in itens if selecionar(i)]
    if args.listar or not selecionados:
        for item in selecionados:
            print(item["Path"])
        print(f"{len(selecionados)} arquivo(s) selecionado(s).")
        return
    pasta.mkdir(parents=True, exist_ok=True)
    registros = inventario_existente(pasta)
    for item in selecionados:
        caminho = item["Path"]
        registros[caminho] = sincronizar(pasta, item, args.remote, flags, registros.get(caminho))
        gravar_inventario(pasta, registros.values())
    espaco_seguro(pasta)
    print(f"{len(selecionados)} arquivo(s) sincronizado(s) em {pasta}.")


try:
    main()
except (OSError, RuntimeError, ValueError, subprocess.CalledProcessError) as erro:
    sys.exit(f"Sincronização da bibliografia: {erro}")
PY
