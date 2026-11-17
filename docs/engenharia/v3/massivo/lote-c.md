# Lote C — resoluções autorais determinísticas

Tier 2: 24 → 170. Foram aplicados 41 modelos específicos: seis itens prioritários ENEM 2025/ETEC 2025 e 35 questões FUVEST 2025 nas quatro versões equivalentes, resultando em 146 registros novos de resolução. São 41 conteúdos novos, não 146 explicações distintas. O catálogo conta versões de caderno separadamente desde o baseline.

Cada modelo contém conceito, passos fundamentados e explicação individual de todos os distratores. O script compara o enunciado e todas as alternativas, remapeia por conteúdo e exige que a resposta explicada coincida com o gabarito documental. Não cria explicação a partir da letra. O snapshot sourceRaw preserva o texto de referência; a aplicação guarda fingerprint, SHA do modelo e gabarito.

Execução em dois lotes: 100 e 46 aprovados; repetição idempotente: 0 novos e 146 retomados. Checkpoint: resolucoes-checkpoint.json.

45 segmentos matemáticos de 146 projeções novas foram validados em KaTeX estrito, com round-trip para a fonte autoral. Texto e moeda não passam pelo parser matemático. O renderer compartilhado usa a projeção explícita para estas resoluções. Migração do legado: PARCIAL; os 24 registros anteriores e os enunciados antigos continuam no adaptador legado.

Validação: TypeScript exit 0; seis testes dirigidos, zero falhas. Logs: work/massivo/tsc-c-final.log, testes-c.log e resolucoes-idempotencia.log. A primeira execução detectou ReferenceError em scripts/enriquecer-resolucoes-tier2.mjs:12 (propriedade distratores sem variável homônima); após duas tentativas, corrigida para distratores:distractors antes de nova execução.
