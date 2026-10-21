# Importação de provas oficiais

O catálogo publicado contém somente lotes revisados. A preparação não executa OCR nem decide respostas: valida dados e integridade dos PDFs já conferidos. Os cadernos originais preservam figuras, fórmulas e textos compartilhados.

## Fluxo em pares

1. Extrator: localiza a página oficial, baixa o caderno 1 e o gabarito oficial mais recente, registra SHA256, extrai páginas e mapeia o início de cada questão. Guarda a proposta discursiva sem criar correção automática.
2. Revisor diferente: confere todas as respostas, anulações, páginas e hashes nos originais. Gabarito escaneado exige leitura visual independente. Uma revisão não se resume ao resultado do script do extrator.
3. Integrador: copia os PDFs para `public/acervo/coluni/ANO/`, valida o lote e executa a importação. Cada pessoa/agente trabalha em um diretório próprio; somente o integrador altera o catálogo.
4. Publicador: executa testes e build, abre PR com relatório, confere os checks e faz merge. Confirma a edição e os PDFs no site após o deploy. Merge GitHub não comprova deploy.

## Comando de integração

`node scripts/merge-coluni-batch.mjs lote.json revisao.json` valida sem escrever. Acrescente `--write` para incorporar. Nunca faz push ou merge automaticamente. IDs ou hashes de cadernos repetidos bloqueiam o lote inteiro; versões 2–4 não contam como novas provas. A ferramenta valida todos os PDFs locais antes da troca atômica do catálogo.

O arquivo de revisão deve ter `status: "approved"`, nomes distintos em `extractor` e `reviewer` e um array `editions` com `id`, `examSha256`, `answerSha256`, `questionCount`, `answersChecked: true` e `pagesChecked: true`. O registro é evidência de quem fez a conferência, não uma assinatura criptográfica.

## Qualidade e escala

- Até quatro downloads simultâneos. Repetir apenas falhas transitórias; hash divergente e 404 exigem investigação.
- `node --test tests/*.test.mjs`, `node scripts/prepare-coluni.mjs`, `npm run typecheck`, `npm run build`.
- Não publicar questão sem página mapeada, alternativa oficial ou evidência de anulação.
- `answerKeyRevised` informa retificação expressa da fonte; não significa aprovação interna da extração.
- Arquivar PDFs verificados no GitHub para que o build não dependa da disponibilidade de sites externos.
- Expandir por instituição com adaptadores próprios. Detecção por ID/hash impede repetição de edição/caderno; para futura separação por disciplina será necessário comparar também o conteúdo de cada questão.
- Não declarar o acervo esgotado sem busca adicional: anteriores a 2013 ainda precisam de fontes oficiais confirmadas.
