#!/usr/bin/env python3
"""Extrai tabela pública de demanda do IFSP. Uso: python3 script.py fonte.pdf saída.json."""
import hashlib, json, re, sys
from pathlib import Path
import fitz

source, dest = map(Path, sys.argv[1:])
sha = hashlib.sha256(source.read_bytes()).hexdigest()
assert sha == 'fb4a8b1ed0ecf70c376ff48dd6f2a5fe1c410d5549806a03e83b4bd1415b0bd0', 'PDF diferente do documento conferido'
doc = fitz.open(source)
assert len(doc) == 9
ofertas = []
for numero, pagina in enumerate(doc, 1):
    palavras = pagina.get_text('words')
    for n in [w for w in palavras if 540 < w[0] < 580 and w[4].isdigit() and 180 < w[1] < 560]:
        centro = (n[1] + n[3]) / 2
        def celula(inicio, fim):
            itens = [w for w in palavras if inicio <= w[0] < fim and abs((w[1] + w[3]) / 2 - centro) < 13]
            return ' '.join(w[4] for w in sorted(itens, key=lambda w: (w[1], w[0])))
        def textos(lista):
            return ' '.join(w[4] for w in sorted(lista, key=lambda w: (w[1], w[0])))
        faixa = [w for w in palavras if 40 <= w[0] < 530 and abs((w[1] + w[3]) / 2 - centro) < 13]
        # Course names may wrap and begin inside the campus column. Campus
        # names are uppercase in the source; course names start with Técnico.
        campus = textos([w for w in faixa if w[0] < 180 and w[4].isupper()])
        oferta = textos([w for w in faixa if w[0] >= 180 or not w[4].isupper()])
        if oferta == 'TOTAL':
            continue
        candidatos, relacao = celula(600, 680), celula(700, 770)
        match = re.fullmatch(r'(.+) Integrado ao Ensino Médio - (Integral|Matutino|Vespertino|Noturno)', oferta)
        assert campus and match and candidatos.isdigit() and re.fullmatch(r'\d+(?:,\d+)?(?: \*)?', relacao), (numero, campus, oferta, candidatos, relacao)
        vagas, inscritos = int(n[4]), int(candidatos)
        demanda = float(relacao.replace(' *', '').replace(',', '.'))
        # Two decimal places, allowing rounding differences at half-cent boundaries.
        assert abs(demanda - inscritos / vagas) <= .0050001
        ofertas.append({'campus': campus, 'curso': match.group(1), 'turno': match.group(2), 'vagas': vagas, 'inscritos': inscritos, 'candidatos_por_vaga': demanda, 'dispensada_prova': '*' in relacao, 'pagina': numero})
assert len(ofertas) == 103 and sum(o['vagas'] for o in ofertas) == 4504 and sum(o['inscritos'] for o in ofertas) == 25080
assert len({(o['campus'],o['curso'],o['turno']) for o in ofertas}) == len(ofertas)
resultado = {'edicao':'2027/1', 'fonte':'https://processoseletivo.ifsp.edu.br/media/public/b/b8a5zzas16ucrbkctvezipuba/2k/2km0wi3rfyob9uwcryb1ta16j.pdf', 'edital':'https://processoseletivo.ifsp.edu.br/media/public/b/b8a5zzas16ucrbkctvezipuba/f0/f0ocltqkzehub6y4vpqijui2h.pdf', 'sha256':sha, 'ofertas':ofertas}
dest.write_text(json.dumps(resultado,ensure_ascii=False,indent=2)+'\n')
