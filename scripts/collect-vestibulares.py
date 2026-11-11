"""Collect public official UNESP/Comvest documents, with provenance and SHA-256.

Run from the repository root with Python 3 and Poppler's pdftotext installed.
No candidate data, login pages, or unofficial mirrors are collected.
"""
import argparse
import concurrent.futures as futures
import hashlib
import json
import re
import subprocess
import time
import unicodedata
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, urldefrag, quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'tmp' / 'vestibulares'
CACHE.mkdir(parents=True, exist_ok=True)
ALLOWED = {'www.vunesp.com.br', 'documento.vunesp.com.br', 'vestibular.unesp.br', 'www.comvest.unicamp.br', 'comvest.unicamp.br'}

def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')

def get(url):
    if urlparse(url).hostname not in ALLOWED or urlparse(url).scheme not in ('http', 'https'):
        raise ValueError('Nonofficial source: ' + url)
    last = None
    for attempt in range(2):
        try:
            with urlopen(Request(url, headers={'User-Agent': 'Gabaru official examination archive (public educational documents)'}), timeout=35) as r:
                if urlparse(r.url).hostname not in ALLOWED:
                    raise ValueError('Nonofficial redirect: ' + r.url)
                return r.read()
        except Exception as e:
            last = e
    raise last

def html(url):
    p = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.html')
    if not p.exists():
        p.write_bytes(get(url))
    return p.read_text(errors='replace')

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.href = None
        self.label = ''
        self.text = ''
        self.before = ''
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self.href = dict(attrs).get('href')
            self.label = ''
            self.before = self.text[-300:]
    def handle_data(self, data):
        self.text += data + ' '
        if self.href:
            self.label += data
    def handle_endtag(self, tag):
        if tag == 'a' and self.href:
            self.links.append({'url': self.href, 'label': ' '.join(self.label.split()), 'context': ' '.join(self.before.split())})
            self.href = None

def links(url):
    p = Links(); p.feed(html(url))
    output = []
    for x in p.links:
        target = urldefrag(urljoin(url, x['url']))[0].replace('http://', 'https://', 1)
        if target.startswith('p://www.comvest.unicamp.br/'):
            target = 'https://' + target[4:]
        target = quote(target, safe=':/?&=%@+;,-._~')
        output.append(dict(x, url=target))
    return output

def classify(label):
    s = norm(label).replace('-', ' ').replace('_', ' ')
    if any(x in s for x in ['errata', 'nota de esclarecimento', 'informacoes complementares']): return 'comunicado'
    if 'comentad' in s: return 'prova-comentada'
    if any(x in s for x in ['gabarito', 'respostas', 'resposta esperada', 'grade de correcao', 'expectativa', 'resp.pdf']) or re.search(r'resp(?:\s*\d+)?\.pdf', s): return 'gabarito'
    return 'prova'

def phase(doc):
    s = norm(doc['label'] + ' ' + doc['url'])
    if doc['kind'].startswith('relatorio'): return 'Relatório oficial'
    if re.search(r'/(?:he|habilidades)/', s) or any(w in s for w in ['artes cenicas', 'artes visuais', 'musica', 'danca', 'arquitetura', 'educacao artistica']): return 'Habilidades específicas'
    if 'conhecimentos gerais' in s or 'primeira fase' in s or re.search(r'/(?:f1|fase1)[/.]|/f1\d{4}', s): return '1ª fase'
    if 'conhecimentos especificos' in s or 'segunda fase' in s or re.search(r'/(?:f2|fase2)[/.]', s): return '2ª fase'
    if re.search(r'provas [qrst]\b', s): return '1ª fase'
    if doc['kind'] == 'gabarito' and doc['year'] >= 2011 and ('respostas' in s or 'expectativa' in s or 'redacao' in s): return '2ª fase'
    occurrences = re.findall(r'([12])[^0-9]{0,5}fase', norm(doc.get('context', '')))
    return occurrences[-1] + 'ª fase' if occurrences else 'Documento da seleção'

