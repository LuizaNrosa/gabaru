// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import { NextResponse } from "next/server";
import bank from "@/data/treino-banco.json";
import { limitar, origemPermitida } from "@/lib/seguranca";

export const runtime = "nodejs";
// Conferido integralmente contra o gabarito oficial: ENEM 2025, 1º dia, caderno 1 azul.
// https://download.inep.gov.br/enem/provas_e_gabaritos/2025_GB_impresso_D1_CD1.pdf
export async function POST(req: Request) {
  if (!origemPermitida(req)) return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  if (!limitar("enem-simulado", 1000, 60_000)) return NextResponse.json({ error: "Tente novamente em instantes." }, { status: 429 });
  let data: unknown;
  try { data = await req.json(); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const { examId, language, answers } = data as { examId?: unknown; language?: unknown; answers?: unknown };
  if (examId !== "enem-2025-d1" || (language !== "ingles" && language !== "espanhol") || !answers || typeof answers !== "object" || Array.isArray(answers)) return NextResponse.json({ error: "Simulado ou respostas inválidas." }, { status: 400 });
  const answerMap = answers as Record<string, unknown>;
  const entries = Object.entries(answerMap);
  if (entries.length > 90 || entries.some(([key, value]) => !/^(?:[1-9]|[1-8][0-9]|90|10[1-5])$/.test(key) || typeof value !== "string" || !/^[A-E]$/.test(value))) return NextResponse.json({ error: "Alternativas inválidas." }, { status: 400 });
  const selected = bank.filter(q => q.id.startsWith("enem-2025-d1-q") && (language === "ingles" ? q.numero < 101 : q.numero > 5));
  const allowed = new Set(selected.map(q => String(q.numero)));
  if (selected.length !== 90 || entries.some(([key]) => !allowed.has(key)) || selected.some(q => !q.gabarito || q.gabarito === "ANULADA")) return NextResponse.json({ error: "Gabarito indisponível." }, { status: 400 });
  let correct = 0, incorrect = 0, blank = 0;
  for (const q of selected) {
    const answer = answerMap[String(q.numero)];
    if (!answer) blank++;
    else if (answer === q.gabarito) correct++;
    else incorrect++;
  }
  return NextResponse.json({ correct, incorrect, blank }, { headers: { "Cache-Control": "no-store" } });
}
