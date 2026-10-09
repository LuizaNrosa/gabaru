#!/usr/bin/env python3
"""Recorta cada questão de uma prova do ENEM (PDF) em imagem + texto.

Uso: extrair.py <pdf> <saida_dir> <rotulo>
Dois formatos: antigo (2000-2008, uma coluna, número em linha) e moderno (2009+, duas colunas, "QUESTÃO NN").
"""
import re, subprocess, sys, json, os, html
from pathlib import Path
import xml.etree.ElementTree as ET
from PIL import Image

DPI = 150
K = DPI / 72.0


def carregar(pdf):
    xml = subprocess.run(["pdftotext", "-bbox-layout", pdf, "-"], capture_output=True, text=True).stdout
    xml = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]", "", xml)
    xml = re.sub(r"<!DOCTYPE[^>]*>", "", xml)
    xml = xml.replace('xmlns="http://www.w3.org/1999/xhtml"', "")
    root = ET.fromstring(xml)
    pages = []
    for p in root.iter("page"):
        W, H = float(p.get("width")), float(p.get("height"))
        lines = []
        for ln in p.iter("line"):
            words = [(float(w.get("xMin")), float(w.get("yMin")), float(w.get("xMax")), float(w.get("yMax")), w.text or "") for w in ln.iter("word")]
            if not words:
                continue
            lines.append(dict(x0=float(ln.get("xMin")), y0=float(ln.get("yMin")), x1=float(ln.get("xMax")), y1=float(ln.get("yMax")),
                              text=" ".join(w[4] for w in words), words=words))
        lines.sort(key=lambda l: (l["y0"], l["x0"]))
        pages.append(dict(W=W, H=H, lines=lines))
    calcular_calha(pages)
    calcular_gm(pages)
    return pages


def _vao(pages, lo, hi, larg, limiar):
    cob = [0] * (hi - lo + 1)
    for p in pages:
        for l in p["lines"]:
            if l["x1"] - l["x0"] < larg * 0.6 and 50 < l["y0"] < p["H"] - 60:
                for x in range(max(lo, int(l["x0"])), min(hi, int(l["x1"])) + 1):
                    cob[x - lo] += 1
    tot = max(cob) or 1
    lim = max(limiar * tot, 1 if len(pages) == 1 else 0)
    melhor, ini = (0, None), None
    for i, c in enumerate(cob + [tot + 5]):
        if c <= lim and ini is None:
            ini = i
        elif c > lim and ini is not None:
            if i - ini > melhor[0]:
                melhor = (i - ini, ini)
            ini = None
    return melhor, lo


def calcular_calha(pages):
    """Vão entre as duas colunas: global (fallback) e por página."""
    x0s = sorted(l["x0"] for p in pages for l in p["lines"])
    x1s = sorted(l["x1"] for p in pages for l in p["lines"])
    xmin, xmax = x0s[int(len(x0s) * 0.02)], x1s[int(len(x1s) * 0.98)]
    mid, larg = (xmin + xmax) / 2, xmax - xmin
    lo, hi = int(mid - larg * 0.10), int(mid + larg * 0.10)
    (n, i), _ = _vao(pages, lo, hi, larg, 0.02)
    g = lo + i + n / 2 if i is not None and n >= 3 else mid
    for p in pages:
        p["G"] = g
        p["XL"], p["XR"] = max(0.0, xmin - 8), min(p["W"], xmax + 8)
        if len(p["lines"]) >= 12:
            (n, i), _ = _vao([p], lo, hi, larg, 0.0)
            if i is not None and n >= 6:
                p["G"] = lo + i + n / 2
    return g


