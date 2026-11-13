import { NextResponse } from "next/server";
import { verifyRequestUser } from "@/lib/firebase/admin";
import { limitar } from "@/lib/seguranca";
import { lerEntitlement } from "@/server/entitlements";

export const runtime = "nodejs";

/**
 * GET /api/v1/entitlement — o aluno pergunta "eu tenho acesso pago?".
 *
 * A resposta vem SEMPRE do servidor (Firestore lido pelo Admin SDK), nunca
 * de um flag do cliente ou de um custom claim sozinho — regra da auditoria
 * de 2026-11-03 ("a área paga deve consultar o Firestore/claim no servidor").
 * Fail-closed: sem token → 401; sem Firestore ou sem documento → ativo:false.
 */
export async function GET(req: Request) {
  const user = await verifyRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  // Leitura barata (1 documento), mas com teto para não ser martelada.
  if (!limitar(`entitlement:${user.uid}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "Muitas consultas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const entitlement = await lerEntitlement(user.uid);
  return NextResponse.json(entitlement, {
    headers: { "Cache-Control": "no-store" },
  });
}
