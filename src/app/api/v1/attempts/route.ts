import { NextResponse } from "next/server";
import { verifyRequestUser } from "@/lib/firebase/admin";
import { limitar, origemPermitida } from "@/lib/seguranca";
import { getDb } from "@/server/db";
import {
  recordAttempt,
  AttemptValidationError,
  MAX_ELAPSED_MS,
} from "@/server/attempts-service";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/v1/attempts — regista a resposta de um aluno autenticado.
 *
 * Corpo: { id (UUID gerado pelo cliente), questionId, selectedKey, elapsedMs }.
 * O `correct` é calculado no servidor a partir de `question_answers`; o
 * cliente nunca o envia. Reenviar o mesmo `id` é idempotente (devolve o
 * registo original) — pensado para a sincronização do app offline.
 *
 * Falha fechada: sem token válido do Firebase → 401 (inclui o caso em que
 * as variáveis FIREBASE_ADMIN_* não estão configuradas). Sem DATABASE_URL
 * → 503, sem afetar o resto do site.
 */
export async function POST(req: Request) {
  if (!origemPermitida(req)) {
    return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  }
  const user = await verifyRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!limitar(`attempts:${user.uid}`, 120, 60_000)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Banco de dados não configurado." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const { id, questionId, selectedKey, elapsedMs } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof id !== "string" ||
    !UUID_RE.test(id) ||
    typeof questionId !== "string" ||
    questionId.length === 0 ||
    questionId.length > 200 ||
    typeof selectedKey !== "string" ||
    !/^[A-E]$/.test(selectedKey) ||
    typeof elapsedMs !== "number" ||
    !Number.isInteger(elapsedMs) ||
    elapsedMs < 0 ||
    elapsedMs > MAX_ELAPSED_MS
  ) {
    return NextResponse.json(
      {
        error:
          "Campos obrigatórios: id (UUID), questionId (até 200 caracteres), selectedKey (A–E) e elapsedMs (inteiro entre 0 e 2147483647).",
      },
      { status: 400 },
    );
  }

  try {
    const attempt = await recordAttempt(db, {
      id,
      studentUid: user.uid,
      questionId,
      selectedKey,
      elapsedMs,
    });
    if (!attempt) {
      return NextResponse.json({ error: "Questão inexistente." }, { status: 404 });
    }
    return NextResponse.json(attempt, {
      status: attempt.replayed ? 200 : 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    if (err instanceof AttemptValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[api/v1/attempts]", err);
    return NextResponse.json(
      { error: "Não foi possível registar a tentativa." },
      { status: 500 },
    );
  }
}