def carregar_ocr(pdf, tessdata="/tmp/tessdata", dpi=200):
    """Alternativa ao pdftotext para PDFs com camada de texto corrompida: OCR (tesseract, por) por página."""
    import csv, io, tempfile, hashlib
    cache = Path("/tmp/enem/ocr") / (Path(pdf).stem + ".json")
    if cache.exists():
        return json.load(open(cache))
    cache.parent.mkdir(parents=True, exist_ok=True)
    info = subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout
    n = int(re.search(r"Pages:\s+(\d+)", info).group(1))
    f = 72.0 / dpi
    pages = []
    with tempfile.TemporaryDirectory() as td:
        for pi in range(1, n + 1):
            base = os.path.join(td, "p")
            subprocess.run(["pdftoppm", "-r", str(dpi), "-f", str(pi), "-l", str(pi), "-gray", "-png", "-singlefile", pdf, base], check=True)
            im = Image.open(base + ".png")
            W, H = im.width * f, im.height * f
            r = subprocess.run(["tesseract", base + ".png", "stdout", "-l", "por", "--tessdata-dir", tessdata, "--psm", "3", "tsv"],
                               capture_output=True, text=True)
            rows = list(csv.DictReader(io.StringIO(r.stdout), delimiter="\t", quoting=csv.QUOTE_NONE))
            grupos = {}
            for w in rows:
                if w["level"] != "5" or not (w["text"] or "").strip():
                    continue
                k = (w["block_num"], w["par_num"], w["line_num"])
                x0, y0, ww, hh = int(w["left"]) * f, int(w["top"]) * f, int(w["width"]) * f, int(w["height"]) * f
                grupos.setdefault(k, []).append((x0, y0, x0 + ww, y0 + hh, w["text"]))
            lines = []
            for ws in grupos.values():
                ws.sort()
                lines.append(dict(x0=ws[0][0], y0=min(w[1] for w in ws), x1=max(w[2] for w in ws), y1=max(w[3] for w in ws),
                                  text=" ".join(w[4] for w in ws), words=ws))
            lines.sort(key=lambda l: (l["y0"], l["x0"]))
            pages.append(dict(W=W, H=H, lines=lines))
            os.remove(base + ".png")
    json.dump(pages, open(cache, "w"))
    return pages


def texto_ilegivel(pages):
    """True se a camada de texto parece lixo (poucas linhas com palavras funcionais do português)."""
    palavras = re.compile(r"\b(de|que|o|a|os|as|e|do|da|em|para|um|uma|com|não|se)\b", re.I)
    linhas = [l["text"] for p in pages[2:10] for l in p["lines"] if len(l["text"].split()) >= 5]
    if len(linhas) < 20:
        return False
    return sum(1 for t in linhas if palavras.search(t)) / len(linhas) < 0.45


def finalizar_paginas(pages):
    calcular_calha(pages)
    calcular_gm(pages)
    return pages


def calcular_gm(pages):
    """Âncora de coluna dos marcadores 'Questão' (maior vão entre os x0 dos rótulos)."""
    xs = sorted(l["x0"] for p in pages for l in p["lines"] if re.match(r"^QUESTÃO(\s+\d{1,3})?$", l["text"].strip(), re.I))
    if len(xs) < 10:
        return
    gaps = [(xs[i + 1] - xs[i], i) for i in range(len(xs) - 1)]
    g, i = max(gaps)
    gm = (xs[i] + xs[i + 1]) / 2 if g > 40 else None
    if gm:
        for p in pages:
            p["Gm"] = gm


def texto_regiao(page, x0, x1, y0, y1):
    ls = [l for l in page["lines"] if l["y0"] >= y0 - 1 and l["y1"] <= y1 + 1 and l["x0"] >= x0 - 2 and l["x0"] <= x1]
    ls.sort(key=lambda l: (round(l["y0"] / 3), l["x0"]))
    return "\n".join(l["text"] for l in ls)


def achar_regua(img, inicio=80, limiar=0.6, corte=190):
    """Altura (px) logo abaixo da primeira régua grossa (3-10 linhas) seguida de branco, ou None."""
    g = img.convert("L")
    w, h = g.size
    px = g.load()

    def frac(y):
        return sum(1 for x in range(0, w, 2) if px[x, y] < corte) / (w / 2)

    y = inicio
    while y < h:
        if frac(y) > limiar:
            y2 = y
            while y2 + 1 < h and frac(y2 + 1) > limiar:
                y2 += 1
            esp = y2 - y + 1
            abaixo_branco = all(frac(yy) < 0.02 for yy in range(y2 + 2, min(h, y2 + 6)))
            if 3 <= esp <= 10 and abaixo_branco:
                return y2
            y = y2 + 1
        else:
            y += 1
    return None


