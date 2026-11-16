# Lotes 0 e 1 — auditoria anterior à implementação

Base `25c301a1`, branch `codex/gabaru-arquitetura-v2`. Até esta auditoria somente dependências foram instaladas; nenhum código de aplicação foi modificado.

Lote 0: 69 skills existentes conferidas e listadas com SHA-256 em `lote-0-skills.json`. As oito leituras individuais exigidas foram realizadas: web-design-engineer, landing-page-design, interface-review, better-layout, better-typography, seo-programmatic, seo-schema e seo-geo. Bibliotecas de produção e auditoria solicitadas instaladas com sucesso. Chromium compatível instalado após detectar a ausência da revisão exigida pelo Playwright atualizado.

## Inventário

70 templates de página Web, 17 APIs e 8 layouts: caminhos completos em `lote-1-inventario.json`. Nenhum middleware/proxy ou arquivo Firestore rules na base. Backend mistura catálogo local, serviços PostgreSQL e Firebase Auth; pagamentos Stripe estão desativados. O APK usa `APK/src/services/api.ts`: o caminho `APK/src/lib/api.ts` citado na ordem não existe.

26 arquivos `content/enem/**/dados.json`, 2.128 Markdown em `content/questoes`, 2.154 arquivos textuais inspecionados. Indicadores por arquivo: 20 com cabeçalho ENEM repetido, 22 com cabeçalho de prova, 6 com padrões severos `?@`/`#=[`, 567 com `gabarito: pendente`, 2.127 com `<details>`. Cinco registros de língua estrangeira possuem dois marcadores do mesmo número; exigem separação sem inferir gabarito espanhol. No catálogo: 12.178 itens com menos de quatro alternativas e 676 sem resposta válida. Esses números não significam que todos estejam publicados.

## Achados prioritários

| Local | Achado e consequência |
|---|---|
| `src/app/api/stripe/checkout/route.ts` | Sempre 503: sem validação de plano e sem fluxo de sessão implementado. Preservar indisponibilidade até configuração segura. |
| `src/app/api/stripe/webhook/route.ts` | Assinatura já verificada; falta ledger idempotente e sincronização de assinatura. Não confirmar efeito inexistente. |
| `src/lib/firebase/admin.ts:35` | `verifyIdToken(token)` sem checagem de revogação. |
| `src/app/painel/page.tsx` | Proteção apenas cliente: resposta inicial 200 antes do redirecionamento. |
| Firestore | Rules ausentes no repositório; estado remoto não verificado. |
| `src/lib/seguranca.ts` | Limites apenas em duas APIs e por memória de instância; faltam cobertura global e persistência distribuída. |
| `APK/src/services/api.ts:39` | Regex só aceita um arquivo diretamente sob /questoes e não admite subpastas válidas. |
| Renderizadores ENEM | Textos em disclosures e linguagens concatenadas; OCR não deve virar conteúdo validado por simples remoção de tags. |
| CSP | Headers existentes, mas script-src permite unsafe-inline para hidratação SSG; ausência de nonce/hash deve ser tratada explicitamente. |

HTMLHint CLI inicial: cinco HTMLs reais, zero erros. Auditoria axe inicial registra resultados por rota em evidências, sem extrapolar para todos os templates. ESLint inicial: um erro de navegação `<a>` interno em `study-session.tsx` e 12 avisos; registrar plugin pela CLI não ativa por si só todas as regras de segurança. Lote 3 habilitará as regras recomendadas.

## Direção da interface

Evolução preservando a marca existente, cores creme/carvão/laranja, fontes e tokens do projeto. Foco em leitura de prova, contraste, controles de estudo e tabelas honestas do acervo. Densidade média, movimento mínimo em ações repetidas, nenhuma estatística inventada. Logo e screenshots atuais são os ativos de referência. A execução integral já foi autorizada pelo usuário; não abrir nova aprovação de layout.

## Ordem restante

Lote 2: saneamento e semântica; 3: segurança; 4: workspace e revisão; 5: hubs e incidência; 6: canônico/SEO/GEO; 7: E2E; 8: validação integral e placar. O anexo concatena alguns títulos: esta divisão preserva todos os requisitos em nove lotes sequenciais.
