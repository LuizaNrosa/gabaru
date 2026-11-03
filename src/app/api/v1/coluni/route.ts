import {NextRequest,NextResponse} from "next/server";
import exams from "@/data/coluni-exams.json";
import {toPublicExamDetail} from "@/lib/exam-public";
export function GET(request:NextRequest){const id=request.nextUrl.searchParams.get("edition");const selected=id?exams.filter(e=>e.id===id):exams;if(!selected.length)return NextResponse.json({error:"Edição inexistente"},{status:404});return NextResponse.json({institution:"COLUNI/UFV",total:selected.reduce((n,e)=>n+e.questions.length,0),exams:id?selected.map(e=>toPublicExamDetail(e)):selected.map(e=>({id:e.id,title:e.title,kind:e.kind,count:e.questions.length,pageCount:e.pageCount,annulled:e.questions.filter(q=>q.answer==='ANULADA').length,url:`/provas/coluni/${e.id}`}))},{headers:{"Cache-Control":"public, max-age=3600"}});}