def recortar(pdf, pecas, destino, regua=False):
    """pecas: lista de (pagina_1based, x0, x1, y0, y1) em pontos. Empilha em um PNG."""
    imgs = []
    for peca in pecas:
        pg, x0, x1, y0, y1 = peca[:5]
        yt = peca[5] if len(peca) > 5 else None
        if y1 - y0 < 4:
            continue
        tmp = f"{destino}.tmp"
        subprocess.run(["pdftoppm", "-r", str(DPI), "-f", str(pg), "-l", str(pg), "-x", str(int(x0 * K)), "-y", str(int(y0 * K)),
                        "-W", str(int((x1 - x0) * K)), "-H", str(int((y1 - y0) * K)), "-png", "-singlefile", pdf, tmp], check=True)
        im = Image.open(tmp + ".png").convert("RGB")
        os.remove(tmp + ".png")
        if regua:
            r = achar_regua(im)
            if r is not None:
                imgs.append(im.crop((0, 0, im.width, min(im.height, r + 4))))
                break
            if yt is not None:
                im = im.crop((0, 0, im.width, min(im.height, int((yt - y0) * K) + 6)))
        imgs.append(im)
    if not imgs:
        return False
    w = max(i.width for i in imgs)
    h = sum(i.height for i in imgs)
    out = Image.new("RGB", (w, h), "white")
    y = 0
    for i in imgs:
        out.paste(i, (0, y))
        y += i.height
    import numpy as np
    a = np.asarray(out.convert("L")) < 200
    colfrac = a.mean(axis=0)
    a[:, colfrac > 0.85] = False  # filetes verticais de coluna não contam como conteúdo
    linhas = np.where(a.any(axis=1))[0]
    if len(linhas):
        fim = linhas[-1]
        # filete horizontal solto no fim (régua de encerramento): descarta
        while True:
            lin = np.where(a.any(axis=1))[0]
            lin = lin[lin <= fim]
            if len(lin) < 2:
                break
            ult = lin[-1]
            bloco = [ult]
            for v in lin[::-1][1:]:
                if bloco[-1] - v <= 2:
                    bloco.append(v)
                else:
                    break
            esp, antes = len(bloco), lin[lin < bloco[-1]]
            larg = a[bloco[-1]:ult + 1].any(axis=0).mean()
            if esp <= 16 and larg > 0.35 and len(antes) and bloco[-1] - antes[-1] > 70:
                fim = antes[-1]
            else:
                break
        out = out.crop((0, 0, out.width, min(out.height, int(fim) + 8)))
    out.save(destino, optimize=True)
    return True



_CACHE = {}
EXTRAS = []  # marcadores injetados à mão: [pagina_idx, y, numero, coluna]
REGUA = [False]
FOLGA = [-3.0]  # fim da questão anterior = y0 do marcador + FOLGA (muda em provas com marcador colado)


def pagina_img(pdf, pi, dpi=100):
    k = (pdf, pi, dpi)
    if k not in _CACHE:
        tmp = f"/tmp/_pg_{os.getpid()}"
        subprocess.run(["pdftoppm", "-r", str(dpi), "-f", str(pi + 1), "-l", str(pi + 1), "-png", "-singlefile", pdf, tmp], check=True)
        _CACHE[k] = Image.open(tmp + ".png").convert("L")
        os.remove(tmp + ".png")
    return _CACHE[k]


def tinta_na_calha(pdf, pi, W, y, pg=None):
    """True se a questão que começa em y ocupa a largura total (linha de texto cruza a calha)."""
    if pg is not None:
        prox = [m[0] for m in pg.get("marc", []) if m[2] == 0 and m[0] > y + 5]
        lim = min(prox) - 2 if prox else y + 380
        for l in pg["lines"]:
            if l["y0"] > pg["H"] * 0.86 or re.search(r"P[ÁA]GINA\s*\d+", l["text"], re.I):
                continue
            if y <= l["y0"] <= lim and l["x0"] < pg["G"] - 20 and l["x1"] > pg["G"] + 20:
                ws = sorted(l["words"])
                vao = any(b[0] - a[2] > 11 and a[2] > pg["G"] - 30 and b[0] < pg["G"] + 30 for a, b in zip(ws, ws[1:]))
                if not vao:
                    return True
    return False


