import { NextResponse } from "next/server";
import { verifyRequestUser } from "@/lib/firebase/admin";
import { limitar } from "@/lib/seguranca";
import { getDb } from "@/server/db";
import { getStudentProgress } from "@/server/progress-service";

export const runtime = "nodejs";

/**
 * GET /api/v1/progress — agregados de progresso do aluno autenticado
 * (totais, taxa de acerto, por disciplina e por assunto), calculados no
 * servidor a partir das tentativas registadas. Base do Índice de
 * Prontidão e do Painel do Cursinho.
 *
 * Falha fechada: sem token válido → 401; sem DATABASE_URL → 503.
 * Um aluno só vê o próprio progresso: o uid vem do token, nunca da query.
 */
export async function GET(req: Request) {
  const user = await verifyRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  // Mesmo limite da rota de tentativas: os agregados correm 3 consultas
  // por pedido e não devem poder ser martelados sem teto.
  if (!limitar(`progress:${user.uid}`, 120, 60_000)) {
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

  try {
    const progress = await getStudentProgress(db, user.uid);
    return NextResponse.json(progress, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[api/v1/progress]", err);
    return NextResponse.json(
      { error: "Não foi possível carregar o progresso." },
      { status: 500 },
    );
  }
}
