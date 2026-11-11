# Redesign — Fase 1 (sistema visual, home, ferramenta de corte)

Executada em 2026-11-03 sobre a cópia local, a partir das decisões do
relatório `~/workspace/research_notes/gabaru-redesign-metricas-marca-20261103-0714/report.md`
(marca §3.3 Direção A; arquitetura §2.5; métricas §1.2). Sem push.

## 1. Sistema visual "papel de prova + carimbo"

Tokens em `src/app/globals.css` (`@theme`) — nomes mantidos por
compatibilidade, valores novos:

| Token | Valor | Papel |
| --- | --- | --- |
| paper | `#f7f3ea` | papel off-white da prova |
| ink | `#232323` | tinta grafite |
| gold | `#c8501e` | carimbo: selo, gráficos, texto grande, componentes |
| gold-text | `#b0430f` | acento para texto normal, links, etiquetas e fundos com texto |
| gold-soft | `#f6e0d0` | tinta do carimbo diluída (badges, realces) |
| anil | `#9c2b12` | tijolo escuro (erro/revisão, foco) |
| n1–n5 | cinzas quentes de papel | bordas e texto secundário |

- **Divisão de acessibilidade aplicada** (medições em
  `docs/A11Y-SEO-NOTAS.md`): `#c8501e` sobre o papel = 4,10:1, falha AA
  para texto normal; `gold-text #b0430f` = 5,19:1. Regra: carimbo,
  gráficos, texto grande e elementos não-textuais em `#c8501e`; texto
  normal/links/fundos com texto em `#b0430f`. Grafite/papel = 14,19:1.
- O **verde-lima foi abandonado** em todo o `src` (0 ocorrências dos hex
  antigos: `#d7ee79`, `#123d35`, `#eaf1cd`, `#3b3fb6`, `#f0bd55`,
  `#e6f5af`) — tokens, CSS `gb-*`, leitores ETEC/COLUNI (seleção passa a
  tinta; acerto ganha anel carimbo), treino, formulários, erro/404,
  skip link e `icon.svg`.
- Elementos gráficos novos no CSS: `.gb-stamp` / `.gb-stamp-sm` /
  `.gb-stamp-ink` (carimbo de verificação, com anel duplo) e a arte de
  folha de prova do hero (`.gb-sheet-*`, `.gb-bubble*` — grelha de
  folha de respostas). A arte antiga (degraus/órbita) foi removida.

## 2. Nova home vestibulinho-first (`src/app/page.tsx`)

- Hero: ferramenta gratuita em destaque (CTA primário para
  `/nota-de-corte`), arte = caderno de prova + folha de respostas +
  carimbo "Questão oficial verificada".
- Números **reais**, conferidos nos dados: 41 provas ETEC · 1.990
  questões com gabarito oficial · 714 com enunciado e alternativas em
  texto · ENEM 2.127 questões / 1.560 gabaritos casados. Os números-meta
  antigos (20 mil etc., de `src/data/banco.ts`) não são usados.
- Secção da ferramenta com o exemplo real (Guarulhos DS manhã 2026/1:
  demanda 25,2 c/v, corte 45,00, 898 classificados).
- Secção B2B "Para cursinhos comunitários" a anunciar o Painel do
  Cursinho (turma × assunto × meta do curso-alvo), gratuito, com prévia
  rotulada como ilustração com valores de exemplo.
- ENEM sai da vitrine: continua como cartão de acervo/treino, sem
  protagonismo. FAQ reescrito com o estado real (correção ETEC no ar,
  gabaritos ENEM casados, vendas bloqueadas).
- Preservados: `metadata = metaHome()` e o JSON-LD de FAQ da frente de
  SEO (o FAQ do LD é o mesmo array visível).

## 3. Ferramenta "Minha nota dá para passar?" (`/nota-de-corte`)

- Página `src/app/nota-de-corte/page.tsx` (metadata via `metaPagina`,
  JSON-LD FAQPage, tabela completa das combinações para SEO) +
  componente `src/components/nota-corte-tool.tsx`.
- Dados: `src/data/etec-demanda-cortes.json`, gerado por
  `scripts/prepare-demanda-cortes.mjs` (manual, fora do prebuild) a
  partir de `~/workspace/gabaru-dados-etec/` (demanda.json + cortes.csv):
  **38 combinações** presenciais de fontes oficiais (EaD e a compilação
  secundária de 2019 ficam fora).
- Fórmula oficial: NF = acertos × (1 + 3% afrodescendente + 10% escola
  pública), 50 questões, com "faltam N acertos" calculado pelo fator do
  utilizador.
- **Honestidade:** corte só onde foi lido de lista oficial — hoje 1
  combinação (Guarulhos DS M-Tec manhã 2026/1 = **45,00**; maior nota
  51,70; 898 classificados; fonte = lista oficial arquivada). Nas
  restantes: demanda oficial + estado "nota de corte em coleta". A
  combinação do Bayeux (Contabilidade, noite) mostra a lista recuperada
  (maior nota 46,33; 25 classificados; última nota 13,56) sem derivar
  corte, porque o PDF não informa as vagas. Nenhuma estimativa é
  apresentada como corte.
- Rota adicionada ao sitemap; header ganha o link "Nota de corte" e o
  anúncio passa a apontar para a ferramenta; rodapé ganha os links da
  ferramenta e do acervo ETEC e a assinatura vestibulinho-first.

## 4. Preservação e validação

Nada do trabalho anterior foi revertido: fundação `src/server/` e rotas
`/api/v1/*`, textos ETEC (`statement`/`options`), gabaritos ENEM no
`banco.json`, capas em `public/capas/`, sitemap e a camada de SEO
(`src/lib/seo.ts`, JSON-LD) estão intactos — as edições em ficheiros
partilhados foram trocas pontuais de classes/valores.

- Testes: **35/35 verdes** (`node --test tests/*.mjs`; a suite cresceu
  de 29 para 35 com as outras frentes).
- `npx tsc --noEmit`: limpo.
- `npm run build`: **exit 0**, com `/nota-de-corte` pré-renderizada;
  HTML da home e da ferramenta conferido (números reais, estados
  "em coleta", carimbo).
- Nota: o build baseline, corrido antes destas alterações, falhou uma
  vez em `/concursos` ("metaPagina is not defined") por corrida com a
  frente de SEO, que editava páginas naquele momento; com os ficheiros
  assentes, o build final passou sem erros.

## 5. Para a fase 2

- Páginas programáticas unidade × curso × turno (SEO) sobre a mesma
  base de demanda/cortes (§2.5, template 4 do relatório).
- Selo de Questão Oficial Verificada renderizado nas páginas de questão
  (a forma visual — `.gb-stamp` — já existe; falta ligá-la à
  proveniência por questão no leitor).
- Índice de Prontidão na área do aluno (depende de mais cortes
  coletados e da persistência de tentativas já construída em
  `src/server/`).
- Painel do Cursinho (área do parceiro) — a home anuncia; a área ainda
  não existe.
- Coleta de cortes: continuar a recuperação das listas (2025/1 e
  restantes unidades de 2026/1) e arquivar a próxima edição enquanto
  estiver publicada.
- `src/data/banco.ts` ainda contém os números-meta antigos; a home já
  não os usa, mas outras superfícies devem ser auditadas antes de os
  citar.
