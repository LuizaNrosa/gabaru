# Lote D — homologação, release e entrega

Branch: `codex/gabaru-plataforma-v3`. Execução direta, sem delegação, push ou deploy.

## Placar confirmado por HTTP

| Métrica | Baseline 0c258a83 | Final |
| --- | ---: | ---: |
| Questões Tier 2 | 24 | 170 |
| Questões Tier 1 | 310 | 3.038 |
| Questões Tier 0 | 15.965 | 13.091 |
| Total de questões | 16.299 | 16.299 |
| URLs de provas | 1 | 28 |
| URLs de questões | 334 | 3.208 |
| URLs distintas nos sitemaps | 383 | 3.368 |

Sitemaps: **25 Hubs, 28 Provas, 107 Disciplinas/Assuntos, 3.208 Questões**. O XML de questões foi dividido em 2.000 + 1.208 URLs. Todas as URLs individuais foram comparadas com o tier atual; nenhum Tier 0 aparece nos XMLs. O JSON reproduzível está em `placar-final.json`.

Foram resgatados 2.874 itens do Tier 0. As 146 promoções adicionais ao Tier 2 correspondem a **41 resoluções autorais novas**: seis itens ENEM/ETEC e 35 questões FUVEST nas quatro versões equivalentes. As versões são registros separados do acervo; não se afirmam 146 explicações inéditas. Veja `lote-c.md`.

Há 39 questões anuladas promovidas com comprovação documental. Qualquer alternativa marcada recebe crédito, sem gerar erro nem agendamento FSRS. O formato oficial de quatro alternativas da UNICAMP foi preservado, assim como o da COLUNI: não foi inventada uma alternativa E.

Os motivos finais de retenção estão em `retencoes-finais.json` (motivos não exclusivos). 11.357 dos 13.091 itens retidos ainda não têm enunciado suficiente e 12.037 têm alternativas incompletas; portanto, não são todos casos de rigidez de alt ou OCR leve. FUVEST 2001/2018 permanecem suspensas. A auditoria por ID mantém fontes, hashes, métodos, recusas e histórico de tentativas em `../auditoria-gabaritos.json`.

## Mercado Pago

`scripts/homologar-mercadopago-sandbox.mjs` valida os contratos Pix `/v1/payments` e recorrência `/preapproval`; os testes Vitest interceptam os payloads efetivamente produzidos pelo adapter. O modo `--fixture` executa checkout, confirmação na API emulada, assinatura HMAC e leitura independente do Firestore local:

- assinatura válida: **HTTP 200**, plano premium gravado no Firestore e expiração futura;
- assinatura adulterada: **HTTP 401**;
- E2E: Pix pendente → pago → replay sem duplicação; cartão → cobrança confirmada → cancelamento preservando período pago;
- o modo externo aceita somente credencial `TEST-...`; se necessário, tenta criar um pagador de teste. Respostas externas rejeitadas produzem falha, sem expor tokens ou dados do pagador.

**Sandbox externo não executado:** não existe `.env.local` nem token de teste neste ambiente. Os resultados locais não são apresentados como homologação na infraestrutura do Mercado Pago. `mercadopago-sandbox.json` registra essa distinção. Com credencial de teste configurada, execute `node --use-env-proxy scripts/homologar-mercadopago-sandbox.mjs`. O produto usa `MERCADO_PAGO_ACCESS_TOKEN`; o script também aceita o alias `MP_ACCESS_TOKEN`. As variáveis opcionais estão documentadas em `.env.example`.

## Verificações reais

Logs completos preservados em `evidencias/`:

| Verificador | Resultado |
| --- | --- |
| `npx tsc --noEmit` | exit 0, zero erros |
| `npx eslint src --plugin security` | exit 0; **0 erros, 108 warnings** |
| `npm run build` sem configuração demo | exit 0; 736 páginas geradas |
| `npx htmlhint '.next/server/app/**/*.html'` | **698 HTMLs, zero erros** |
| `npm test` | **257 passed, 0 failed, 0 skipped** |
| `npx vitest run` | **16 passed**, incluindo payloads reais do adapter |
| `npx playwright test --trace=off` | **44 passed** em desktop/mobile |
| axe-core autenticado | **30 auditorias**, zero violações críticas/sérias, zero overflow, zero erros HTML |
| regras Firestore no emulador | 1 teste de integração passou; tentativas proibidas retornaram PERMISSION_DENIED |
| auditoria NFT/Vercel | maior função: **47.163.689 bytes**; nenhuma acima de 250 MB; nenhum arquivo ausente |
| HTTP do release sem JS | canonical, cinco alternativas e KaTeX presentes; questão fora do lote SSG entregue em HTML por SSR |
| repetição do cruzamento ENEM | **0 novas promoções**, checkpoints preservados; commit do dataset registrado |

A configuração pública de autenticação demo foi usada apenas no build de homologação. O build final foi refeito após remover `.env.production.local`. Nenhum token, cookie ou credencial de fixture foi versionado.

A verificação suplementar do APK não foi concluída: as dependências Expo/React Native não estão instaladas neste workspace (`APK/tsconfig.json:2`, `expo/tsconfig.base` ausente). Não houve alteração no APK nesta rodada. Esse resultado não é contabilizado como TypeScript aprovado do aplicativo móvel.

## Correções encontradas na validação

1. O teste de sitemap presumiu um XML único; a questão FUVEST está na segunda parte. O spec agora percorre o índice, e seus seis casos dirigidos passaram antes da suíte completa.
2. A legenda com URL e hash longos gerava overflow mobile. `overflow-wrap:anywhere` foi aplicado à legenda, sem ocultar o conteúdo. As 30 auditorias foram repetidas e passaram.
3. O teste do catálogo fixava o total antigo de 24 resoluções e a política antiga de anulações. Foi atualizado para conferir integridade e a nova política, mantendo as verificações de conteúdo e gabarito.
4. A limpeza removeu um cache de PDFs exigido por testes de proveniência. Foram reconstruídas 82 fontes ETEC das partes versionadas, conferindo seus SHA-256; os testes passaram sem depender da rede e sem criar PDFs públicos.

## Operação e espaço

A pré-geração foi limitada a 200 questões, priorizando Tier 2. As demais páginas públicas continuam disponíveis via SSR; o teste HTTP comprova conteúdo completo sem JavaScript fora desse lote. O catálogo público não depende de carregamento exclusivamente client-side.

Foi observado pico de 87% durante o primeiro build, corrigido removendo caches reconstruíveis e o ambiente Python temporário que não é usado pelo pipeline Node. O fechamento fica abaixo de 82%; o snapshot de disco está em `evidencias/disco-final.log`. A limpeza final preserva as fontes e as evidências textuais essenciais. `work/`, `test-results/` e `playwright-report/` permanecem ignorados pelo Git.

Para retomar ingestão: `node --use-env-proxy scripts/promover-acervo-massivo.mjs --bancas=enem` ou `--bancas=etec,coluni,ifsc,ifsp` / `--bancas=fuvest,unesp,unicamp`. O dataset ENEM é obtido automaticamente em diretório temporário para comparação factual, sem importar software GPL no build. Fontes cuja leitura ambígua já foi recusada não são repetidas sem nova evidência. Para resoluções: `node scripts/enriquecer-resolucoes-tier2.mjs --lote=100`; execução repetida aceita zero itens já registrados.
