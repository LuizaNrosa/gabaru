import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const exams=JSON.parse(readFileSync(new URL('../src/data/etec-exams.json',import.meta.url),'utf8'));

/**
 * Textos (enunciado + alternativas) publicados a partir da extração dos PDFs
 * oficiais (scripts/import-etec-texts.mjs). A regra de publicação está
 * documentada nesse script: segmentação completa, 5 alternativas com texto
 * real (nenhuma vazia nem fundida), enunciado ≥ 40 caracteres, sem tabela
 * embutida no enunciado, sem dependência de figura e gabarito idêntico ao
 * oficial do acervo. As contagens esperadas por edição são o resultado
 * dessa regra sobre a saída da extração — se a extração avançar e o script
 * for corrido de novo, atualizar a tabela em conjunto.
 */
const expected={
 '2006-1':0,'2006-2':0,'2007-1':0,'2007-2':0,'2008-1':0,'2008-1-extra1':0,'2008-2':0,
 '2009-1':6,'2009-1-extra1':18,'2009-2':8,'2009-2-extra1':17,
 '2010-1':7,'2010-2':16,'2010-2-extra1':30,'2011-1':4,'2011-2':8,
 '2012-1':23,'2012-2':28,'2013-1':22,'2013-2':25,'2014-1':30,'2014-2':24,
 '2015-1':21,'2015-2':20,'2016-1':35,'2016-2':18,'2017-1':17,'2017-2':19,
 '2018-1':14,'2018-2':26,'2019-1':26,'2019-2':28,'2020-1':34,'2022-2':30,
 '2023-1':16,'2023-2':25,'2024-1':17,'2024-2':23,'2025-1':28,'2026-1':29,'2026-2':22
};
const LETTERS=['A','B','C','D','E'];
const withText=(e)=>e.questions.filter(q=>q.statement!==undefined);

test('contagens de questões com texto batem com a regra de publicação, por edição',()=>{
 assert.deepEqual(Object.keys(expected).sort(),exams.map(e=>e.id).sort());
 let total=0;
 for(const e of exams){assert.equal(withText(e).length,expected[e.id],`${e.id}: publicadas`);total+=withText(e).length;}
 assert.equal(total,714);
 assert.equal(Object.values(expected).reduce((a,b)=>a+b,0),714);
});

test('toda a questão publicada tem enunciado e 5 alternativas íntegras',()=>{
 for(const e of exams)for(const q of e.questions){
  assert.equal(q.statement===undefined,q.options===undefined,`${e.id}:${q.number} statement/options vêm sempre juntos`);
  if(!q.statement)continue;
  assert.ok(typeof q.statement==='string'&&q.statement.trim().length>=40,`${e.id}:${q.number} enunciado ≥ 40`);
  assert.deepEqual(Object.keys(q.options),LETTERS,`${e.id}:${q.number} chaves A–E`);
  for(const letter of LETTERS){
   const option=q.options[letter];
   assert.ok(typeof option==='string'&&option.trim().length>0,`${e.id}:${q.number}${letter} alternativa não vazia`);
   assert.ok(option.length<=600,`${e.id}:${q.number}${letter} alternativa não fundida (≤ 600)`);
  }
 }
});

test('casos conhecidos: fusão de alternativas e edições sem segmentação ficam de fora',()=>{
 const q1=exams.find(e=>e.id==='2025-1').questions[0];
 assert.equal(q1.statement,undefined,'2025-1 Q1: alternativas fundidas na extração, sem texto');
 assert.equal(withText(exams.find(e=>e.id==='2006-1')).length,0,'2006-1: extração vazia (codificação de fonte)');
 const q=exams.find(e=>e.id==='2016-1').questions[0];
 assert.equal(q.options.C,'amido e folhas.','2016-1 Q1 publicada com alternativas íntegras');
});
