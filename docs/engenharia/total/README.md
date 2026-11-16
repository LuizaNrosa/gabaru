# Gabaru — engenharia total, Lotes 0 a 8

Data: 16/11/2026. Branch `codex/gabaru-arquitetura-v2`. Base desta ordem: `25c301a1`. Trabalho e validações locais; sem push, deploy ou alteração de serviços de produção.

## Execução sequencial

| Lote | Entrega e saída |
|---|---|
| 0 | 69 skills existentes conferidas; inventário com hashes em `lote-0-skills.json`. Leituras individuais: web-design-engineer, landing-page-design, interface-review, better-layout, better-typography, seo-programmatic, seo-schema e seo-geo. Bibliotecas solicitadas instaladas; Chromium compatível preparado. |
| 1 | Reconhecimento antes de alterar aplicação: 70 templates de página, 17 APIs, 8 layouts, 26 JSON ENEM e 2.128 Markdown. Relatório e inventário completos nos arquivos `lote-1-*`. |
| 2 | Saneador determinístico, cabeçalhos removidos, cinco pares bilíngues separados, disclosures retirados do texto; HTMLHint sobre todos os HTMLs gerados. |
| 3 | Checkout validado, webhook assinado e idempotente, Firebase com revogação, sessão HttpOnly, painel protegido no servidor, Firestore rules, sanitização e limites de API. Testes reais no emulador Firestore. |
| 4 | Filtros por habilidade/status, feedback, riscador, simulado, boletim, revisão espaçada, armazenamento separado por conta e fila de sincronização autenticada. |
| 5 | Tabelas e barras de incidência, com denominador, cobertura e deduplicação explícitos; nenhum percentual inferido de itens em quarentena. |
| 6 | Canônico sem www, 301, sitemaps por qualidade, grafo com Luiza Nascimento Rosa, robots e inventário llms. Régua reforçada após detectar texto-base ausente em OCR que antes passava apenas por estrutura. |
| 7 | Suíte Playwright desktop/celular: navegação, filtros, resolução, simulado, HTML/MathML sem JS, axe, painel, cookie forjado, webhook, IDOR, headers e quota de exportação. |
| 8 | TypeScript Web/APK, lint Web/APK, build, HTMLHint integral, E2E, Firestore, auditorias npm, links, placar e evidências. Correções da validação aplicadas antes de repetir verificadores. |

## Placar exato

| Indicador | Antes desta ordem | Depois |
|---|---:|---:|
| Cadernos | 667 | 667 |
| Itens, incluindo versões | 15.268 | 15.273 |
| Nível 2 — resolução comentada | 24 | 24 |
| Nível 1 — gabarito oficial | 1.020 | 146 |
| Nível 0 — rascunho/quarentena | 14.224 | 15.103 |
| Cadernos elegíveis ao sitemap | 1 | 1 |
| Questões elegíveis ao sitemap | 24 | 170 |

O acréscimo de cinco itens corresponde aos cinco registros originalmente concatenados convertidos em dez versões independentes `-en`/`-es`. Não são cinco questões inventadas. Inglês e espanhol têm arquivos próprios e IDs distintos; espanhol não recebe resposta, habilidade ou tema de inglês. Os antigos slugs redirecionam para a versão inglesa correspondente.

A redução de Tier 1 é deliberada: presença de cinco alternativas e resposta cadastrada não prova que o texto-base foi transcrito. O exemplo ENEM 2025/D1/Q8 dizia “Nesse texto” sem trazer o texto. OCR ENEM sem conferência de layout ou revisão editorial registrada fica retido. A versão V da FUVEST 2001 tem bloqueio editorial explícito pela pendência V/T. Os motivos de todos os 15.273 itens e 667 cadernos estão em `auditoria-qualidade.json`.

A prova íntegra continua sendo **ETEC 2026/2**, com 50 itens. Há 666 cadernos retidos e nenhum caderno integralmente comentado. As 170 questões elegíveis são 146 N1 e 24 N2; estas últimas mantêm conceito, passos e análise dos distratores. A existência de texto ou gabarito bruto no repositório não equivale a publicação validada.

