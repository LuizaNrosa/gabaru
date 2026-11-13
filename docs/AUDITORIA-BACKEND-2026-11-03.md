# Auditoria e endurecimento do back-end — 2026-11-03

Âmbito auditado: `src/server/*` (db, migrate, repositório, correção,
tentativas, progresso), `src/app/api/**` (catalog, questions, etec, coluni,
vestibulares, v1/attempts, v1/progress, stripe/checkout, stripe/webhook) e
`src/lib/*` no que toca o servidor (questions, seguranca, firebase/admin,
stripe, official-pdf). Cada bug corrigido foi **reproduzido antes** da
correção (script temporário com PGlite + leitura de código) e tem teste na
suíte nova `tests/backend-hardening.test.mjs` (6 testes).

**Validação final: 35/35 testes** (29 anteriores + 6 novos) ·
**`tsc --noEmit` limpo** · **`npm run build` exit 0** · smoke ao vivo com
`next start` (build novo, porta própria): gabarito ausente das respostas
públicas, 401 sem token nas rotas autenticadas, 503 do checkout em
construção, 400 do webhook sem assinatura.

---

## Achados e correções (por severidade)

### ALTA — F1. `/api/v1/questions` devolvia o gabarito oficial do ENEM
`selectQuestions` (src/lib/questions.ts) devolvia os objetos crus do banco,
incluindo `gabarito` — 1.560 questões casadas expostas a qualquer visitante,
sem autenticação, antes de responder. Nenhum consumidor usa o campo: o
treino web e o app Android dizem explicitamente que a correção ainda não
está ligada (grep por `.gabarito` em todo o `src/`: zero leituras).
Violava a regra estrutural do próprio projeto ("a seleção pública nunca
expõe gabarito", provada para o caminho Postgres no teste (a) da fundação).

**Correção:** novo `src/lib/questions-public.ts` com `toPublicQuestion`
(allowlist explícita de 11 campos — se o tipo interno ganhar um campo novo,
ele não vaza sem decisão) e `selectQuestions` passa a mapear os itens por
ele. O `answerStatus` agregado continua público (diz *se* há gabarito, não
*qual*). O banco interno mantém o gabarito para a futura correção no
servidor. **Teste:** F1 na suíte nova + smoke ao vivo
(`ano=2024`: `answerStatus: "available"`, 0 itens com `gabarito`).

### MÉDIA — F2. `/api/v1/etec` e `/api/v1/coluni` devolviam o `answer` de todas as questões da edição
Com `?edition=`, as rotas espalhavam o objeto da edição tal e qual —
incluindo o gabarito de cada questão (1.990 ETEC + 114 COLUNI) num único
JSON limpo. Nenhum consumidor interno usa estas rotas (os leitores recebem
os dados por props das páginas). Atenuante honesto: as páginas do leitor já
enviam os gabaritos no payload por desenho atual (correção local da ETEC),
portanto isto não era uma classe nova de exposição — era uma via de
extração em massa redundante.

**Correção:** novo `src/lib/exam-public.ts` com `toPublicExamDetail`, usado
pelas duas rotas: remove `answer` de cada questão e expõe em troca
`annulled` (derivado no servidor de `answer === "ANULADA"` — anulação é
informação pública da prova; a letra, não). Também remove o `text` interno
das páginas, como a rota já fazia. Proveniência (URLs/hashes oficiais)
continua pública por desenho. **Teste:** F2 na suíte nova + smoke ao vivo
(`edition=2026-2`: 0× `"answer":`, 50× `"annulled":`).

### MÉDIA — F3. `elapsedMs` sem teto estourava o `integer` do Postgres → 500
A rota validava apenas `elapsedMs` inteiro ≥ 0; a coluna é `integer`
(int4). Reproduzido: `recordAttempt` com `elapsedMs = 3_000_000_000`
lançava o erro cru `22003 value "3000000000" is out of range for type
integer`, que a rota traduzia para 500 em vez de 400.

**Correção:** (1) serviço: nova `AttemptValidationError` + guarda em
`recordAttempt` (`MAX_ELAPSED_MS = 2_147_483_647`); (2) rota: valida o
mesmo teto e o comprimento de `questionId` (≤ 200), e traduz
`AttemptValidationError` para 400. **Teste:** F3 (teto grava; teto+1,
3e9, −1, 1.5 e NaN rejeitados como erro de validação).

### MÉDIA — F4. UUID de tentativa partilhado entre alunos → 500
O `ON CONFLICT (student_uid, id)` não cobre um conflito só na PK `id`:
se um segundo aluno reutilizasse um UUID já gravado por outro, o INSERT
lançava `23505 duplicate key … "attempts_pkey"` → 500. Reproduzido.

**Correção:** `ON CONFLICT DO NOTHING` (sem alvo) no INSERT. O SELECT
seguinte, sempre filtrado pelo próprio aluno, devolve `null` → a rota
responde 404, sem derrubar o pedido e sem revelar o registo alheio.
A idempotência do mesmo aluno fica intacta (provada no teste).
**Teste:** F4.

### MÉDIA-BAIXA — F8. Questões não publicadas eram corrigidas e aceitavam tentativas
`evaluateAnswer` não filtrava `questions.status`: uma questão `draft` ou
`withdrawn` (ex.: retirada por direitos) era corrigida e aceitava
tentativas de quem soubesse o id. Reproduzido (draft corrigida com
`correct: true`).

**Correção:** `AND q.status = 'published'` na consulta de correção —
não publicadas passam a ser tratadas como inexistentes (404 na rota).
**Teste:** F8 (draft e withdrawn → `null` em `evaluateAnswer` e em
`recordAttempt`; publicada continua a corrigir).

### BAIXA — Repositório público quebrava com `limit`/`offset` NaN ou fracionários
`listPublicQuestions` passava os valores quase crus ao `LIMIT`/`OFFSET`:
reproduzido `22P02 invalid input syntax for type bigint: "NaN"` e `"2.5"`.
Hoje nenhum chamador interno os expõe, mas o repositório é a fronteira
pública futura.

**Correção:** sanitização — não finitos caem para os padrões (30/0),
fracionários são truncados, depois o clamp 1–90 / ≥ 0 de sempre.
**Teste:** na suíte nova (NaN → 30 itens; 2.5 → 2; offset 3.9 → 4ª questão).

### BAIXA — F5. `GET /api/v1/progress` não tinha rate limit
Os agregados correm 3 consultas por pedido, sem teto por aluno (a rota de
tentativas já tinha limite de 120/min).

**Correção:** o mesmo `limitar('progress:' + uid, 120, 60_000)` após a
autenticação. Sem teste unitário: os handlers das rotas importam `next/server`
e o alias `@/` (não importáveis no harness `node --test` atual); a
verificação foi por revisão + build + smoke do caminho 401. O limitador em
si é o mesmo já usado e exercitado nas rotas de tentativas/checkout.

### BAIXA — F6. Pool do Postgres sem listener de `error`
Um cliente ocioso que falha (rede, restart do banco) emite `error` no
`Pool`; sem listener, o Node pode derrubar o processo com exceção não
apanhada.

**Correção:** `pool.on("error", …)` com log em `src/server/db.ts`.
Sem teste unitário: exige um servidor Postgres real com clientes mortos —
o PGlite dos testes não usa o `pg.Pool`. Verificado por revisão; o
comportamento sem `DATABASE_URL` (503 limpo) não muda.

### BAIXA — F7. Checkout expunha nome de variável interna na resposta 500
`STRIPE_PRICE_ID não configurado.` ia para o cliente.

**Correção:** resposta genérica ("Pagamento indisponível no momento.") e o
detalhe fica no `console.error` do servidor. Sem teste (o ramo fica atrás
de autenticação + flag de construção); verificado por revisão + build.

---

## O que já estava bem (verificado, não presumido)

- **Consultas 100% parametrizadas** em `src/server/*` e `import-etec.ts`;
  a única interpolação é a coluna de `progress-service`, que vem de uma
  união fechada de tipos (`"subject" | "topic"`), não do utilizador.
- **Correção sempre no servidor**; o repositório público nunca lê
  `question_answers` (estrutural, com teste desde a fundação).
- **Autenticação fail-closed** em attempts/progress/checkout: token
  inválido, ausente ou Admin não configurado → 401 (provado ao vivo).
- **Idempotência** das tentativas por UUID do cliente, com `replayed`.
- **Formato de erro consistente** `{ error: string }` em todas as rotas,
  sem stacks nem detalhes internos nas respostas (o detalhe vai para o
  log do servidor).
- **Headers de segurança globais** no `next.config.ts` (CSP, HSTS,
  nosniff, X-Frame-Options, COOP, Permissions-Policy) — aplicados também
  às rotas da API (provado ao vivo); `poweredByHeader: false`.
- **`official-pdf.ts`** exemplar: allowlist de hosts, redirect manual com
  revalidação, teto de tamanho, SHA-256 e magic `%PDF-`.
- **Webhook do Stripe** verifica a assinatura sobre o corpo bruto e falha
  fechado sem segredo/assinatura (400).
- **Sem `DATABASE_URL`**: rotas dependentes respondem 503 e o resto do
  site continua (desenho da fundação, intacto).

---

## Webhook do Stripe — desenho mínimo para completar o TODO (NÃO implementado)

O webhook hoje só regista `checkout.session.completed` num `console.log`.
Falta a decisão de produto sobre *entitlements* (o que "ter acesso"
significa); o desenho mínimo, quando essa decisão existir:

1. **Fonte da verdade**: campo no documento do utilizador no Firestore
   (ex.: `acesso: { ativo: boolean, desde: Timestamp, origem: "stripe",
   stripeCustomerId, stripeSubscriptionId }`) — ou custom claim
   `pago: true` se a leitura principal for no cliente. Firestore é o
   caminho mais simples porque o Admin SDK já está no servidor.
2. **Eventos a tratar** (responder 200 a todos os verificados):
   `checkout.session.completed` (ativar), `customer.subscription.deleted`
   e `invoice.payment_failed` após esgotar retries (desativar/marcar),
   `charge.refunded` / `charge.dispute.created` (desativar — alinha com a
   política anti-abuso definida na estratégia comercial).
3. **Idempotência**: gravar `event.id` processado (coleção `stripe_events`)
   antes de aplicar o efeito; o Stripe reenvia eventos e a ordem não é
   garantida — aplicar por `event.created` mais recente por subscrição.
4. **Identidade**: usar `client_reference_id`/`metadata.firebaseUid` já
   enviados pelo checkout; se ausente, resolver por `customer_email` só
   como fallback logado (nunca silencioso).
5. **Verificação do lado da leitura**: a área paga deve consultar o
   Firestore/claim no servidor (não confiar num flag do cliente).
6. Detalhe menor: hoje, se `STRIPE_SECRET_KEY` faltar, o `getStripe()`
   lança dentro do `try` da verificação e a resposta é "Assinatura
   inválida." (400) — semanticamente devia ser 500 de configuração.
   Corrigir quando o webhook for completado.

---

## Pendentes priorizados (fora do âmbito desta frente)

> **Atualização 2026-11-09** (branch `pro/profissionalizacao`): o item 1
> (P0) está **RESOLVIDO** — `public/treino/banco.json` foi removido, com
> teste de regressão em `tests/public-surface.test.mjs`. O item 3 (webhook)
> está **COMPLETO** conforme o desenho abaixo, com a leitura no servidor em
> `GET /api/v1/entitlement`. Ver `docs/PROFISSIONALIZACAO-2026-11-09.md`.

1. **P0 — `public/treino/banco.json` continua acessível como ficheiro
   estático COM os gabaritos** (`/treino/banco.json`). A API já não os
   expõe (F1), mas o ficheiro em `public/` entrega o mesmo conteúdo a
   qualquer um. Correção mínima e segura quando for autorizada: mover o
   ficheiro para fora de `public/` (ex.: `src/data/banco.json`) e ajustar
   a **única** referência em todo o repositório — o `readFileSync` de
   `src/lib/questions.ts`. Nenhum cliente lê o ficheiro por HTTP (treino
   web e app usam `/api/v1/questions`). Não feito aqui porque a tarefa
   proibiu tocar em `banco.json`.
2. **P1 — Correção local da ETEC/COLUNI nas páginas.** Os leitores
   corrigem no cliente com o gabarito no payload da página (desenho
   atual). A via da API já está fechada (F2); fechar esta exige migrar a
   correção da ETEC para o servidor (a fundação Postgres + rota de
   tentativas já o suportam) — decisão de produto/front-end.
3. **P1 — Completar o webhook** conforme o desenho acima (depende da
   decisão de entitlements).
4. **P2 — Rate limit global.** O limitador é em memória por instância;
   em serverless, cada instância tem os seus baldes. Para limite global,
   trocar por Redis/KV (já anotado no código).
5. **P2 — `origemPermitida`** aceita `Origin` igual à origem derivada do
   próprio `Host` do pedido; atrás de proxy bem configurado (Vercel) é o
   comportamento same-origin normal, mas vale revisitar se o deploy
   mudar.
6. **P2 — Limite de corpo (413)** nas rotas POST: hoje depende do limite
   da plataforma (Vercel). Se o deploy sair da Vercel, acrescentar
   verificação de `Content-Length`.
7. **P3 — CSP com nonce** por requisição (já anotado no `next.config.ts`)
   para retirar o `'unsafe-inline'` de `script-src`.
