# Frente 3 — validação, sitemaps e entrega

Execução na branch `codex/gabaru-plataforma-v3`, sem push ou deploy. As evidências reais estão em [evidencias](./evidencias/). O build de homologação usou exclusivamente Auth/Firestore demo e gateway HTTP local. Depois dos E2E, a configuração temporária foi removida e o build normal de release foi executado novamente, sem chaves públicas fictícias.

## Acervo e triagem

| Tier | Antes destas frentes | Final |
| --- | ---: | ---: |
| Tier 2 completa | 24 | 24 |
| Tier 1 gabarito oficial | 262 | 310 |
| Tier 0 quarentena | 16.013 | 15.965 |
| Total | 16.299 | 16.299 |

Foram aprovadas **48 das 993 candidatas**, sendo 24 ETEC e 24 IFSC, todas com cinco alternativas A–E. Restam 945 candidatas originais sem prova suficiente para promoção. Hashes, caderno/versão, página e decisão por ID estão em [conferencia-1109.json](./conferencia-1109.json). O script preserva os 1.109 IDs da seleção original, sem contar novamente as 116 promoções da v3 anterior.

A classificação congelada dos 16.013 IDs originais resultou em A = 93, B = 0, C = 15.920. Desses IDs, os 48 já resgatados pelo cruzamento documental saíram de Tier 0. Na população retida atual: **A = 93, B = 0, C = 15.872**. [Triagem por ID](./triagem-16013.json).

Os 93 registros A tiveram os marcadores normalizados e alternativas separadas de forma determinística. Permanecem sem indexação: essa correção não comprova contexto/layout nem gabarito. [IDs normalizados](./normalizacao-marcadores.json). Bucket B exige imagem mapeada, comando limpo e transcrição/descrição confiável; uma página WebP de caderno sem essas condições não foi usada para fabricar descrição ou promover questão. C inclui conteúdo ausente e documentação insuficiente, além de OCR corrompido e divergência de caderno. Essas lacunas não podem ser eliminadas por regra de classificação.

## Resultados dos verificadores

Todos os comandos finais abaixo terminaram com código 0.

| Comando | Resultado | Evidência |
| --- | --- | --- |
| `npx tsc --noEmit` | 0 erros | [tsc](./evidencias/tsc-final.log) |
| `npm run build` normal, após retirar configuração demo | compilação, tipagem e geração concluídas | [release](./evidencias/build-release.log) |
| `npx htmlhint '.next/server/app/**/*.html'` | **748 HTMLs, 0 erros** | [HTMLHint](./evidencias/htmlhint-release.log) |
| `npx vitest run` | **14 testes aprovados** | [Vitest](./evidencias/vitest-final.log) |
| `npm test` | **248 aprovados, 0 falhas/skips** | [unitários](./evidencias/unitarios-final.log) |
| `npm run test:firestore` | isolamento, ledger, regras e concorrência aprovados | [Firestore](./evidencias/firestore-final.log) |
| Playwright desktop/mobile, trace off | **38 aprovados, 0 falhas/skips** | [E2E](./evidencias/e2e-definitivo.log) |
| Auditoria HTMLHint + axe em navegador | **26 combinações, 0 erros HTML, 0 violações críticas/sérias, 0 overflow** | [axe](./evidencias/axe-final.log), [JSON](./evidencias/axe-resultados.json) |
| `npx eslint --plugin security src tests/vitest` | **0 erros, 106 avisos** | [ESLint](./evidencias/eslint-final.log) |
| Auditoria de funções Vercel | máximo **40.135.263 bytes**, 0 acima de 250 MB, 0 arquivos ausentes | [Vercel](./evidencias/vercel-release.log), [inventário](./evidencias/vercel-funcoes.json) |
| Política de licenças no prebuild | **883/883 aprovadas**, 0 bloqueadas | [licenças](./evidencias/licencas.json) |

Os 106 avisos ESLint não foram suprimidos. Aprovação dos comandos não é declaração de inexistência de vulnerabilidades. A exceção LGPL continua limitada aos artefatos Sharp/libvips herdados; Vitest e dependências novas passaram pela política permissiva.

