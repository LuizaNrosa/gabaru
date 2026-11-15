#!/usr/bin/env python3
"""Extrai as notas de corte da primeira para a segunda fase FUVEST 2026.

Uso: python3 extrair-fuvest-cortes.py [documento.pdf] [saida.json].
Requer pdftotext (Poppler). O PDF deve ser a publicação oficial de oito páginas.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
pdf=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/tmp/fuvest2026-cortes.pdf')
out=Path(sys.argv[2]) if len(sys.argv)>2 else Path('/tmp/fuvest2026-cortes.json')
blob=pdf.read_bytes();assert blob.startswith(b'%PDF-')
text=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True)
pages=[p for p in text.split('\f') if p.strip()];assert len(pages)==8
assert all('FUVEST 2026' in p and 'Listagem por Carreira' in p and 'PONTOS CONVOCADOS' in p and 'MÍNIMO' in p and 'MÁXIMO' in p for p in pages[:6])
assert all('Cálculo das Notas de Corte' in p and 'VAGAS AC: TODAS MODALIDADES' in p and 'VAGAS EP: MODALIDADES EP / PPI' in p and 'VAGAS PPI: MODALIDADE PPI' in p for p in pages[6:])
items=[];carreiras={};current=None;labels=['Ampla Concorrência','Candidatos de Escola Pública','Candidatos de Escola Pública − Grupo PPI'];ids=['AC','EP','PPI']
for page,p in enumerate(pages[:6],1):
 for line in p.splitlines():
  m=re.match(r'^\s*(\d{3})\s*−\s*(\S.*?)\s{2,}(\d.*)$',line)
  if m:
   code=m[1];assert code not in carreiras;name=m[2].strip();carreiras[code]=name;current=code;continue
  if line.lstrip().startswith('Total '):current=None;continue
  if current and re.match(r'^\s*−\s*(?:Ampla Concorrência|Candidatos de Escola Pública)',line):
   label=line.strip().split('  ')[0].strip().lstrip('−').strip();assert label in labels,(current,label)
   nums=re.findall(r'\d+(?:\.\d+)?',line);assert len(nums)==7,(current,line,nums)
   vagas,inscritos,ausentes,convocados=map(int,nums[:4]);proporcao=float(nums[4]);minimo,maximo=map(int,nums[5:]);assert 0<=minimo<=maximo<=90
   assert 0<=ausentes<=inscritos and convocados>=0 and vagas>0
   items.append({'ano':2026,'fase':'convocacao_segunda_fase','carreira_codigo':current,'carreira':carreiras[current],'modalidade':ids[labels.index(label)],'modalidade_descricao':label,'vagas':vagas,'inscritos':inscritos,'ausentes':ausentes,'convocados':convocados,'convocados_por_vaga':proporcao,'corte_acertos':minimo,'acertos_maximos':maximo,'pagina':page})
assert len(carreiras)==77 and len(items)==231 and len({(x['carreira_codigo'],x['modalidade']) for x in items})==231
# Confere cada mínimo com a tabela independente de cálculo do mesmo boletim.
calculos={}
for p in pages[6:]:
 for line in p.splitlines():
  m=re.match(r'^\s*(\d{3})\s*−\s*(.*?)\s{2,}(\d.*)$',line)
  if not m:continue
  nums=list(map(int,re.findall(r'\d+',m.group(3))));assert len(nums)==24,(m[1],nums)
  assert m[1] not in calculos;calculos[m[1]]={'AC':nums[5],'EP':nums[11],'PPI':nums[17]}
assert set(calculos)==set(carreiras) and all(x['corte_acertos']==calculos[x['carreira_codigo']][x['modalidade']] for x in items)
result={'titulo':'FUVEST 2026 — notas de corte para a segunda fase por carreira e modalidade','fonte':'https://www.fuvest.br/wp-content/uploads/fuvest2026_notas_de_corte.pdf','sha256_fonte':hashlib.sha256(blob).hexdigest(),'unidade':'acertos','aviso':'Número mínimo de pontos dos convocados à segunda fase, por carreira e modalidade; não é nota final de aprovação nem garantia em edição futura.','quantidade_carreiras':len(carreiras),'quantidade_registros':len(items),'registros':items}
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(f"{len(carreiras)} carreiras; {len(items)} registros; SHA-256 {result['sha256_fonte']}; confrontados com páginas 7–8")