`placar.json` compara o diagnóstico textual: cabeçalhos repetidos **20 → 0**, cabeçalhos de prova **22 → 0**, Markdown com `<details>` **2.127 → 0**. Há agora 2.133 Markdown: 2.132 registros OCR auxiliares explicitamente retidos e um README. Os seis arquivos com ruído severo permanecem retidos. Gabaritos pendentes **567 → 572**, pelos cinco novos registros espanhóis sem resposta conferida; não foram preenchidos por inferência. A segunda execução do saneador não alterou arquivos.

Os Markdown preservam a camada bruta de OCR. A versão publicável é construída pelo catálogo normalizado com ingestão validada e sobreposições editoriais. Um Markdown auxiliar não vira N2 apenas porque existe outra versão editorial do mesmo número.

## Publicação e estudo

O índice de sitemaps contém **216 URLs**: 22 hubs, 1 prova, 23 páginas de disciplina/assunto e 170 questões. Não inclui “a classificar”, busca parametrizada ou itens N0. Partes têm limite de 2.000 URLs e suporte gzip; o teste de 4.501 URLs verifica 2.000/2.000/501. Não há lastmod fictício.

O canônico absoluto é `https://gabaru.com.br`. O host www e os cinco slugs bilíngues antigos retornam 301. JSON-LD usa EducationalOrganization, Person (Luiza Nascimento Rosa, curadoria), Quiz, Question, Answer, BreadcrumbList e FAQ visível quando aplicável. A quarentena não publica acceptedAnswer, nem entrega gabarito/comentário como resposta conferida na interface ou no estado do workspace enviado ao navegador. N1 não é descrito como integralmente comentado.

`llms-full.txt` inventaria as 21 bancas cadastradas e os 667 cadernos, com situação editorial explícita, além das disciplinas/assuntos e questões validadas. Não promete efeito de ranking ou citação por mecanismos de IA. Bancas sem questões validadas continuam visíveis nos filtros com resultado vazio; não recebem registros inventados.

A busca envia apenas os itens validados e prévias de até 400 caracteres, não o banco integral. Filtros combinam categoria, banca, ano, disciplina, assunto, habilidade e status. Os comentários, alternativas, equações KaTeX/MathML, imagens e tabela de pontos do gráfico estão no HTML inicial. O gráfico cliente é aprimoramento com alternativa textual/tabular.

Erros e progresso são separados por UID; visitantes usam o armazenamento do navegador. A fila local preserva tentativas sem conexão, evita descargas concorrentes e permite nova tentativa explícita. A API calcula a correção pelo catálogo do servidor e registra tentativas idempotentes. Um erro agenda revisão em um dia; acertos ampliam o intervalo até 30 dias. Simulados com itens em quarentena ficam indisponíveis no workspace. Não se calcula TRI ou classificação oficial.

## Segurança implementada e limites operacionais

- Checkout: Zod estrito, plano permitido, UUID de tentativa, preço exclusivamente de `STRIPE_PRICE_ID`, usuário verificado com `verifyIdToken(token, true)` e idempotency key por UID/tentativa. `STRIPE_CHECKOUT_ENABLED=0` é o padrão documentado; nenhuma cobrança real foi feita.
- Webhook: corpo bruto limitado, assinatura SDK obrigatória, ledger `processed_stripe_events`, vínculo de assinatura/UID e atualização transacional. O estado atual da assinatura é consultado no Stripe; cancelamento de assinatura antiga não revoga a nova. Falhas de processamento retornam erro e não marcam o evento como concluído.
- Sessão: cookie HttpOnly/Secure/SameSite=Lax, autenticação recente para criá-lo e verificação de revogação. Painel e área premium verificam o servidor; conta inativa/expirada não recebe acesso premium. O cliente não decide o plano.
- Firestore: progresso e erros por UID; planos, IDs Stripe e eventos são somente Admin. O emulador comprovou leitura/escrita indevida bloqueadas e oito entregas concorrentes com um único efeito.
- Texto: DOMPurify em texto/OCR e matemática; texto simples continua React-escapado, preservando desigualdades e código literal. HTML enriquecido tem allowlist estrita. JSON-LD escapa `<`. KaTeX usa `trust:false` e sua saída também é saneada.
- APIs: limite por minuto, corpo de 32 KiB (webhook 1 MiB), quota ponderada de 1.000 questões/dia, Retry-After, memória com capacidade limitada e opção transacional distribuída Firestore. `API_RATE_LIMIT_BACKEND=firestore` falha fechada se o serviço não estiver disponível.
- IP: na Vercel usa o cabeçalho da infraestrutura; fora dela o bucket anônimo é compartilhado, evitando confiar em cabeçalho arbitrário do cliente. Uma implantação em outra infraestrutura precisa configurar proteção de borda adequada à sua origem antes de escalar.
- Headers: CSP, HSTS, nosniff, DENY, referrer-policy e permissions-policy. PDFs incorporados já previstos conservam a exceção SAMEORIGIN e a CSP completa. A CSP mantém `unsafe-inline` para os scripts de hidratação SSG; nonce/hash por documento não foi introduzido. A sanitização e o escaping não dependem de essa permissão bloquear XSS.
- APK: caminhos de imagem por segmentos, tamanho limitado, extensão permitida, sem traversal ou encoding de fuga. Relógio e resets de seleção foram movidos do render para o início da sessão e eventos apropriados.