def fim_largura_total(pdf, pi, W, y0, base):
    im = pagina_img(pdf, pi)
    f = 100 / 72.0
    ya, yb = int((y0 + 20) * f), int(base * f)
    sub = im.crop((int(30 * f), ya, int((W - 25) * f), yb)).convert("RGB")
    r = achar_regua(sub, inicio=0, limiar=0.55, corte=225)
    return (y0 + 20 + r / f + 2) if r is not None else base

# ---------------------------------------------------------------- moderno
RE_Q = re.compile(r"^QUESTÃO\s+(\d{1,3})$", re.I)
RE_Q0 = re.compile(r"^QUESTÃO$", re.I)
RE_TXT = re.compile(r"^Texto\s+(para|das?)\s+(as\s+)?quest[õo]es\s*(.*)$", re.I)
RE_RODAPE_PG = re.compile(r"P[áA]GINA\s*\d+", re.I)


def achar_marcadores(pg):
    """[(y0, numero, coluna)] — aceita 'QUESTÃO 12' numa linha ou 'Questão' + número em linha vizinha."""
    W = pg["W"]
    out = []
    pg["xr"] = []
    for l in pg["lines"]:
        t = l["text"].strip()
        m = RE_Q.match(t)
        if (m or RE_Q0.match(t)) and l["x0"] >= pg.get("Gm", pg["G"]):
            pg["xr"].append(l["x0"])
        if m:
            out.append((l["y0"], int(m.group(1)), 0 if l["x0"] < pg.get("Gm", pg["G"]) else 1))
        elif len(l["words"]) > 2 and re.search(r"QUEST[ÃA]O\s+\d{1,3}\b", t, re.I):
            ws = l["words"]
            for i in range(len(ws) - 1):
                if ws[i][4].upper() == "QUESTÃO" and re.match(r"^\d{1,3}$", ws[i + 1][4]):
                    out.append((ws[i][1], int(ws[i + 1][4]), 0 if ws[i][0] < pg.get("Gm", pg["G"]) else 1))
                    if ws[i][0] >= pg.get("Gm", pg["G"]):
                        pg["xr"].append(ws[i][0])
        elif RE_Q0.match(t):
            for n in pg["lines"]:
                if n is l:
                    continue
                if abs(n["y0"] - l["y0"]) < 12 and l["x1"] - 3 <= n["x0"] <= l["x1"] + 45 and re.match(r"^\d{1,3}$", n["text"].strip()):
                    out.append((l["y0"], int(n["text"].strip()), 0 if l["x0"] < pg.get("Gm", pg["G"]) else 1))
                    break
    return sorted(out)


def faixa_texto(resto):
    nums = [int(x) for x in re.findall(r"\d+", resto)]
    if len(nums) >= 2 and re.search(r"\d+\s+a\s+\d+", resto):
        return list(range(nums[0], nums[1] + 1))
    return nums


