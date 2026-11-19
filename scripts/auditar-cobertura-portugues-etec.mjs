import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const raiz = new URL('../', import.meta.url);
const ler = caminho => JSON.parse(readFileSync(new URL(caminho, raiz), 'utf8'));
const matriz = ler('specs/apostila-etec/matriz-incidencia-etec.json');
const edital = ler('specs/apostila-etec/edital-verticalizado-etec.json');
const capitulos = ler('src/data/apostila-etec-portugues.json');
const banco = new Map(ler('src/data/catalogo-v2.json').questoes.map(q => [q.id, q]));
const cadernos = ler('src/data/etec-exams.json');
const indice = new Map(
  edital.topicos.filter(t => t.componente_bncc === 'LP').map(t => [t.codigo, t]),
);
const casos = [
  ['etec-2026-1-q001', 'Informação literal e paráfrase', 'Relação expressa e limite da paráfrase'],
  ['etec-2023-1-q021', 'Textos técnicos e enunciados compostos', 'Leitura de uma consequência de saúde explicitada no suporte'],
  ['etec-2014-2-q029', 'Charge, tirinha, foto e anúncio', 'Leitura do símbolo de uma campanha eleitoral'],
  ['etec-2026-2-q031', 'Gênero, suporte e finalidade', 'Finalidade de um cartaz sustentada por dados e imperativos'],
  ['etec-2019-2-q002', 'Som, repetição e sequência', 'Reconhecimento de zeugma'],
  ['etec-2009-1-extra1-q009', 'Sentido em contexto e relações de palavras', 'Sinonímia contextual'],
  ['etec-2026-1-q021', 'Construção literária', 'Intenção do eu lírico inferida pelos versos'],
  ['etec-2026-1-q012', 'Coesão referencial', 'Retomada de referente em texto com vários atores'],
  ['etec-2026-2-q030', 'Coesão sequencial e relações lógicas', 'Restrição e contraste sinalizado por e'],
  ['etec-2026-2-q029', 'Tese, argumento, exemplo e evidência', 'Dados como justificativa de uma tese de campanha'],
  ['etec-2007-2-q001', 'Planejamento, edição e oralidade', 'Transposição da leitura de quadros para uma frase discursiva'],
  ['etec-2020-1-q032', 'Tempos, modos, vozes e pronomes de tratamento', 'Transposição para discurso indireto'],
  ['etec-2019-1-q038', 'Grafia, acentuação e reescrita', 'Formação de palavras e neologismo'],
  ['etec-2018-1-q045', 'Regência, crase e pronomes', 'Colocação pronominal'],
  ['etec-2008-2-q032', 'Grafia, acentuação e reescrita', 'Impessoalidade verbal e grafia de porque'],
  ['etec-2026-1-q024', 'Sintaxe, pontuação e sentido', 'Vocativo e interlocução'],
  ['etec-2022-2-q007', 'Variedades, registro e preconceito', 'Reconhecimento do registro coloquial em canção'],
];

const capituloPorCodigo = new Map();
const oficiais = new Set();
for (const [slug, capitulo] of Object.entries(capitulos)) {
  assert.ok(capitulo.raioX && capitulo.intuicao.length && capitulo.teoria.length && capitulo.armadilha
    && capitulo.resumo.length && capitulo.exemplos.length >= 2 && capitulo.oficiais.length >= 2, slug);
  for (const codigo of capitulo.codigos) {
    assert.ok(indice.has(codigo) && !capituloPorCodigo.has(codigo), codigo);
    capituloPorCodigo.set(codigo, slug);
  }
  for (const e of capitulo.exemplos) {
    assert.equal(e.alternativas.length, 5, e.comando);
    assert.match(e.correta, /^[A-E]$/);
    assert.ok(e.suporte.length && e.passos.length >= 3, e.comando);
  }
  for (const q of capitulo.oficiais) {
    assert.ok(!oficiais.has(q.id), q.id);
    oficiais.add(q.id);
    const origem = banco.get(q.id);
    assert.ok(origem && origem.banca === 'etec' && !origem.anulada
      && origem.tier !== 'tier-0-quarentena' && origem.proveniencia.gabaritoConferido, q.id);
    assert.equal(q.correta, origem.correta, q.id);
    assert.ok(capitulo.codigos.includes(matriz.itens_por_slug[q.id]?.topicos[0]), q.id);
    assert.ok(q.justificativa.trim(), q.id);
    const erradas = [...'ABCDE'].filter(letra => letra !== q.correta);
    assert.deepEqual(q.distratores.map(texto => texto[0]), erradas, q.id);
  }
}
assert.equal(capituloPorCodigo.size, indice.size);
assert.equal(cadernos.length, matriz.provas_inventariadas);
assert.equal(Object.keys(matriz.itens_por_slug).length, matriz.questoes_inventariadas);
const validadas = new Map();
for (const caderno of cadernos) {
  const revisao = matriz.edicoes.find(e => e.edicao === caderno.id);
  assert.equal(revisao?.revisao_portugues.questoes_conferidas, caderno.questions.length, caderno.id);
  for (const oficial of caderno.questions) {
    const id = `etec-${caderno.id}-q${String(oficial.number).padStart(3, '0')}`;
    const item = matriz.itens_por_slug[id];
    assert.ok(item?.pagina_pdf > 0 && item.edicao === caderno.id, id);
    const codigos = item.topicos.filter(c => capituloPorCodigo.has(c));
    if (item.revisao_portugues === 'portugues') {
      assert.equal(codigos.length, 1, id);
      if (!item.anulada) validadas.set(id, codigos[0]);
    } else {
      assert.equal(item.revisao_portugues, 'outra_operacao_principal', id);
      assert.equal(codigos.length, 0, id);
    }
  }
}
assert.equal(validadas.size, matriz.revisao_portugues.portugues_validas);

