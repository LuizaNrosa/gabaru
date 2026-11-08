# Profissionalização — 2026-11-09

Frente de trabalho executada na branch `pro/profissionalizacao`, sobre o
commit `d22df5f` (Acervo IFSP 2026-1-tipo2). Cada bloco abaixo virou um
commit atômico, revisável isoladamente.

**Validação:** `tsc --noEmit` limpo · `eslint .` 0 erros (4 warnings
intencionais de `<img>` nos leitores de scan) · **110/110 testes** (90
anteriores + 20 novos) · `npm run build` exit 0 · smoke ao vivo com
`next start`: home 200, `/treino/banco.json` **404**, `/api/v1/questions`
sem `"gabarito"`, 401 sem token em attempts/entitlement, 400 no webhook sem
assinatura, 503 no checkout em construção, copyright no rodapé e nos
metadados, `aria-current` na navegação, painel redirecionando a `/login`.

---

## 1. Copyright e licença — Luiza Nascimento Rosa

- `LICENSE` novo: todos os direitos reservados (pt-BR + EN), com seção de
  conteúdo de terceiros (provas pertencem às instituições) e contato para
  licenciamento.
- `package.json`: `author`, `license: UNLICENSED`, `repository`, `homepage`,
  `bugs`, `engines` (Node ≥ 22.18) e chave `copyright`.
- Site: rodapé com `© {ano} Luiza Nascimento Rosa` (coluna da marca e linha
  final), metadados `authors/creator/publisher/other.copyright` no layout e
  `founder` no JSON-LD da organização.
- `README.md`: seção "Qualidade e CI" + "Autoria e direitos".

## 2. Segurança — P0 da auditoria resolvido

`public/treino/banco.json` (544 KB, cópia obsoleta da base de treino servida
como ficheiro estático) foi **removido**. A base viva é
`src/data/treino-banco.json`, lida apenas no servidor por `questions.ts`
(já migrado antes para fora de `public/`). Teste de regressão novo
(`tests/public-surface.test.mjs`) prova as duas metades da regra: o ficheiro
não pode existir em `public/` e nenhum ficheiro público pode conter gabarito.

## 3. Validação centralizada com Zod (v4)

- Novo `src/lib/validation.ts`: única fonte dos esquemas de entrada — UUID
  de idempotência, alternativa A–E, teto do int4 (`elapsedMs ≤ 2 147 483 647`),
  `limit`/`offset` das listagens, ano de 4 dígitos — e `mensagemDeErro()`,
  que produz a resposta 400 única em pt-BR.
- `POST /api/v1/attempts` e `GET /api/v1/questions` validam na fronteira pelo
  esquema central; as guardas antigas dos serviços continuam como defesa em
  profundidade (comportamento preservado, agora com mensagens por campo).
- Testes: `tests/validation.test.mjs` (7 testes, sem I/O).

## 4. Webhook do Stripe completo (TODO da auditoria)

Implementado conforme o "desenho mínimo" documentado na auditoria:

- `src/server/entitlements-decisao.ts` — decisão **pura** evento → ação
  (ativar / desativar / marcar / ignorar), testável sem I/O.
- `src/server/entitlements.ts` — fonte da verdade no Firestore
  (`users/{uid}.acesso`), mapa `stripe_customers/{customerId} → uid` para
  resolver desativações, **idempotência por `stripe_events/{event.id}` em
  transação** (reenvios do Stripe são seguros), custom claim `acesso`
  best-effort. Falhas de I/O nunca derrubam o webhook: log + reenvio.
- Eventos: `checkout.session.completed` (ativa),
  `customer.subscription.deleted` / `charge.refunded` /
  `charge.dispute.created` (desativam), `invoice.payment_failed` (marca —
  o corte vem da subscription, como o desenho pedia).
- Semântica de resposta corrigida: falta `STRIPE_SECRET_KEY` → **500**
  (configuração); assinatura inválida → **400** (o Stripe não reenvia).
  A auditoria pedia exatamente esta distinção (item 6 do desenho).
- Nova rota `GET /api/v1/entitlement`: a área paga consulta o acesso
  **no servidor**, fail-closed (401 sem token; sem Firestore/doc →
  `ativo: false`).
- Testes: `tests/entitlements.test.mjs` (7 testes da decisão pura).

## 5. Funcionalidade nova: histórico de treino (ponta a ponta)

- Serviço: `listAttempts()` — página do histórico do **próprio aluno**
  (uid do token, nunca de query), JOIN com `questions` para disciplina e
  assunto, `ORDER BY created_at DESC` sobre o índice
  `attempts_student(student_uid, created_at DESC)`, paginação com `total`
  e `nextOffset`.