def marcar_sequencia(pages, total=63, colunas=False):
    """Marcadores numéricos simples ('7' ou '7.') validados por sequência 1..total (páginas só avançam)."""
    ini = 0
    for pi, p in enumerate(pages):
        if sum(1 for l in p["lines"] if re.match(r"^\(A\)", l["text"].strip())) >= 2:
            ini = pi
            break
    cands = {}
    for pi in range(ini, len(pages)):
        pg = pages[pi]
        for l in pg["lines"]:
            t = l["text"].strip()
            if re.match(r"^\d{1,2}\.?$", t) and 35 < l["y0"] < pg["H"] - 60:
                n = int(t.rstrip("."))
                if 1 <= n <= total:
                    cands.setdefault(n, []).append((pi, l["y0"], l["x0"]))
    # âncoras de x0 (rótulos de eixo/figura caem fora delas)
    import collections
    h = collections.Counter(round(c[2] / 4) * 4 for v in cands.values() for c in v)
    picos = sorted(x for x, n in h.items() if n >= 7)
    ancoras = []
    for x in picos:
        if ancoras and x - ancoras[-1][-1] <= 14:
            ancoras[-1].append(x)
        else:
            ancoras.append([x])
    faixas = [(a[0] - 12, a[-1] + 12) for a in ancoras]
    sel, pi_min, prev = {}, ini, None
    for n in range(1, total + 1):
        c = sorted(x for x in cands.get(n, []) if x[0] >= pi_min)
        c = [x for x in c if any(lo <= x[2] <= hi for lo, hi in faixas)] or c
        if colunas and prev is not None:
            def col(x):
                return 0 if x[2] < pages[x[0]]["G"] else 1
            ok = [x for x in c if x[0] > prev[0] or (x[0] == prev[0] and (col(x), x[1]) > (col(prev), prev[1]))]
            c = ok or c
        if not c:
            continue
        sel[n] = c[0]
        pi_min = c[0][0]
        prev = c[0]
    for pg in pages:
        pg["marc_fixed"] = []
    for n, (pi, y, x) in sel.items():
        pg = pages[pi]
        pg["marc_fixed"].append((y, n, 0 if x < pg["G"] else 1, x))
    for pg in pages:
        pg["marc_fixed"].sort()
        pg["xr"] = [m[3] for m in pg["marc_fixed"] if m[2] == 1]
        pg["marc_fixed"] = [m[:3] for m in pg["marc_fixed"]]
    return len(sel)