const linhas = [
  '# Auditoria de cobertura de Português · Apostila ETEC', '',
  `A matriz registra ${matriz.questoes_inventariadas.toLocaleString('pt-BR')} questões em ${cadernos.length} cadernos, incluindo os quatro adicionais. Foram classificadas ${matriz.revisao_portugues.portugues} questões de Português, das quais ${validadas.size} são válidas. Questões anuladas foram revisadas e ficaram fora dos numeradores.`, '',
  'A classificação usa a operação principal. Uma questão interdisciplinar entra em Português quando a solução depende principalmente da leitura ou da análise da linguagem. Conhecimento externo de outra disciplina, quando decisivo, determina a classificação nessa disciplina.', '',
  'A cobertura reversa, por habilidade principal, cruza cada questão válida com seu código no edital verticalizado e com o capítulo que ensina essa habilidade. A revisão qualitativa abaixo confronta conceitos e técnicas específicos com o enunciado e as alternativas. A bateria publicada tem seleção própria do banco, com gabaritos e comentários autorais.', '',
  '| Tópico | Cadernos | Incidência | Itens com capítulo | Capítulo |',
  '| --- | ---: | ---: | ---: | --- |',
];
for (const topico of matriz.topicos.filter(t => indice.has(t.codigo_topico))) {
  const slugs = [...validadas].filter(([, c]) => c === topico.codigo_topico).map(([id]) => id).sort();
  const edicoes = new Set(slugs.map(id => matriz.itens_por_slug[id].edicao));
  assert.deepEqual(topico.ids_questoes_oficiais, slugs, topico.codigo_topico);
  assert.equal(topico.aparicoes_absolutas, slugs.length, topico.codigo_topico);
  assert.equal(topico.provas_com_aparicao_confirmada, edicoes.size, topico.codigo_topico);
  assert.equal(topico.percentual_de_provas, Number((edicoes.size / cadernos.length * 100).toFixed(2)), topico.codigo_topico);
  const slug = capituloPorCodigo.get(topico.codigo_topico);
  linhas.push(`| ${topico.codigo_topico} · ${topico.topico} | ${edicoes.size}/${cadernos.length} | ${topico.percentual_de_provas.toLocaleString('pt-BR')}% | ${slugs.length} | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/${slug}) |`);
}
linhas.push('', `Resultado da checagem por habilidade principal: **${validadas.size}/${validadas.size} (100%)**. A lista integral de identificadores, páginas e cadernos está na [matriz](matriz-incidencia-etec.json).`, '',
  '## Casos de verificação qualitativa', '', '| Questão oficial | Técnica ou conceito conferido | Seção da teoria |', '| --- | --- | --- |');
for (const [id, secao, tecnica] of casos) {
  const slug = capituloPorCodigo.get(validadas.get(id));
  assert.ok(capitulos[slug]?.teoria.some(t => t.titulo === secao), id);
  linhas.push(`| \`${id}\` | ${tecnica} | ${secao} |`);
}
linhas.push('', 'A revisão acrescentou zeugma, distinção entre exposição e injunção, formação de palavras, colocação pronominal, impessoalidade verbal e transposição de discurso. Os itens `etec-2008-2-q032` e `etec-2009-1-extra1-q009` foram recodificados após a releitura do comando.', '',
  `Os ${oficiais.size} itens da bateria foram conferidos contra o banco, com justificativa da alternativa correta e comentário dos quatro distratores. A auditoria de vínculo integral não produz uma resolução inédita de cada item histórico.`, '',
  'Reprodução da checagem estruturada com `node scripts/auditar-cobertura-portugues-etec.mjs`.', '');
writeFileSync(new URL('specs/apostila-etec/auditoria-cobertura-portugues.md', raiz), linhas.join('\n'));
console.log(`${validadas.size}/${validadas.size} questões válidas vinculadas, ${oficiais.size} gabaritos da bateria verificados.`);
