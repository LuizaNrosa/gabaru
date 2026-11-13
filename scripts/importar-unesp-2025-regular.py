#!/usr/bin/env python3
"""Importa prova regular UNESP 2025 e gabarito da versão 1 a partir de PDFs oficiais.
Uso: python scripts/importar-unesp-2025-regular.py /pasta/com/pdfs
Arquivos: unesp-2025-prova.pdf e unesp-2025-key.pdf. Requer pdftotext e pdfinfo.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
if len(sys.argv)!=2:raise SystemExit(__doc__)
folder=Path(sys.argv[1]);proof=folder/'unesp-2025-prova.pdf';key=folder/'unesp-2025-key.pdf'
txt=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(key),'-'],text=True)
if not all(v in txt for v in ['VESTIBULAR 2025','15.11.2024','Versão 1','001. PROVA DE CONHECIMENTOS GERAIS']):raise SystemExit('Cabeçalho do gabarito não corresponde à prova')
pairs=re.findall(r'(?<!\d)(\d{1,2})\s*-\s*([A-E])(?!\w)',txt);answers={}
for n,a in pairs:
 n=int(n)
 if n in answers:raise SystemExit('Questão duplicada')
 answers[n]=a
if sorted(answers)!=list(range(1,91)):raise SystemExit('Gabarito incompleto')
info=subprocess.check_output(['pdfinfo',str(proof)],text=True)
if not re.search(r'^Pages:\s*32\s*$',info,re.M):raise SystemExit('Páginas inesperadas')
cover=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(proof),'-'],text=True)
if not all(v in cover for v in ['VESTIBULAR 2025','001. Prova de Conhecimentos gerais','90 questões']):raise SystemExit('Capa não corresponde à prova')
d={'id':'2025-regular-b2702765445d','ano':2025,'aplicacao':'regular','fase':'1ª fase','versao':'1','gabarito':[answers[n] for n in range(1,91)],'fonte_prova':'https://documento.vunesp.com.br/documento/stream/NjU5MzI0Mg%3d%3d','fonte_gabarito':'https://documento.vunesp.com.br/documento/stream/NjU5MzIzOA%3d%3d','sha256_prova':hashlib.sha256(proof.read_bytes()).hexdigest(),'sha256_gabarito':hashlib.sha256(key.read_bytes()).hexdigest()}
print(json.dumps(d,ensure_ascii=False,indent=2))