def processar_moderno(pdf, pages, saida, rotulo):
    for pi, pg in enumerate(pages):
        W = pg["W"]
        pg["marc"] = pg["marc_fixed"] if "marc_fixed" in pg else achar_marcadores(pg)
        pg["marc"] = sorted(pg["marc"] + [(e[1], e[2], e[3]) for e in EXTRAS if e[0] == pi])
        pg["comp"] = []
        for l in pg["lines"]:
            m = RE_TXT.match(l["text"].strip())
            if m and l["y0"] > 30:
                pg["comp"].append((l["y0"], faixa_texto(m.group(3)), 0 if l["x0"] < pg.get("Gm", pg["G"]) else 1))
    # provas recentes: questões 1–5 aparecem duas vezes (opção inglês / opção espanhol); espanhol vira 101–105
    lang = None
    for pg in pages:
        ev = []
        for l in pg["lines"]:
            m = re.search(r"op[çc][ãa]o:?\s+(ingl[êe]s|espanhol)", l["text"], re.I)
            if m:
                ev.append((0 if l["x0"] < pg.get("Gm", pg["G"]) else 1, l["y0"], "h", m.group(1).lower()))
            elif re.match(r"^Quest[õo]es de 06", l["text"].strip(), re.I):
                ev.append((0 if l["x0"] < pg.get("Gm", pg["G"]) else 1, l["y0"], "h", None))
        for (y, q, c) in pg["marc"]:
            ev.append((c, y, "m", q))
        ev.sort(key=lambda e: (e[0], e[1]))
        novos = []
        for (c, y, t, v) in ev:
            if t == "h":
                lang = None if v is None else ("espanhol" if v.startswith("esp") else "ingles")
            else:
                if v > 5:
                    lang = None
                novos.append((y, v + 100 if (lang == "espanhol" and v <= 5) else v, c))
        pg["marc"] = sorted(novos)
    com = [i for i, p in enumerate(pages) if p["marc"]]
    if not com:
        return {}, set()
    ini, fim = min(com), max(com)
    topo_linha = min(m[0] for i in com for m in pages[i]["marc"]) - 3
    atual = None
    pecas, largos, compart = {}, set(), {}
    atual_largo = None  # questão de largura total que continua na página seguinte (ampliadas)
    for pi in range(ini, min(len(pages), fim + 3)):
        if pi > fim and atual_largo is None:
            break
        pg = pages[pi]
        W, H = pg["W"], pg["H"]
        rod = [l["y0"] for l in pg["lines"] if RE_RODAPE_PG.search(l["text"]) and l["y0"] > H * 0.8]
        if rod:
            base = min(rod) - 3
        else:
            rod2 = [l["y0"] for l in pg["lines"] if l["y0"] > H * 0.9 and re.search(r"AMARELA|PROVA|ENEM", l["text"].strip())]
            # número de página só vale se estiver na linha de algum rodapé textual (senão pode ser alternativa "7", "9")
            rod2 += [l["y0"] for l in pg["lines"] if l["y0"] > H * 0.9 and re.match(r"^\d{1,2}$", l["text"].strip()) and any(abs(l["y0"] - r) < 4 for r in rod2)]
            base = (min(rod2) - 3) if rod2 else H - 30
        for l in pg["lines"]:
            if re.search(r"Transcreva a sua Reda", l["text"]):  # início do rascunho da redação na mesma folha
                base = min(base, l["y0"] - 48)
        topo = topo_linha
        if atual_largo is not None and pi > fim:
            # páginas depois da última questão: só vale continuação de texto real (não capa/rascunho/redação)
            corpo = [l for l in pg["lines"] if topo <= l["y0"] < base]
            if len(corpo) < 3 or any(re.search(r"Exame Nacional|RASCUNHO|Folha de Redação", l["text"], re.I) for l in pg["lines"]):
                atual_largo = None
                continue
            base = min(base, max(l["y1"] for l in corpo) + 4)
        if atual_largo is not None:
            y_prim = min([m[0] for m in pg["marc"]] or [base + 3])
            if y_prim - topo > 10:
                pecas.setdefault(atual_largo, []).append((pi, pg["XL"], pg["XR"], topo, (y_prim + FOLGA[0]) if pg["marc"] else base))
            if pg["marc"]:
                atual_largo = None
        if not pg["marc"]:
            continue
        largo = {}
        for (y, q, c) in pg["marc"]:
            if c == 0 and (W > 700 or tinta_na_calha(pdf, pi, W, y, pg)):  # W>700: ampliadas, coluna única
                prox = [yy for (yy, _, _) in pg["marc"] if yy > y + 5]
                fim_ = (min(prox) + FOLGA[0]) if prox else (fim_largura_total(pdf, pi, W, y, base) if REGUA[0] else base)
                largo[q] = (y, fim_)
                largos.add(q)
        excl = [(a + FOLGA[0], b + 2) for (a, b) in largo.values()]

        def add(alvo, q, xa, xb, a, b):
            segs = [(a, b)]
            for (e0, e1) in excl:
                novo_segs = []
                for (s0, s1) in segs:
                    if e1 <= s0 or e0 >= s1:
                        novo_segs.append((s0, s1))
                    else:
                        if e0 - s0 > 6:
                            novo_segs.append((s0, e0))
                        if s1 - e1 > 6:
                            novo_segs.append((e1, s1))
                segs = novo_segs
            for (s0, s1) in segs:
                alvo.setdefault(q, []).append((pi, xa, xb, s0, s1))

        for col in (0, 1):
            xr = min([pg["G"]] + pg.get("xr", [])) - 2
            xa, xb = (pg["XL"], xr) if col == 0 else (xr, pg["XR"])
            ev = sorted([(y, "q", q) for (y, q, c) in pg["marc"] if c == col] + [(y, "t", r) for (y, r, c) in pg["comp"] if c == col])
            if not ev:
                if atual is not None:
                    add(pecas, atual, xa, xb, topo, base)
                continue
            cab_largo = pi == ini and any(
                topo <= l["y0"] <= ev[0][0] and l["x0"] < pg["G"] - 20 and l["x1"] > pg["G"] + 20 for l in pg["lines"]
            )
            if atual is not None and not cab_largo and ev[0][0] - topo > 10:
                add(pecas, atual, xa, xb, topo, ev[0][0] + FOLGA[0])
            for k, (y, tipo, v) in enumerate(ev):
                y2 = (ev[k + 1][0] + FOLGA[0]) if k + 1 < len(ev) else base
                if FOLGA[0] > 0 and k + 1 < len(ev):
                    ym = ev[k + 1][0]
                    for ln in pg["lines"]:
                        if ln["y0"] < ym + 0.5 and y2 < ln["y1"] < ym + 12 and ln["y0"] > y - 1 and xa - 2 <= ln["x0"] <= xb and not re.match(r"^\d{1,2}\.?$", ln["text"].strip()):
                            y2 = max(y2, ln["y1"] + 0.5)
                if tipo == "t":
                    for q in v:
                        add(compart, q, xa, xb, y - 3, y2)
                    continue
                if v in largo:
                    pecas.setdefault(v, []).append((pi, pg["XL"], pg["XR"], y - 3, largo[v][1]))
                    atual = None
                    atual_largo = v if largo[v][1] >= base - 1 else None
                    continue
                add(pecas, v, xa, xb, y - 3, y2)
                atual = v
                atual_largo = None
    # peça de coluna 0 sem nada começando na coluna 1 ao lado: alternativas em linha podem passar da calha
    for q in list(pecas):
        novos = []
        for (pi, xa, xb, a, b) in pecas[q]:
            pg = pages[pi]
            if xb <= pg["G"] + 6 and xb < pg["XR"] - 20:
                ao_lado = [l for l in pg["lines"] if a + 2 <= l["y0"] <= b - 2 and l["x0"] > pg["G"] + 6 and not re.match(r"^\(?[A-E]\)", l["text"].strip())]
                if not ao_lado:
                    xb = pg["XR"]
            novos.append((pi, xa, xb, a, b))
        pecas[q] = novos
    for q, ps in compart.items():
        if q in pecas:
            pecas[q] = ps + [p for p in pecas[q] if p not in ps]
    return pecas, largos


