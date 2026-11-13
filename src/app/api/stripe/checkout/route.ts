import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** A integração antiga não libera acesso e não deve receber pagamentos. */
export async function POST() {
  return NextResponse.json({ error: "Pagamento indisponível no momento." }, { status: 503 });
}
