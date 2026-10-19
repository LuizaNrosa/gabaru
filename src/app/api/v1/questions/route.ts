import { NextRequest,NextResponse } from "next/server";
import { selectQuestions } from "@/lib/questions";
export const runtime="nodejs";
export function GET(request:NextRequest){try{return NextResponse.json(selectQuestions(request.nextUrl.searchParams),{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"Filtros inválidos. limit: 1–90; offset: inteiro não negativo; ano: quatro dígitos."},{status:400})}}
