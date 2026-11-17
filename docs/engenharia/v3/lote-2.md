# Lote 2 — diagnóstico antes de alterar a aplicação

Data: 16/11/2026. Branch `codex/gabaru-plataforma-v3`. As alterações anteriores pertencem à instalação e governança do Lote 1. Nenhum arquivo de `src/`, `content/`, `APK/` ou `next.config.ts` foi alterado para este diagnóstico.

## Mapa e arquitetura

O inventário contém **72 templates de página, 20 rotas API e 7 rotas de metadados/XML**; 62 arquivos de componentes. A lista integral de URLs e arquivos está em `lote-2-rotas.md`; nomes exportados, classificação cliente/servidor e hashes dos arquivos inspecionados estão em `lote-2-inventario.json`.

- Estrutura global: `src/app/layout.tsx`, `site-header.tsx`, `site-footer.tsx`, `tab-bar.tsx`; o Header real não se chama Header.tsx.
- Banco/resolução: `catalog-search.tsx`, `question-workspace.tsx`, `study-session.tsx`, `math-text.tsx`, `resolution-graph.tsx` e leitores separados por instituição. MathText já produz KaTeX/MathML no HTML, com sanitização.
- Conteúdo: catálogo compilado `src/data/catalogo-v2.json`, acervos estruturados em `src/data/`, ENEM textual em 27 JSON de `content/enem/` (2.222 registros originais) e Markdown de questões. Cadernos só documentais não são questões completas.
- Segurança: sessão HttpOnly verificada no servidor, painel protegido, inputs Zod, rate limit e webhook transacional existentes. A rota de portal Stripe ainda precisa ser implementada no Lote 5; não há leitor de livros, Paywall compartilhado ou motor de vídeo de questão.
- Progresso: `study-progress.ts` e `/api/v1/study` já persistem progresso e erros por uid; o agendamento existente usa intervalos simples, sem FSRS-7. O painel legado consulta também o histórico SQL; será necessário integrar as métricas Firestore solicitadas.
- SEO: canonical sem www e redirect 301 já existem; sitemaps manuais modulares também. Faltam livros, vídeo e a integração via generateSitemaps pedida para v3.

## Raio-X exato — não são 16.299 itens em quarentena

| Estado inicial | Quantidade |
|---|---:|
| Total de registros | 16.299 |
| Tier 0, quarentena | 16.129 |
| Tier 1, gabarito oficial | 146 |
| Tier 2, comentada | 24 |
| Cadernos / bancas | 687 / 22 |

Os motivos abaixo são sobrepostos; somá-los não produz a quantidade de questões:

| Motivo atual do validador | Registros |
|---|---:|
| Sem conferência documental do gabarito | 14.613 |
| Enunciado ausente/insuficiente | 12.634 |
| Alternativas incompletas ou texto inválido | 13.403 |
| Gabarito ausente ou sem alternativa correspondente | 13.743 |
| Falta recurso visual referido no texto | 550 |
| Anulada, retida para revisão | 118 |
| Texto/fórmula requer revisão | 33 |
| Ruído severo de OCR | 12 |
| ENEM OCR sem conferência de layout | 4.478 |

`gabarito-ausente-ou-invalido` não significa que faltem 13.743 letras de resposta: o motivo também ocorre quando a letra existe, mas não há alternativas transcritas para associá-la.

Contagens solicitadas, com definições explícitas:

- **667** questões não anuladas sem letra de gabarito; incluindo anuladas, são 785. **Zero** têm somente gabarito pendente: também há problemas de enunciado, alternativas ou extração. **1.109** têm como único bloqueio a conferência documental de uma letra já cadastrada (617 ETEC, 264 COLUNI, 200 IFSC, 28 IFSP): prioridade para cruzamento offline com PDF oficial.
- Cabeçalhos repetidos detectados: **0** no catálogo e **0** nos JSON originais do ENEM. A passagem anterior já limpou essas repetições; a nova execução não pode contá-las como resgates novos.
- Bilíngues concatenados detectados pelo critério de duas sequências de alternativas: **0**. Há **10 variantes en/es já independentes**, dos cinco pares anteriormente saneados. A identidade e a resposta espanhola não podem herdar as da versão inglesa.
- Caracteres corrompidos pelo critério de U+FFFD/mojibake: **7** itens do catálogo e **1** registro nos originais ENEM. O critério mais amplo do validador, que inclui símbolos de ruído, retém 12 itens.
- **13.388** têm quantidade insuficiente de alternativas; **6.609** dessas possuem fonte visual local identificada (recorte ou páginas do caderno). Nos demais casos, não há recorte/página local identificado por essa verificação; continuam existindo referências documentais no catálogo. Não se inventa transcrição a partir de gabarito.

## Deploy Vercel e leitor móvel

Os traces NFT locais da build do Lote 1 foram medidos sem compactação. O maior é `provas/etec/2026-2/page.js.nft.json`: **249.337.639 bytes**, apenas 662.361 bytes abaixo do limite conservador de 250.000.000. Não é uma confirmação de tamanho do deploy remoto, e a margem é insuficiente para acrescentar livros/Firestore com segurança.

Desse trace, 151.298.836 bytes vêm de `public/` e cerca de 67,6 MB de duas variantes nativas opcionais de `@napi-rs/canvas`. Os WebP são recursos estáticos, não precisam residir na função. Porém `paginated-reader-exam.ts` consulta `existsSync` no runtime: simplesmente excluí-los quebraria a decisão do leitor. A correção precisa gerar um manifesto de páginas no build, retirar essa consulta ao filesystem da função e então excluir rasterizações estáticas do tracing. O Canvas opcional do jsdom também pode ser excluído do runtime de sanitização somente com teste de comportamento sem ele. Os PDFs necessários não serão excluídos indiscriminadamente.

`APK/src/lib/api.ts` **não existe**. A implementação real está em `APK/src/services/api.ts`; sua regex já aceita subpastas alfanuméricas seguras em `/questoes/`, impõe extensão e tamanho máximo e rejeita traversal, querystrings e caracteres codificados. Os testes de segurança existentes cobrem essa proteção; não é necessária uma correção fictícia no caminho inexistente.

## Restrições preservadas

FUVEST 2001 V/T continua bloqueada conforme PENDENCIAS.md e `bloqueios-catalogo.json`. O extrator Python legado usa PyMuPDF (AGPL); esta ordem usará a biblioteca Node Apache-2.0 e fontes locais com hashes, sem incorporar o extrator AGPL à build.

A paleta encontrada é papel/bege e carimbo laranja, diferente dos tokens verdes explicitamente aprovados nesta ordem. O ajuste aos tokens `paper #f8f8f2`, `ink #123d35`, `accent #d7ee79`, `surface #eaf1df` será realizado no Lote 6, preservando marca e assets.

Critério de saída cumprido: inventário, mapa integral e diagnóstico entregues. A edição da aplicação começa somente no lote seguinte.
