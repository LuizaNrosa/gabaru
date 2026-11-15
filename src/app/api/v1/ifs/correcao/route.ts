import { NextResponse } from "next/server";
import { listaIfs } from "@/lib/if-exams";
import { origemPermitida } from "@/lib/seguranca";

export async function POST(request: Request) {
  if (!origemPermitida(request)) return NextResponse.json({error:"Origem não permitida."}, {status:403});
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("id" in body) || !("respostas" in body)) {
    return NextResponse.json({error:"Envie o caderno e as respostas."}, {status:400});
  }
  const caderno = listaIfs.find(exam => exam.id === body.id);
  const gabarito = caderno?.gabarito;
  if (!caderno || !gabarito) return NextResponse.json({error:"Correção indisponível."}, {status:404});
  const { respostas } = body;
  if (!respostas || typeof respostas !== "object" || Array.isArray(respostas)) {
    return NextResponse.json({error:"Respostas inválidas."}, {status:400});
  }
  const entries = Object.entries(respostas);
  if (!entries.some(([n]) => gabarito[Number(n) - 1] !== "*") ||
      entries.some(([n, letra]) => !/^[1-9]\d*$/.test(n) || Number(n) > caderno.total ||
        typeof letra !== "string" || !caderno.alternativas.includes(letra))) {
    return NextResponse.json({error:"Marque pelo menos uma alternativa válida."}, {status:400});
  }
  return NextResponse.json({gabarito}, {headers:{"Cache-Control":"no-store"}});
}