def verify(doc):
    key = hashlib.sha256(doc['url'].encode()).hexdigest()
    file = CACHE / (key + '.pdf')
    try:
        if not file.exists(): file.write_bytes(get(doc['url']))
        b = file.read_bytes()
        if not b.startswith(b'%PDF-'): raise ValueError('Not a PDF')
        textfile = CACHE / (key + '.txt')
        if not textfile.exists(): subprocess.run(['pdftotext', '-layout', str(file), str(textfile)], check=True, capture_output=True)
        text = textfile.read_text(errors='replace')
        pages = text.split('\f')
        if not pages[-1].strip(): pages.pop()
        if re.match(r'\s*GABARITO', pages[0], re.I): doc['kind'] = 'gabarito'
        if doc['institution'] == 'unicamp':
            # Some annual pages retain links from the previous selection. Use
            # the year in the official file path or its cover, not a copied menu.
            year_in_url = re.search(r'/(?:vest_anteriores|vestanteriores)/(19\d\d|20\d\d)(?:_|/)|/vest_?(19\d\d|20\d\d)/', doc['url'], re.I)
            year_on_cover = re.search(r'(?:vestibular(?:\s+unicamp)?|unicamp)[^\d]{0,30}(19\d\d|20\d\d)', pages[0][:1800], re.I)
            if year_in_url: doc['year'] = int(next(x for x in year_in_url.groups() if x))
            elif year_on_cover: doc['year'] = int(year_on_cover.group(1))
        start = 1
        if doc['kind'] == 'relatorio-com-provas':
            # Modern reports append the original booklets; older reports reproduce
            # the questions in their performance chapter, in a different layout.
            for i, page in enumerate(pages):
                if i > len(pages) // 2 and re.search(r'(PROVA\s+DE\s+CONHECIMENTOS|CONHECIMENTOS\s+GERAIS|CONHECIMENTOS\s+ESPEC[IÍ]FICOS)', page, re.I) and re.search(r'(confira seus dados impressos|n[aã]o abra este caderno)', page, re.I):
                    start = i + 1; break
            if start == 1:
                for i, page in enumerate(pages):
                    if i > len(pages) // 4 and re.search(r'PROVA\s+DE\s+CONHECIMENTOS\s+GERAIS', page, re.I) and re.search(r'\([ABCDEabcde]\)', page):
                        start = i + 1
                        doc.update(kind='relatorio-com-questoes', label='Questões reproduzidas no relatório oficial da Vunesp')
                        break
            if start == 1: raise ValueError('No original booklet or reproduced examination questions identified')
        doc.update(sha256=hashlib.sha256(b).hexdigest(), bytes=len(b), pages=len(pages), startPage=start, status='verified')
        return doc
    except Exception as e:
        return dict(doc, status='unavailable', error=str(e)[:200])

def unesp():
    source = 'https://www.vunesp.com.br/Institucional/EstatisticaVestibular'
    entries = links(source)
    docs = []
    projects = []
    for l in entries:
        if 'RelatorioUnesp' in l['url'] and re.fullmatch(r'20\d\d', l['label']):
            docs.append(dict(institution='unesp', year=int(l['label']), application='regular', label='Cadernos de provas nos anexos oficiais da Vunesp', kind='relatorio-com-provas', url=l['url'], source=source))
        if re.search(r'Vestibular.*20\d\d', l['label']) and re.search('/VNSP', l['url'], re.I):
            projects.append((l['label'], l['url']))
    projects.append(('Vestibular Meio de Ano 2026', 'https://www.vunesp.com.br/VNSP2513/'))
    def collect(item):
        label, url = item
        year = int(re.search(r'20\d\d', label).group())
        project = re.search(r'VNSP\w+', url, re.I).group().upper()
        page = 'https://documento.vunesp.com.br/projeto/' + project + '/documento/'
        output = []
        for l in links(page):
            s = norm(l['label'])
            if l['label'] and ('caderno de quest' in s or s.startswith('gabarito') or s.startswith('prova') and not any(w in s for w in ['atendimento', 'local', 'horario', 'convoc', 'recurso'])) and '/documento/stream/' in l['url']:
                output.append(dict(institution='unesp', year=year, application='meio-de-ano' if 'meio' in norm(label) else 'regular', label=l['label'].split(' - (vers')[0], kind=classify(l['label']), url=l['url'], source=page))
        return output
    with futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(collect, projects): docs.extend(result)
    return docs, []

