import { NextRequest, NextResponse } from "next/server";
import { selectQuestions } from "@/lib/questions";
import { ConsultaQuestoes, mensagemDeErro } from "@/lib/validation";

export const runtime = "nodejs";

/**
 * GET /api/v1/questions — seleção pública do banco de treino (ENEM).
 *
 * A entrada é validada pelo esquema central (Zod) antes de chegar ao
 * seletor; os itens saem sem gabarito (ver src/lib/questions-public.ts).
 */
export function GET(request: NextRequest) {
  const parsed = ConsultaQuestoes.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: mensagemDeErro(parsed.error) },
      { status: 400 },
    );
  }

  // O seletor continua com a sua própria guarda (defesa em profundidade).
  const params = new URLSearchParams(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined).map(
      ([k, v]) => [k, String(v)],
    ),
  );

  try {
    return NextResponse.json(selectQuestions(params), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Filtros inválidos. limit: 1–90; offset: inteiro não negativo; ano: quatro dígitos.",
      },
      { status: 400 },
    );
  }
}
