import { z } from "zod";

/**
 * Validação de entrada das rotas de API — única fonte de esquemas (Zod).
 *
 * Regra do projeto: a fronteira HTTP valida TUDO que entra antes de tocar
 * em serviços ou banco. Os esquemas vivem aqui para que rota, teste e
 * documentação leiam do mesmo lugar. As mensagens são em pt-BR e seguras
 * para o cliente (nunca revelam estrutura interna).
 *
 * Zod v4: `z.treeifyError`/`z.prettifyError` substituem o antigo `.flatten()`.
 */

/* ── Campos reutilizáveis ─────────────────────────────────────────────── */

/** UUID gerado pelo cliente para idempotência das tentativas. */
export const Uuid = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Espera-se um UUID.",
  );

/** Letra da alternativa marcada. */
export const ChaveAlternativa = z.enum(["A", "B", "C", "D", "E"], {
  error: "A alternativa precisa ser uma letra de A a E.",
});

/* ── POST /api/v1/attempts ────────────────────────────────────────────── */

/**
 * Teto de `attempts.elapsed_ms` (integer int4 no Postgres). Espelha
 * `MAX_ELAPSED_MS` de src/server/attempts-service.ts; definido aqui
 * independentemente para manter este módulo livre de imports de servidor.
 */
export const MAX_ELAPSED_MS = 2_147_483_647;

export const CorpoTentativa = z.object({
  id: Uuid,
  questionId: z
    .string()
    .min(1)
    .max(200, "questionId aceita até 200 caracteres."),
  selectedKey: ChaveAlternativa,
  elapsedMs: z
    .number({ error: "elapsedMs precisa ser um número." })
    .int("elapsedMs precisa ser um inteiro.")
    .min(0, "elapsedMs não pode ser negativo.")
    .max(MAX_ELAPSED_MS, `elapsedMs aceita até ${MAX_ELAPSED_MS}.`),
});

export type CorpoTentativa = z.infer<typeof CorpoTentativa>;

/* ── GET /api/v1/attempts (histórico do aluno) ────────────────────────── */

export const ConsultaHistorico = z.object({
  limit: z.coerce
    .number({ error: "limit precisa ser um número." })
    .int()
    .min(1, "limit mínimo é 1.")
    .max(50, "limit máximo é 50.")
    .default(20),
  offset: z.coerce
    .number({ error: "offset precisa ser um número." })
    .int()
    .min(0, "offset não pode ser negativo.")
    .default(0),
});

export type ConsultaHistorico = z.infer<typeof ConsultaHistorico>;

/* ── GET /api/v1/questions ────────────────────────────────────────────── */

export const ConsultaQuestoes = z.object({
  disciplina: z.string().max(60).optional(),
  ano: z
    .string()
    .regex(/^\d{4}$/, "ano precisa ter quatro dígitos.")
    .optional(),
  instituicao: z.string().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(90).default(30),
  offset: z.coerce.number().int().min(0).default(0),
  random: z.enum(["0", "1"]).optional(),
  dificuldade: z.string().max(40).optional(),
});

export type ConsultaQuestoes = z.infer<typeof ConsultaQuestoes>;

/* ── Ajudas de resposta ───────────────────────────────────────────────── */

/** Mensagem única e estável para respostas 400, a partir dos issues do Zod. */
export function mensagemDeErro(error: z.ZodError): string {
  const primeira = error.issues[0];
  if (!primeira) return "Dados inválidos.";
  const campo = primeira.path.filter((p) => typeof p !== "number").join(".");
  return campo ? `${campo}: ${primeira.message}` : primeira.message;
}
