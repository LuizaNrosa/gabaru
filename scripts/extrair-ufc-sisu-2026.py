#!/usr/bin/env python3
"""Extrai o recorte 2026 da planilha oficial UFC: python3 script.py fonte.ods saida.json."""
import hashlib, json, sys, zipfile, xml.etree.ElementTree as ET

SRC = 'https://dados.ufc.br/dataset/b0bf9f25-7650-4e61-9041-c6f52197687b/resource/5a7e1a02-ae66-4d09-a1a8-a649ad2d1e91/download/nota-de-corte-21out2026.ods'
NS = {'t':'urn:oasis:names:tc:opendocument:xmlns:table:1.0', 'x':'urn:oasis:names:tc:opendocument:xmlns:text:1.0'}
T = '{%s}' % NS['t']

def cells(row):
    result=[]
    for cell in row.findall('t:table-cell', NS):
        val=' '.join(''.join(p.itertext()) for p in cell.findall('x:p', NS)).strip()
        count=int(cell.get(T+'number-columns-repeated','1'))
        result.extend([val]*min(count, 40))
    return result

def main():
    path,out=sys.argv[1:]
    with open(path,'rb') as f: digest=hashlib.sha256(f.read()).hexdigest()
    assert digest=='5c221583427f537cb1d626607f1abd5fef53b1fd7a0f8d229cb87a224d93d1c8', 'Arquivo fonte diferente: revise antes de atualizar'
    with zipfile.ZipFile(path) as z: root=ET.fromstring(z.read('content.xml'))
    table=root.findall('.//t:table',NS)[0]
    rows=[cells(r) for r in table.findall('t:table-row',NS)]
    assert rows[0][:8]==['CURSO','CO_IES_CURSO','SIGLA_UA','NOME_UA','FORMAÇÃO','TURNO','Modalidade','NotaCorte2026']
    records=[]
    for r in rows[1:]:
        if len(r)<8 or not r[1].isdigit() or not r[7]: continue
        nota=float(r[7].replace(',','.'))
        assert 0 <= nota <= 1000
        records.append(dict(curso=r[0],codigo=r[1],sigla_unidade=r[2],unidade=r[3],formacao=r[4],turno=r[5],modalidade=r[6],nota=nota))
    assert len(records)==834
    keys=[(r['codigo'],r['turno'],r['modalidade']) for r in records]
    assert len(keys)==len(set(keys))
    payload={'instituicao':'Universidade Federal do Ceará (UFC)','ano':2026,'chamada':'regular','fonte':SRC,'sha256':digest,'registros':records}
    with open(out,'w',encoding='utf8') as f: json.dump(payload,f,ensure_ascii=False,indent=2); f.write('\n')
if __name__=='__main__':main()
