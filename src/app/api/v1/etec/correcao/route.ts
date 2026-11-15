import { NextResponse } from "next/server";
import exams from "@/data/etec-exams.json";
import { origemPermitida } from "@/lib/seguranca";

export async function POST(request: Request) {
  if (!origemPermitida(request)) {
    return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  }
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("edition" in body) || !("answers" in body)) {
    return NextResponse.json({ error: "Envie a edição e as respostas." }, { status: 400 });
  }
  const exam = exams.find(candidate => candidate.id === body.edition);
  if (!exam) {
    return NextResponse.json({ error: "Edição inexistente." }, { status: 404 });
  }
  const { answers } = body;
  const eligible = new Set(exam.questions.filter(q => q.answer !== "ANULADA").map(q => String(q.number)));
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return NextResponse.json({ error: "Respostas inválidas." }, { status: 400 });
  }
  const entries = Object.entries(answers);
  if (!entries.length || entries.some(([number, answer]) => !eligible.has(number) || typeof answer !== "string" || !/^[A-E]$/.test(answer))) {
    return NextResponse.json({ error: "Marque pelo menos uma alternativa válida antes de conferir." }, { status: 400 });
  }
  const answerKey = Object.fromEntries(exam.questions.filter(q => q.answer !== "ANULADA").map(q => [q.number, q.answer]));
  return NextResponse.json({ answerKey }, { headers: { "Cache-Control": "no-store" } });
}
