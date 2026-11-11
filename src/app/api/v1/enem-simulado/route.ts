// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import { NextResponse } from "next/server";
import bank from "@/data/treino-banco.json";
import verifiedExams from "@/data/enem-gabaritos-conferidos.json";
import { origemPermitida } from "@/lib/seguranca";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!origemPermitida(req)) return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  let data: unknown;
  try { const body = await req.text(); if (body.length > 8192) throw new Error("Corpo grande"); data = JSON.parse(body); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const { examId, language, answers } = data as { examId?: unknown; language?: unknown; answers?: unknown };
  const verified = typeof examId === "string" ? verifiedExams.find(e => e.id === examId) : undefined;
  if (typeof examId !== "string" || !verified || (language !== "ingles" && language !== "espanhol") || !answers || typeof answers !== "object" || Array.isArray(answers)) return NextResponse.json({ error: "Simulado ou respostas inválidas." }, { status: 400 });
  const answerMap = answers as Record<string, unknown>;
  const entries = Object.entries(answerMap);
  if (entries.length > 90 || entries.some(([key, value]) => !/^[1-9][0-9]{0,2}$/.test(key) || typeof value !== "string" || !/^[A-E]$/.test(value))) return NextResponse.json({ error: "Alternativas inválidas." }, { status: 400 });
  const exam = bank.filter(q => q.id.startsWith(examId + "-q"));
  const hasLanguages = exam.some(q => q.numero >= 101 && q.numero <= 105 && q.disciplina === "espanhol");
  const selected = hasLanguages ? exam.filter(q => language === "ingles" ? !(q.numero >= 101 && q.numero <= 105 && q.disciplina === "espanhol") : !(q.numero >= 1 && q.numero <= 5 && q.disciplina === "ingles")) : exam;
  const allowed = new Set(selected.map(q => String(q.numero)));
  const expected = new Set(verified.numbers.map(String));
  const complete = exam.length === expected.size && new Set(exam.map(q => String(q.numero))).size === expected.size && exam.every(q => expected.has(String(q.numero)));
  if (!complete || !selected.length || selected.length > 90 || allowed.size !== selected.length || entries.some(([key]) => !allowed.has(key)) || selected.some(q => !q.gabarito || !/^(?:[A-E]|ANULADA)$/.test(q.gabarito))) return NextResponse.json({ error: "Gabarito indisponível." }, { status: 400 });
  let correct = 0, incorrect = 0, blank = 0, annulled = 0;
  const items = selected.map(q => {
    const selectedAnswer = answerMap[String(q.numero)] as string | undefined;
    const status = q.gabarito === "ANULADA" ? "annulled" : !selectedAnswer ? "blank" : selectedAnswer === q.gabarito ? "correct" : "incorrect";
    if (status === "annulled") annulled++;
    else if (status === "blank") blank++;
    else if (status === "correct") correct++;
    else incorrect++;
    return { number: q.numero, selected: selectedAnswer ?? null, key: q.gabarito, status };
  });
  return NextResponse.json({ correct, incorrect, blank, annulled, items }, { headers: { "Cache-Control": "no-store" } });
}
