import {NextRequest,NextResponse} from "next/server";
import exams from "@/data/etec-exams.json";
export function GET(request:NextRequest){const id=request.nextUrl.searchParams.get("edition");const selected=id?exams.filter(e=>e.id===id):exams;if(!selected.length)return NextResponse.json({error:"Edição inexistente"},{status:404});return NextResponse.json({institution:"ETEC",total:selected.length*50,exams:selected.map(({pages,...exam})=>({...exam,pages:pages.map(({text,...page})=>page)}))},{headers:{"Cache-Control":"public, max-age=3600"}});}
