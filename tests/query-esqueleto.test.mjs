import test from 'node:test';import assert from 'node:assert/strict';
import {filtersFromParams,filterParams} from '../src/lib/catalogo/search.ts';
test('parsers nuqs descartam filtros inválidos e omitem defaults',()=>{
 const f=filtersFromParams(new URLSearchParams('banca=INVALID&ano=banana&pagina=-1&status=admin&erros=true&categoria=foo&disciplina=../admin'));
 assert.equal(filterParams(f).toString(),'');assert.equal(f.pagina,'1');
});
test('filtros válidos preservam tipos e paginação sem parâmetros desconhecidos',()=>{
 const f=filtersFromParams(new URLSearchParams('banca=etec&disciplina=matematica&pagina=2&comentadas=1&foo=bar'));
 assert.equal(f.banca,'etec');assert.equal(f.pagina,'2');assert.equal(f.comentadas,'1');assert.ok(!filterParams(f).has('foo'));
});