def unicamp():
    source = 'https://www.comvest.unicamp.br/vestibulares-anteriores/'
    years = []
    for l in links(source):
        if re.fullmatch(r'(Ingresso|Vestibular) (19\d\d|20\d\d)', l['label']) and int(l['label'][-4:]) <= 2026:
            years.append((int(l['label'][-4:]), l['url']))
    def collect(item):
        year, start = item
        queue = deque([(start, 0)]); seen = set(); docs = []; errors = []
        while queue:
            page, depth = queue.popleft()
            if page in seen: continue
            seen.add(page)
            try: page_links = links(page)
            except Exception as e:
                errors.append({'year': year, 'source': page, 'error': str(e)}); continue
            for l in page_links:
                u, label = l['url'], l['label']
                parsed = urlparse(u)
                if parsed.hostname not in ('www.comvest.unicamp.br', 'comvest.unicamp.br'): continue
                s = norm(label + ' ' + u)
                if parsed.path.lower().endswith('.pdf'):
                    is_legacy = re.search(r'/(?:vest_anteriores|vestanteriores)/' + str(year) + r'/', u, re.I) or re.search(r'/vest_?' + str(year) + r'/', u, re.I)
                    is_document = any(w in s for w in ['prova', 'gabarito', 'resposta', 'esperada', 'fase', 'redacao', 'portugues', 'matematica', 'fisica', 'quimica', 'biologia', 'historia', 'geografia', 'lingua', 'caderno', 'arquitetura', 'artes', 'musica', 'danca'])
                    excluded = any(w in s for w in ['manual', 'programa', 'edital', 'diretriz', 'resolucao', 'classificac', 'isencao', 'beneficiad', 'informa_', 'resultado', 'inscrit', 'convocad', 'anuario', 'aprovad', 'relatorio', 'abstencao', 'bibliografia', 'notas de corte'])
                    if not excluded and (is_legacy or is_document):
                        answer_context = 'respostas esperadas' if 'respostas-esperadas' in page else ''
                        docs.append(dict(institution='unicamp', year=year, application='regular', label=label or parsed.path.split('/')[-1], context=l['context'], kind=classify(label + ' ' + parsed.path + ' ' + answer_context), url=u, source=page))
                elif depth < 3 and str(year) in parsed.path and (parsed.path.rstrip('/').endswith('/vestibular-' + str(year)) or any(w in norm(label + ' ' + parsed.path.split('/')[-2]) for w in ['provas', 'respostas', 'gabarito', '1a-fase-2a-fase'])):
                    if not any(w in s for w in ['indigena', 'remanescentes', 'isencao', 'base-de-dados-comvest']): queue.append((u, depth+1))
        return docs, errors
    output, errors = [], []
    with futures.ThreadPoolExecutor(max_workers=5) as pool:
        for docs, errs in pool.map(collect, sorted(set(years), reverse=True)):
            output.extend(docs); errors.extend(errs)
    return output, errors

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('institution', choices=['unesp', 'unicamp']); parser.add_argument('--discover-only', action='store_true'); args = parser.parse_args()
    docs, errors = globals()[args.institution]()
    unique = {}
    # Prefer the earliest annual source when a later page copied an older link.
    for d in sorted(docs, key=lambda d: d['year']): unique.setdefault(d['url'], d)
    docs = [d for d in unique.values() if not any(w in norm(d['label']) for w in ['bibliografia', 'notas de corte'])]
    print(f'{args.institution}: {len(docs)} official document URLs discovered', flush=True)
    (CACHE / (args.institution + '-candidates.json')).write_text(json.dumps(docs, ensure_ascii=False, indent=2))
    if args.discover_only: return
    results = []
    with futures.ThreadPoolExecutor(max_workers=5) as pool:
        for d in pool.map(verify, docs):
            results.append(d); print(f'{d["year"]} {d["status"]}: {d["label"][:75]}', flush=True)
    verified, unavailable, hashes = [], [], {}
    for d in results:
        if d['status'] != 'verified': unavailable.append(d); continue
        if d['sha256'] in hashes:
            hashes[d['sha256']].setdefault('alternateSources', []).append(d['url']); continue
        d['phase'] = phase(d)
        if re.search(r'/1988_2/', d['url']): d['application'] = 'segundo-vestibular'
        d['id'] = str(d['year']) + '-' + d['application'] + '-' + d['sha256'][:12]
        hashes[d['sha256']] = d; verified.append(d)
    catalog = {'institution': args.institution, 'checkedAt': time.strftime('%Y-%m-%d', time.gmtime()), 'documents': sorted(verified, key=lambda d: (-d['year'], d['application'], d['kind'], d['label'])), 'unavailable': unavailable, 'discoveryErrors': errors}
    target = ROOT / 'src' / 'data' / (args.institution + '-archive.json')
    target.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(f'Saved {len(verified)} verified documents; {len(unavailable)} unavailable; {len(errors)} discovery errors', flush=True)

if __name__ == '__main__': main()
