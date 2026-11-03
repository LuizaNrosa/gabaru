# Camada de dados (PostgreSQL) — como correr localmente

Fundação em camadas: as rotas/páginas não falam com o banco diretamente.
Quem fala é a camada de serviços em `src/server/`:

| Ficheiro | Papel |
|---|---|
| `src/server/db.ts` | Pool `pg` preguiçoso a partir de `DATABASE_URL`. Sem a variável, devolve `null` e o site segue nos JSON em memória, sem erros. |
| `src/server/migrate.ts` | Runner idempotente de `database/questions.sql`. |
| `src/server/questions-repository.ts` | Seleção **pública** de questões. Nunca lê `question_answers` — gabarito não vaza por construção. |
| `src/server/correction-service.ts` | Único leitor de `question_answers`. Calcula `correct` no servidor (`null` para anuladas/pendentes). |
| `src/server/attempts-service.ts` | Regista tentativas com o veredito do servidor; idempotente por UUID do cliente. |
| `src/server/progress-service.ts` | Agregados por aluno (totais, disciplina, assunto) — base do Índice de Prontidão e do Painel do Cursinho. |
| `src/server/import-etec.ts` | Importação idempotente do acervo ETEC do JSON para as tabelas. |

Rotas: `POST /api/v1/attempts` e `GET /api/v1/progress` (autenticadas por
ID token do Firebase, reutilizando `verifyRequestUser`; sem token → 401;
sem `DATABASE_URL` → 503). As rotas públicas existentes não mudam.

## Comandos

```bash
# 1. Definir a ligação (ver .env.example)
export DATABASE_URL=postgres://usuario:senha@localhost:5432/gabaru

# 2. Criar/atualizar o esquema (idempotente)
npm run db:migrate

# 3. Importar o acervo ETEC (idempotente; aceita uma edição como argumento)
npm run db:import-etec            # 41 edições, 1.990 questões
npm run db:import-etec -- 2026-2  # só uma edição
```

## Limitações atuais do acervo importado

O JSON da ETEC só traz número, página e gabarito por questão (enunciado e
alternativas vivem no PDF oficial). Até à classificação editorial, as
questões entram com `statement = null`, `options = []` e
subject/topic = `nao-classificado`; o `content_sha256` amarra cada questão
ao hash do PDF oficial. Anuladas entram como status `annulled`, sem letra.

## Testes

`tests/db-foundation.test.mjs` corre a fundação inteira num Postgres
embutido (PGlite, só dev/testes): migração ×2, importação ×2, seleção
pública sem gabarito, correção certa/errada/anulada e agregados de
progresso. Corre com a suite normal: `node --test tests/*.test.mjs`.
