#!/usr/bin/env python3
"""Extraia notas para a segunda fase do boletim oficial FUVEST 2027.
Uso: python3 extrair-fuvest2027-cortes.py [documento.pdf] [saida.json]. Requer pdftotext e PyMuPDF.
"""
import hashlib,json,re,subprocess,sys
import fitz
from pathlib import Path
pdf=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/tmp/fuvest2027-cortes.pdf')
out=Path(sys.argv[2]) if len(sys.argv)>2 else Path('/tmp/fuvest2027-cortes.json')
blob=pdf.read_bytes();assert blob.startswith(b'%PDF-')
text=subprocess.check_output(['pdftotext','-layout',str(pdf),'-'],text=True)
pages=[p for p in text.split('\f') if p.strip()];assert len(pages)==6
assert all('FUVEST 2027' in p and 'Listagem por Carreira' in p and 'PONTOS CONVOCADOS' in p and 'MÍNIMO' in p and 'MÁXIMO' in p for p in pages)
items=[];carreiras={};current=None;labels=['Ampla Concorrência','Candidatos de Escola Pública','Candidatos de Escola Pública − Grupo PPI'];ids=['AC','EP','PPI']
for page,p in enumerate(pages,1):
 for line in p.splitlines():
  m=re.match(r'^\s*(\d{3})\s*−\s*(\S.*?)\s{2,}(\d.*)$',line)
  if m:
   code=m[1];assert code not in carreiras;name=m[2].strip();carreiras[code]=name;current=code;continue
  if line.lstrip().startswith('Total '):current=None;continue
  if current and re.match(r'^\s*−\s*(?:Ampla Concorrência|Candidatos de Escola Pública)',line):
   cols=re.split(r'\s{2,}',line.strip());assert len(cols)==8,(current,cols)
   label=cols[0].lstrip('−').strip();assert label in labels,(current,label)
   vagas,inscritos,ausentes,convocados=map(int,cols[1:5]);n=lambda x:None if re.fullmatch(r'[−–-]+',x) else x
   proporcao=n(cols[5]);minimo=n(cols[6]);maximo=n(cols[7]);proporcao=float(proporcao) if proporcao is not None else None;minimo=int(minimo) if minimo is not None else None;maximo=int(maximo) if maximo is not None else None
   assert (minimo is None and maximo is None) or (minimo is not None and maximo is not None and 0<=minimo<=90 and 0<=maximo<=90 and (minimo<=maximo or (current=='315' and label==labels[2] and convocados==0 and minimo==24 and maximo==0)))
   assert 0<=ausentes<=inscritos and convocados>=0 and vagas>0
   items.append({'ano':2027,'fase':'convocacao_segunda_fase','carreira_codigo':current,'carreira':carreiras[current],'modalidade':ids[labels.index(label)],'modalidade_descricao':label,'vagas':vagas,'inscritos':inscritos,'ausentes':ausentes,'convocados':convocados,'convocados_por_vaga':proporcao,'corte_acertos':minimo,'acertos_maximos':maximo,'situacao':'sem_convocados' if convocados==0 else ('corte_nao_divulgado' if minimo is None else 'informado'),'pagina':page})
assert len(carreiras)==77 and len(items)==231 and len({(x['carreira_codigo'],x['modalidade']) for x in items})==231
missing=[x for x in items if x['corte_acertos'] is None];assert len(missing)==1 and missing[0]['carreira_codigo']=='104' and missing[0]['modalidade']=='PPI'
# Segundo parser independente: lê geometria da página (PyMuPDF), em vez da
# saída textual do Poppler, e compara os 231 valores nas colunas MÍNIMO/MÁXIMO.
geometric=[]
with fitz.open(pdf) as document:
 for page in document:
  words=page.get_text('words')
  headings=sorted([w for w in words if w[4] in ('Ampla','Candidatos') and 48<w[0]<52],key=lambda w:w[1])
  for heading in headings:
   if len(geometric)>=len(items):break # as últimas três linhas são totais
   y=heading[1]
   mins=[w for w in words if 510<w[0]<540 and y-10<w[1]<y+2 and (w[4].isdigit() or '−' in w[4])]
   maxs=[w for w in words if w[0]>550 and y-5<w[1]<y+4 and (w[4].isdigit() or '−' in w[4])]
   assert len(mins)==len(maxs)==1,(y,mins,maxs)
   num=lambda w:int(w[4]) if w[4].isdigit() else None
   geometric.append((num(mins[0]),num(maxs[0])))
assert len(geometric)==len(items) and all(pair==(item['corte_acertos'],item['acertos_maximos']) for pair,item in zip(geometric,items))
# Contagens de inscrição e vagas conferidas contra linha Total da publicação.
assert sum(x['vagas'] for x in items)==8747
result={'titulo':'FUVEST 2027 — notas de corte para a segunda fase por carreira e modalidade','fonte':'https://www.fuvest.br/wp-content/uploads/fuvest2027-notas-de-corte.pdf','sha256_fonte':hashlib.sha256(blob).hexdigest(),'unidade':'acertos','aviso':'Pontos mínimos impressos para convocação à segunda fase, por carreira e modalidade; não são nota final de aprovação nem garantia futura. Traços são null; sem_convocados indica ausência de candidato convocado mesmo se a fonte imprimir mínimo.','quantidade_carreiras':len(carreiras),'quantidade_registros':len(items),'quantidade_cortes_nao_divulgados':len(missing),'registros':items}
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(f"{len(carreiras)} carreiras; {len(items)} registros; {len(missing)} sem corte informado; confronto geométrico 231/231; SHA-256 {result['sha256_fonte']}")
