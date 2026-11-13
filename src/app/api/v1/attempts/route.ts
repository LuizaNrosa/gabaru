import { NextRequest, NextResponse } from "next/server";
import { verifyRequestUser } from "@/lib/firebase/admin";
import { limitar, origemPermitida } from "@/lib/seguranca";
import { getDb } from "@/server/db";
import {
  recordAttempt,
  listAttempts,
  AttemptValidationError,
} from "@/server/attempts-service";
import { CorpoTentativa, ConsultaHistorico, mensagemDeErro } from "@/lib/validation";

export const runtime = "nodejs";

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

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  // A fronteira valida o corpo inteiro com o esquema central (Zod):
  // tipos, tamanhos, teto do int4 do Postgres — tudo num sítio só.
  const parsed = CorpoTentativa.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json(
      { error: mensagemDeErro(parsed.error) },
      { status: 400 },
    );
  }
  const { id, questionId, selectedKey, elapsedMs } = parsed.data;

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

/**
 * GET /api/v1/attempts — histórico de respostas do PRÓPRIO aluno, mais
 * recentes primeiro, com disciplina/assunto vindos do JOIN com `questions`.
 *
 * Falha fechada como as irmãs: sem token → 401; sem DATABASE_URL → 503.
 * O uid vem do token, nunca de query; limit/offset validados por Zod
 * (limit 1–50, padrão 20; offset ≥ 0).
 */
export async function GET(req: NextRequest) {
  const user = await verifyRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!limitar(`attempts:${user.uid}`, 120, 60_000)) {
    return NextResponse.json(
      { error: "Muitas consultas. Aguarde um minuto." },
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

  const parsed = ConsultaHistorico.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: mensagemDeErro(parsed.error) },
      { status: 400 },
    );
  }
  const { limit, offset } = parsed.data;

  try {
    const pagina = await listAttempts(db, user.uid, limit, offset);
    return NextResponse.json(pagina, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[api/v1/attempts GET]", err);
    return NextResponse.json(
      { error: "Não foi possível carregar o histórico." },
      { status: 500 },
    );
  }
}
