# Notas de acessibilidade e SEO — para a frente de redesign

Registo da auditoria WCAG 2.2 AA / SEO técnico (frente a11y+SEO).
As correções de código estão aplicadas; este documento guarda as
medições e as decisões que tocam os tokens do redesign.

## Contraste — paleta ATUAL (globals.css)

| Par | Razão | Veredito AA |
| --- | --- | --- |
| tinta `#123d35` / papel `#f8f8f2` | 11,29 | ✓ AAA |
| n5 `#42574b` / papel | 7,31 | ✓ AAA |
| n4 `#52645a` / papel | 5,92 | ✓ |
| n4 `#52645a` / fundo do rodapé `#eaf0e3` | 5,43 | ✓ |
| nota de rodapé `#637366` / papel (11 px) | 4,72 | ✓ (margem curta) |
| etiqueta `#527046` / papel | 5,23 | ✓ |
| mono `#667464` / papel | 4,64 | ✓ |
| tinta / ouro `#d7ee79` (botões, skip link) | 9,40 | ✓ AAA |
| papel / tinta (secções escuras) | 11,29 | ✓ AAA |
| `#d6e0d5` / tinta (texto da secção prática) | 8,87 | ✓ AAA |
| anil `#3b3fb6` / papel (contorno de foco) | 7,66 | ✓ |
| n3 `#7a8b77` / papel | 3,40 | só não-texto (bordas) ✓ |
| **ouro `#d7ee79` / trilho `#e6eddf` (barra de progresso)** | **1,07** | ✗ **falhava** |

Correção aplicada: o preenchimento da barra de progresso do treino
passou a tinta (`bg-ink`, ≈10:1 sobre o trilho). O ouro continua a ser
usado onde tem texto tinta por cima (9,40:1).

## Contraste — paleta DECIDIDA do redesign (a verificar ao migrar)

Tokens decididos: papel `#f7f3ea`, grafite `#232323`, acento `#c8501e`.

| Par | Razão | Veredito AA |
| --- | --- | --- |
| grafite / papel | 14,19 | ✓ AAA |
| **acento `#c8501e` / papel** | **4,10** | ✗ texto normal · ✓ texto grande e componentes (≥3:1) |
| papel / acento `#c8501e` | 4,10 | ✗ texto normal |
| branco / acento `#c8501e` | 4,54 | ✓ (sem margem) |
| **acento-texto `#b0430f` / papel** | **5,19** | ✓ |

**Proposta (documentada, não aplicada — os tokens são da frente de
redesign):** manter `#c8501e` para o carimbo, gráficos, texto grande e
elementos de interface; introduzir a variante **acento-texto
`#b0430f`** (5,19:1) sempre que o acento for texto em tamanho normal
ou fundo de texto — links, etiquetas, botões com texto papel/branco.
É o mesmo matiz, um passo mais escuro; visualmente indistinguível em
uso, e passa AA com margem.

## SEO — estado e decisões

- Metadata centralizada em `src/lib/seo.ts` (`metaPagina`/`metaHome`):
  título, descrição, canonical, Open Graph e Twitter em todas as rotas
  públicas; login/cadastro/painel com `noindex` permanente.
- JSON-LD apenas onde há conteúdo real correspondente: Organization e
  WebSite (layout), FAQPage (FAQ visível da home), ItemList (índices
  ETEC/COLUNI/ENEM), BreadcrumbList (páginas de edição).
- Sitemap: adicionado `/provas/enem` (faltava). Sem `lastModified` —
  as fontes de dados não têm datas de edição fiáveis por página.
- Robots: coerente com `NEXT_PUBLIC_INDEXAR`; com a flag ligada,
  anuncia o sitemap e bloqueia `/api/` e `/painel`. **A indexação não
  foi ativada** — decisão de lançamento da fundadora.
- Imagem social: `public/og/gabaru.png` (1200×630, gerada da capa
  social ETEC). Pendente futuro: variantes por secção (ENEM/COLUNI).

## Pendentes registados

- Migrar os tokens para a paleta decidida aplicando a regra do
  acento/acento-texto acima (frente de redesign).
- Menu móvel: ao fechar com Escape, devolver o foco ao botão do menu.
- ItemList nas páginas de arquivo UNESP/Unicamp (hoje só ETEC,
  COLUNI e ENEM).
- Teste com leitor de ecrã real (NVDA/VoiceOver) antes do lançamento;
  esta auditoria foi por código e HTML pré-renderizado.