- API: `GET /api/v1/attempts` (401/429/503 como as rotas irmãs; query
  validada por Zod).
- Acervo ETEC: o leitor grava cada marcação via `registrarTentativa()`
  (novo `src/lib/attempt-sync.ts`) — fire-and-forget, UUID de idempotência,
  tempo por questão, **silencioso offline** (o treino nunca depende do
  servidor). A correção continua local: o P1 "migrar correção da ETEC para
  o servidor" continua aberto como decisão de produto.
- Painel: o card "EM DESENVOLVIMENTO — Sua evolução" virou o card real
  **"Sua evolução"** (`painel-evolucao.tsx`), com TanStack Query v5:
  resumo (respostas, acertos, aproveitamento) + últimas respostas com
  resultado, disciplina e data. Estados honestos: esqueleto de carregamento,
  503 explicado ("liga quando o banco estiver conectado"), erro com retry,
  vazio com caminho para o primeiro treino. Nenhum número inventado.
- `QueryClient` confinado ao layout do painel (o resto do site não paga o
  runtime no bundle).
- Testes: `tests/attempts-history.test.mjs` (4 testes com PGlite: ordem,
  paginação, isolamento por aluno, vazio).

## 6. Front-end e acessibilidade

- Navegação desktop e mobile marca a seção corrente com
  `aria-current="page"` + sublinhado na cor do carimbo (`gold-text`,
  5,19:1 — segue a regra AA do design system).
- Correções que o ESLint trouxe à tona: `<a>` de rota interna vira `<Link>`
  na home (client-side nav + prefetch); aspas tipográficas em JSX
  (`react/no-unescaped-entities`).
- CSS: `.gb-skeleton` (bloco estático — o site já respeita
  `prefers-reduced-motion`) e `.gb-stat-sm` para as métricas do painel.

## 7. Infra e CI

- `.github/workflows/ci.yml`: `typecheck → lint → test → build` a cada
  push/PR na main, Node via `.nvmrc` (22), cache de npm, `concurrency`
  para não duplicar runs. Sem credenciais reais — o build é verde sem elas
  (degradação provada).
- `eslint.config.mjs`: ESLint 9 flat config (next/core-web-vitals +
  next/typescript via FlatCompat). O `next lint` foi removido no Next 16;
  o script `lint` agora é `eslint .`.
- `.nvmrc`, `.editorconfig`, `.github/dependabot.yml` (npm semanal agrupado
  + actions mensal).
- `package.json`: script `test` (`node --test "tests/*.test.mjs"` — a
  forma `tests/` pura não expande o glob e falha; este era o porquê do
  1 teste fantasma no runner de diretório).

## Decisões conscientes (o que NÃO foi feito e por quê)

- **Drizzle/Prisma sobre a camada `src/server/` atual** — a camada de dados
  auditada (consultas 100% parametrizadas, `Db` interface testável com
  PGlite) é o melhor patrimônio do projeto; trocar por ORM invalidaria a
  auditoria e os testes sem ganho funcional hoje. Revisitar quando o schema
  crescer (habilidades, domínio, plano de estudo — ver `ARQUITETURA.md`).
- **Vitest** — a suíte `node:test` roda TS nativo sem transpilar, zero
  dependência, no CI. Migração traria churn sem ganho; Playwright E2E é o
  próximo passo de teste que agrega (precisa de browsers no CI).
- **Dockerfile** — o deploy é Render nativo; adicionar `output: standalone`
  mudaria o build de produção sem necessidade. Documentado como opção.
- **Rate limit global (P2)** — continua em memória por instância; trocar
  por Redis/KV exige escolher o serviço no Render. Pendência mantida.

## Roadmap sugerido (20 % → próximo estágio)

1. **P1 — correção ETEC no servidor** (fechar o gabarito do payload da
   página): a fundação (rota de tentativas + `question_answers`) já está
   no ar; falta decisão de produto e o leitor a ler `correct` da resposta
   da API.
2. **Stripe real**: produto/preço no painel, `STRIPE_PRICE_ID`, endpoint do
   webhook, teste com `stripe listen` e smoke do entitlement.
3. **Firebase App Check + restrição da chave de API** ao domínio
   (itens 2 e 3 da seção "Segurança: próximos passos" da `ARQUITETURA.md`).
4. **Playwright** para o caminho crítico: abrir prova → responder → conferir
   → histórico no painel (mock do Firebase via `state` salvo).
5. **LGPD**: política de privacidade e termos antes de coletar dados de
   menores (a base de alunos cresce com o histórico).
6. **Painel do Cursinho** (B2B, gratuito): agregados por turma reusando
   `progress-service` com `student_uid IN (turma)`.