As regras estão prontas em `firestore.rules`/`firebase.json`, mas não foram publicadas no projeto remoto. Credenciais reais, configuração do endpoint Stripe e deploy precisam ser feitos no ambiente correto. Os testes de gateway usam assinatura criptográfica real do SDK com segredo de teste local; não simulam uma cobrança real nem comprovam configuração da conta de produção. Não houve teste de instalação/execução do APK em aparelho, apenas tipagem, lint e testes da fronteira de API.

Para o backend distribuído, configure a política TTL do campo `expiresAt` na coleção `api_rate_limits`; nenhum TTL remoto foi alterado nesta execução. Limitar APIs não impede a reprodução de conteúdo público nem substitui proteção de borda.

## Verificação e reprodução

Evidências reais estão em `evidencias/`. Resultado da validação final:

| Verificador | Resultado |
|---|---|
| `npx tsc --noEmit` Web e APK | 0 erros |
| ESLint com plugin security, Web e APK | 0 erros; avisos heurísticos documentados em `lint-triagem.json` |
| Build de produção | Sucesso, sem os avisos de métricas de fonte |
| HTMLHint integral | 562 HTMLs, 0 erros |
| Playwright | 26 E2E, desktop/celular, 0 falhas |
| axe-core | 0 violações críticas/sérias nas seis rotas auditadas, nas duas larguras |
| Testes Node de catálogo, segurança e estudo | 25 aprovados |
| Firestore emulador 1.22.0 | 1 teste de isolamento/concorrência aprovado |
| PDF sintético, duas colunas e numeração 91–92 | Aprovado |
| XML/robots/llms, gzip e 404 de parte inexistente | Aprovados |
| Links internos | Todas as 170 questões incluídas; contagens e falhas em `links-internos.json` |
| npm audit produção Web/APK | 0 vulnerabilidades conhecidas |

Os avisos remanescentes do lint são mantidos visíveis: acessos por índices/enums do catálogo, caminhos de arquivos previamente resolvidos e avisos de interface legados. Foram inspecionados; o plugin é heurístico e não atribui CVSS nem substitui pentest. Não se declara ausência absoluta de vulnerabilidades por uma execução de lint.

Os dois avisos npm de baixa severidade do APK, em deepmerge/@expo/config, foram corrigidos com atualização compatível, sem troca de SDK principal. As fontes Atkinson foram preservadas byte a byte em quatro WOFF2 locais, com subconjuntos, pesos, preloads e licenças OFL; hashes em `fontes-locais.json`. A compilação não precisa consultar Google Fonts.

```bash
npm ci
npm --prefix APK ci
PLAYWRIGHT_BROWSERS_PATH=work/browsers npx playwright install chromium --only-shell
npm run acervo:sanear
npm run catalogo:gerar
npm run validar:total
npm run test:firestore
npm run typecheck
npm run typecheck:apk
npx eslint --plugin security src APK
npm run build
npx htmlhint '.next/server/app/**/*.html'
PLAYWRIGHT_BROWSERS_PATH=work/browsers npm run test:e2e
npm run validar:crawl
npm run validar:links
```

`test:firestore` baixa e confere o SHA do emulador oficial, usa apenas localhost e o projeto `demo-gabaru`. Requer Java 21. Os PDFs não são baixados durante build; ingestão continua em comandos explícitos. O histórico da arquitetura anterior está preservado em `docs/engenharia/arquitetura-v2.md` e `fase2/`.
