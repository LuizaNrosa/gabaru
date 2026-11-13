#!/usr/bin/env python3
"""Prepara primeiras provas UERJ e UEL 2026; executa com pasta dos PDFs oficiais baixados. Requer PyMuPDF, Pillow e pdftotext."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import fitz
from PIL import Image
root=Path(__file__).resolve().parents[1];folder=Path(sys.argv[1]);out=[]
# O gabarito UERJ separa idiomas em colunas; as sequências abaixo foram transcritas
# por seção e conferidas contra o PDF oficial, inclusive a anulação expressa.
uerj={
 'uerj-2026-eq1':{'comum':('ACBC DADB'.replace(' ',''),'BDBCDCAD AACDBA'.replace(' ',''),'ADCCBBA','BCA*ACCB DDDA'.replace(' ',''),'ACDADB CBD BCCAB'.replace(' ','')),'idiomas':{'espanhol':'DDCAB','frances':'CCDBA','ingles':'DCADB'}},
 'uerj-2026-eq2':{'comum':('ADBACBDC','BAACDCAB B DCDAB'.replace(' ',''),'BACCADD','DCADACDBBCAB','AADDAB CBBDACCD'.replace(' ','')),'idiomas':{'espanhol':'BDBAC','frances':'BCABD','ingles':'CAABD'}}}
configs=[('uerj-2026-eq1','uerj-1-prova.pdf','uerj-1-gabarito.pdf','UERJ 2026 · 1º Exame de Qualificação','https://www.vestibular.uerj.br/?p=15701',4),('uerj-2026-eq2','uerj-2-prova.pdf','uerj-2-gabarito.pdf','UERJ 2026 · 2º Exame de Qualificação','https://www.vestibular.uerj.br/?page_id=15994',4),('uel-2026-ingles-tipo1','uel-ingles-sem-resolucao.pdf','uel-ingles-gabarito.pdf','UEL 2026 · Conhecimentos Gerais · Inglês · Tipo 1','https://www.cops.uel.br/v2/ProvasGabaritos/DivulgacaoProvasGabaritos1DiaVestibularDefinitivo/Selecao/370/Atividade/20969',5),('uel-2026-espanhol-tipo1','uel-espanhol-sem-resolucao.pdf','uel-espanhol-gabarito.pdf','UEL 2026 · Conhecimentos Gerais · Espanhol · Tipo 1','https://www.cops.uel.br/v2/ProvasGabaritos/DivulgacaoProvasGabaritos1DiaVestibularDefinitivo/Selecao/370/Atividade/20969',5)]
for id,pfile,kfile,title,source,opts in configs:
 p=folder/pfile;k=folder/kfile;pb=p.read_bytes();kb=k.read_bytes();assert b'%PDF-' in pb[:10] and b'%PDF-' in kb[:10]
 key=subprocess.check_output(['pdftotext','-layout',str(k),'-'],text=True,stderr=subprocess.DEVNULL);doc=fitz.open(p);text=' '.join(page.get_text() for page in list(doc)[:5]).lower()
 if id.startswith('uel'):
  assert 'vestibular uel 2026' in key.lower() and 'gabarito oficial definitivo' in key.lower() and 'alternativa correta:' not in text
  pairs=re.findall(r'^\s*(\d{1,2})\s+([A-E*])\s*$',key,re.M);ans={int(n):a for n,a in pairs};assert len(pairs)==60 and sorted(ans)==list(range(1,61));assert 'pontos atribuídos para todos' in key.lower()
  comment=(folder/('uel-ingles-prova.pdf' if 'ingles' in id else 'uel-espanhol-prova.pdf'));commenttxt=subprocess.check_output(['pdftotext','-layout',str(comment),'-'],text=True);assert 'Alternativa correta: QUESTÃO ANULADA' in commenttxt
  keys={'padrao':[ans[n] for n in range(1,61)]}; assert [n for n in ans if ans[n]=='*']==([41] if 'ingles' in id else [43])
 else:
  assert 'vestibular estadual' in key.lower() and '2026' in key and 'sessenta questões' in text
  parts=uerj[id]['comum'];assert [len(x) for x in parts]==[8,14,7,12,14];keys={lang:list(parts[0]+parts[1]+vals+parts[2]+parts[3]+parts[4]) for lang,vals in uerj[id]['idiomas'].items()}
  assert all(len(v)==60 for v in keys.values());assert ('ANU' in key and 'LADA' in key) if id.endswith('eq1') else all('*' not in v for v in keys.values())
 asset=root/'public/acervo'/id;asset.mkdir(parents=True,exist_ok=True);(asset/'prova.pdf').write_bytes(pb)
 for n,page in enumerate(doc,1):
  pix=page.get_pixmap(matrix=fitz.Matrix(1.6,1.6),alpha=False);Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(asset/f'{n:02}.webp','WEBP',quality=80,method=4)
 out.append({'id':id,'instituicao':'UERJ' if id.startswith('uerj') else 'UEL','titulo':title,'ano':2026,'paginas':len(doc),'inicio':3 if id.startswith('uerj') else 4,'alternativas':list('ABCD' if opts==4 else 'ABCDE'),'gabaritos':keys,'fonte':source,'sha256_prova':hashlib.sha256(pb).hexdigest(),'sha256_gabarito':hashlib.sha256(kb).hexdigest(),'prova_arquivo':pfile,'gabarito_arquivo':kfile})
 print(id,len(doc),'pages',len(next(iter(keys.values()))),'questões')
(root/'src/data/uerj-uel-2026.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