O E2E realiza login pelo SDK Firebase contra emulador, gera e exibe QR/Copia e Cola, confirma pagamento por webhook assinado e API do gateway local, verifica replay sem prazo duplicado, cria assinatura no cartão e cancela renovação dentro do painel preservando o período pago. Confere também preço adulterado, UID injetado, bloqueio de novo checkout Stripe quando billing brasileiro está ativo e questão recém-promovida com alternativas, gabarito e presença no sitemap. Axe é executado também nos estados de Pix e cancelamento, além das auditorias de rotas.

Os testes Firestore executaram oito eventIds concorrentes para o mesmo pagamento e comprovaram um único crédito de 30 dias, depois estorno e bloqueio das coleções de billing ao cliente. Vitest cobre HMAC/timestamp, ID não assinado no corpo, vínculo do recurso, conta/moeda/valor, autorização sem pagamento, Pix e todos os cinco planos, calendário e pagamento recorrente com referência nula vinculada pela assinatura confirmada.

A primeira tentativa do E2E parou no login por CORS da fixture: faltava permitir `x-firebase-client` no preflight local. O erro foi diagnosticado no navegador e corrigido no serviço de teste, sem relaxar CORS ou autenticação do produto. O [log inicial](./evidencias/e2e-cors-inicial.log) foi preservado. A execução final de 38 testes é completa, sem composição de resultados parciais. O erro de lint por `Date.now()` no render foi corrigido usando o estado de acesso apurado no servidor.

## URLs efetivamente servidas nos XMLs

Todos os XMLs retornaram HTTP 200 no build normal de release. [Contagem extraída dos XMLs](./sitemaps.json).

| Sitemap | URLs |
| --- | ---: |
| `sitemap-hubs.xml` | 25 |
| `sitemap-provas.xml` | 1 |
| `sitemap-disciplinas.xml` | 23 |
| `sitemap-questoes.xml` | 334 |
| **Total distinto** | **383** |

São 48 URLs de questões a mais em relação à v3 anterior. Não se contaram aliases XML como páginas adicionais. Nenhum novo caderno ficou integralmente completo, portanto `sitemap-provas.xml` permanece com 1 URL. Tier 0, incluindo os 93 registros normalizados, continua `noindex, follow` e fora dos sitemaps.

## Cobrança e limites de homologação

Mercado Pago está implementado para Pix pré-pago e recorrência no cartão, com autogestão interna. Pagar.me tem contrato plugável, sem adapter de produção habilitado; sua seleção falha fechada até implementação. Preços e credenciais vêm do servidor, sem valores fictícios publicados no código de produção. Pix não cria renovação automática e não foi apresentado como Pix Automático.

Nenhuma cobrança ou consulta financeira real foi realizada. O E2E usa gateway e contas locais de teste; ativação em uma conta Mercado Pago real exige configurar `.env`, habilitar os meios na conta e homologar no sandbox oficial. Assinaturas Stripe legadas não foram migradas silenciosamente; novos checkouts Stripe ficam bloqueados quando o billing brasileiro é habilitado.

## Disco, Git e reprodução

O disco foi verificado no início e ao longo da execução. Cache npm regenerável, traces, screenshots, cache de instalação, emulador baixável, configuração demo e cache Turbopack foram removidos após a validação. Fontes de conteúdo/PDFs de comprovação foram preservadas. O uso caiu de **87% para 80%** na medição de limpeza; a medição após o commit está no terminal. `work/`, `test-results/` e `playwright-report/` continuam ignorados. Os logs versionados tiveram apenas espaços finais e retornos de progresso normalizados.

Para repetir E2E de cobrança: usar `scripts/testar-firestore.mjs` para obter o emulador com hash conferido; iniciar o Java local no projeto `demo-gabaru`; gerar build com as cinco variáveis públicas demo de Firebase (incluindo `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL=http://127.0.0.1:9099`); executar `scripts/servir-auditoria-v3.mjs`; fornecer `V3_FIXTURE_FILE=work/v3/fixture.json` ao Playwright e o Chromium instalado. A fixture limpa **somente o projeto demo do emulador local**, cria usuários isolados e nunca acessa dados de produção. Retirar as variáveis demo e gerar novo build normal antes de preparar release.

Commits de implementação: `754f7743` (conferência/resgate), `79dbf716` (billing), `d9d49bba` (normalização conservadora). O commit de auditoria consolida os logs, testes finais e esta documentação. Sem push.
