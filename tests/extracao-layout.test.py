"""Synthetic PDF tests exercise geometry ordering and official-key parsing, offline."""
import json,subprocess,tempfile,os
from pathlib import Path
import pymupdf
with tempfile.TemporaryDirectory() as tmp:
 root=Path(tmp);doc=pymupdf.open();p=doc.new_page(width=600,height=800)
 # Deliberately insert right column first, to defeat raw PDF insertion order.
 for number,x in [(92,320),(91,30)]:
  p.insert_text((x,90),f'QUESTAO {number}',fontsize=12)
  p.insert_text((x,125),'Enunciado completo para testar a ordem das colunas.',fontsize=8)
  for i,l in enumerate('ABCDE'):p.insert_text((x,160+i*35),f'({l}) alternativa {l} da questao {number}',fontsize=10)
 doc.save(root/'prova.pdf');key=pymupdf.open();k=key.new_page();k.insert_text((40,50),'91 A\n92 B',fontsize=12);key.save(root/'key.pdf')
 job={'pdf':str(root/'prova.pdf'),'gabarito':str(root/'key.pdf'),'assets':str(root/'assets'),'esperadas':2,'numeroMaximo':92}
 result=subprocess.run([os.environ.get('PDF_PYTHON','python'),'scripts/lib/extrair-layout.py'],input=json.dumps(job),text=True,capture_output=True,check=True)
 data=json.loads(result.stdout);assert [q['numero'] for q in data['questoes']]==[91,92];assert all(q['layout']==2 for q in data['questoes']);assert [q['gabaritoPdf'] for q in data['questoes']]==['A','B'];assert all(list(q['alternativas'])==list('ABCDE') for q in data['questoes'])
 print('PDF sintético de duas colunas: ordem, numeração 91–92, alternativas e gabarito conferidos.')