# ---------------------------------------------------------------- antigo
RE_NUM = re.compile(r"^\d{1,2}$")


def processar_antigo(pdf, pages, saida, rotulo, total=63):
    cands = []  # (pi, y, x, n)
    for pi, pg in enumerate(pages):
        for l in pg["lines"]:
            t = l["text"].strip()
            if RE_NUM.match(t) and 1 <= int(t) <= total and l["x0"] < pg["W"] * 0.45:
                cands.append((pi, l["y0"], l["x0"], int(t)))
    cands.sort()
    # sequência crescente 1..total
    esp, marc = 1, []
    for c in cands:
        if c[3] == esp:
            marc.append(c)
            esp += 1
    return marc


def fim_alternativas(pages, pi0, y0, pi1, y1):
    """Retorna (pi, y) logo após a última alternativa (E) entre as posições dadas."""
    ult = None
    for pi in range(pi0, pi1 + 1):
        for l in pages[pi]["lines"]:
            if pi == pi0 and l["y0"] < y0:
                continue
            if pi == pi1 and l["y0"] >= y1:
                continue
            if re.search(r"\(E\)", l["text"]):
                ult = (pi, l)
    if ult is None:
        return None
    pi, le = ult
    pg = pages[pi]
    xs = sorted(l["x0"] for l in pg["lines"] if l["text"].startswith("(A)"))
    x0 = xs[len(xs) // 2] if xs else le["x0"]
    y = le["y1"]
    for l in pg["lines"]:
        if l["y0"] <= le["y0"] + 1:
            continue
        if l["y0"] - y > 14:
            break
        if l["x0"] > x0 + 10 and not re.match(r"^\(?[A-E]\)", l["text"]) and not RE_NUM.match(l["text"].strip()) and l["y0"] < pg["H"] - 40:
            y = l["y1"]
        else:
            break
    return (pi, y + 2)


def main():
    pdf, saida, rotulo = sys.argv[1:4]
    Path(saida).mkdir(parents=True, exist_ok=True)
    pages = carregar(pdf)
    if (len(sys.argv) > 5 and "ocr" in sys.argv[5]) or texto_ilegivel(pages):
        print("camada de texto ilegível: usando OCR")
        pages = finalizar_paginas(carregar_ocr(pdf))
    if len(sys.argv) > 6:
        EXTRAS.extend(json.load(open(sys.argv[6])))
    if len(sys.argv) > 4 and sys.argv[4] != "-":
        for p in pages:
            p["G"] = float(sys.argv[4])
    modo = "moderno" if sum(len(achar_marcadores(p)) for p in pages) > 20 else "antigo"
    if len(sys.argv) > 5 and sys.argv[5].startswith("numeros"):
        print("marcadores numéricos:", marcar_sequencia(pages, colunas=sys.argv[5] == "numeros-col"))
        FOLGA[0] = 1.0
        modo = "moderno"
    resultado = []
    if modo == "moderno":
        REGUA[0] = sum(1 for p in pages for l in p["lines"] if re.match(r"^QUESTÃO \d{1,3}$", l["text"].strip())) > 20 and pages[0]["W"] < 700  # ampliadas (A3-ish) não têm régua de encerramento
        if os.environ.get("SEM_REGUA"):
            REGUA[0] = False  # provas 2020+: o filete de encerramento é fino e confunde com bordas de tabela/gráfico
        pecas, largos = processar_moderno(pdf, pages, saida, rotulo)
        for q in sorted(pecas):
            ps = []
            for (pi, xa, xb, y0, y1) in pecas[q]:
                ls = [l for l in pages[pi]["lines"] if l["y0"] >= y0 - 1 and l["y1"] <= y1 + 1 and xa - 2 <= l["x0"] <= xb]
                ps.append((pi + 1, xa, xb, y0, y1, None))
            txt = "\n".join(texto_regiao(pages[pi], xa, xb, y0, y1) for (pi, xa, xb, y0, y1) in pecas[q])
            nome = f"{rotulo}-q{q:03d}.png"
            ok = recortar(pdf, ps, os.path.join(saida, nome), regua=REGUA[0])
            resultado.append(dict(numero=q, imagem=nome if ok else None, texto=txt, largura_total=q in largos))
    else:
        marc = processar_antigo(pdf, pages, saida, rotulo)
        if not marc:
            print("sem marcadores", file=sys.stderr)
        topo, rodape = 70.0, 40.0
        ant = None
        for k, (pi, y, x, n) in enumerate(marc):
            # início: fim da questão anterior (ou topo da página dos marcadores)
            if k == 0:
                pg = pages[pi]
                ys = [l["y1"] for l in pg["lines"] if re.search(r"CASO CONTRÁRIO|PARTE OBJETIVA", l["text"]) and l["y0"] < y]
                ini = (pi, (max(ys) + 4) if ys else topo)
            else:
                ini = ant
            prox = marc[k + 1] if k + 1 < len(marc) else None
            lim = (prox[0], prox[1]) if prox else (len(pages) - 1, 10_000)
            f = fim_alternativas(pages, pi, y, lim[0], lim[1])
            if f is None:
                f = (lim[0], max(lim[1] - 2, 0)) if prox else (pi, pages[pi]["H"] - rodape)
            ant = f
            pecas = []
            for p in range(ini[0], f[0] + 1):
                pg = pages[p]
                a = ini[1] if p == ini[0] else topo
                b = f[1] if p == f[0] else pg["H"] - rodape
                pecas.append((p, 30.0, pg["W"] - 25.0, a, b))
            ps = [(p + 1, xa, xb, a, b) for (p, xa, xb, a, b) in pecas]
            txt = "\n".join(texto_regiao(pages[p], xa, xb, a, b) for (p, xa, xb, a, b) in pecas)
            nome = f"{rotulo}-q{n:03d}.png"
            ok = recortar(pdf, ps, os.path.join(saida, nome))
            resultado.append(dict(numero=n, imagem=nome if ok else None, texto=txt))
    json.dump(dict(rotulo=rotulo, modo=modo, total=len(resultado), questoes=resultado), open(os.path.join(saida, f"{rotulo}.json"), "w"), ensure_ascii=False, indent=1)
    print(rotulo, modo, len(resultado), "questões")


if __name__ == "__main__":
    main()
