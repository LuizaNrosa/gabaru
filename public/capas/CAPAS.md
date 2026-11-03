# Capas do acervo Gabaru — sistema "papel de prova + carimbo"

Capas-tipo dos cadernos e coleções do acervo, na identidade visual aprovada
(direção **papel de prova + carimbo**). Ficheiros SVG editáveis: todo o texto é
texto vetorial — nada de imagens geradas por IA — para os títulos saírem sempre
perfeitos e poderem ser alterados em qualquer editor de SVG (Figma, Illustrator,
Inkscape) ou num editor de texto.

## Ficheiros

| Ficheiro | Formato | Uso |
|---|---|---|
| `capa-etec.svg` | Retrato A4 (1240×1754) | Capa-tipo do caderno Vestibulinho ETEC (exemplo: edição 2026/1) |
| `capa-enem.svg` | Retrato A4 (1240×1754) | Capa-tipo do caderno ENEM (exemplo: ano 2025) |
| `capa-coluni.svg` | Retrato A4 (1240×1754) | Capa-tipo das provas COLUNI (exemplo: ano 2026) |
| `social-etec.svg` | Quadrado (1200×1200) | Miniatura social/partilha da coleção ETEC |
| `social-enem.svg` | Quadrado (1200×1200) | Miniatura social/partilha da coleção ENEM |
| `social-coluni.svg` | Quadrado (1200×1200) | Miniatura social/partilha da coleção COLUNI |

## Paleta (e só esta)

| Papel | Função | Hex |
|---|---|---|
| Papel off-white | Fundo, texto sobre grafite | `#f7f3ea` |
| Tinta grafite | Texto, molduras, bolhas marcadas, faixas | `#232323` |
| Laranja-carimbo | **Um único acento**: nome da banca em destaque, carimbo, uma bolha por folha, ponto do wordmark | `#c8501e` |

Proibido: azul, roxo e verde-lima (territórios de concorrentes), degradés e
mascotes. A estrutura vive de grafite sobre papel — a capa funciona a 1 cor
(preto sobre papel, ex.: fotocópia) sem perder nada essencial; o laranja é
realce, nunca suporte de informação.

## Anatomia (igual em todas as capas)

1. **Moldura** de traço grafite a 56px da borda (48px nas sociais) — a "folha".
2. **Cabeçalho**: símbolo G (o mesmo path de `src/components/logo.tsx`, em
   grafite) + wordmark `gabaru.` em minúsculas pesadas, com o ponto em
   laranja-carimbo; à direita, `ACERVO · PROVAS OFICIAIS`. Fecho com régua
   dupla (traço 4 + traço 1,5), como cabeçalho de prova impressa.
3. **Kicker** em caixa-alta espaçada (`CADERNO DE QUESTÕES`, `PROVAS OFICIAIS · UFV`…).
4. **Título** em grotesca pesada (900): a banca domina a página
   (`VESTIBULINHO` + `ETEC` em laranja; `ENEM`; `COLUNI`).
5. **Edição**: rótulo pequeno espaçado (`EDIÇÃO · 1º SEMESTRE`, `ANO · EDIÇÃO
   COMPLETA`) + valor grande (`2026/1`, `2025`, `2026`) — elementos com as
   classes `edicao-rotulo` e `edicao-valor`.
6. **Folha de respostas**: painel com faixa grafite `FOLHA DE RESPOSTAS`,
   colunas A–E e linhas de questões numeradas com bolhas; uma bolha marcada em
   grafite por linha e **uma só em laranja** por folha (a "resposta certa").
   É a reutilização visual do componente `EtecAnswerSheet`.
7. **Carimbo de verificação**: retângulo de dupla borda em laranja, rodado −9°,
   com o texto `QUESTÕES / OFICIAIS / VERIFICADAS` em três linhas — a forma visual do
   selo de questão oficial verificada (fonte + hash). Nunca endireitar o
   carimbo: a rotação é o que o faz parecer carimbado.
8. **Base**: linha factual (`50 QUESTÕES · GABARITO OFICIAL CONFERIDO`) +
   nota de honestidade (o documento oficial da banca prevalece) + faixa
   grafite `GABARU · A GENTE ESTUDA JUNTO`.

Tipografia: família `'Archivo', 'Archivo Black', 'Helvetica Neue', Arial,
sans-serif`, pesos 700–900. Se a Archivo não estiver instalada, o sistema cai
para uma grotesca pesada equivalente sem quebrar o desenho.

## Como gerar uma nova edição

1. Duplicar a capa-tipo da coleção (`capa-etec.svg`, `capa-enem.svg` ou
   `capa-coluni.svg`) com o nome do destino, ex.: `capa-etec-2026-2.svg`.
2. Trocar **apenas** dois textos:
   - o elemento com classe `edicao-valor` (ex.: `2026/1` → `2026/2`);
   - o elemento com classe `edicao-rotulo`, se o semestre/período mudar
     (ex.: `EDIÇÃO · 1º SEMESTRE` → `EDIÇÃO · 2º SEMESTRE`).
3. Se o número de questões da linha factual mudar (base da capa), atualizar
   também essa linha. Mais nada muda: título, carimbo, folha e moldura são o
   sistema — a repetição é o que cria reconhecimento de coleção.
4. Para a miniatura social da nova edição, fazer o mesmo no `social-*.svg`
   correspondente (só existe classe `edicao-valor`: `EDIÇÃO 2026/1`,
   `ANO 2025`, `ANO 2026`).

## Critérios verificados

- **Legível em miniatura**: título + edição + carimbo leem-se a 120px de
  largura; o resto é textura de sistema.
- **1 cor**: imprimir em P&B — moldura, título, folha e carimbo (em contorno)
  mantêm a estrutura completa.
- **Sem territórios alheios**: zero azul, roxo ou verde-lima em qualquer
  ficheiro desta pasta.
