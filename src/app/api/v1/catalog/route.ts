import { NextResponse } from "next/server";
import { questionCatalog } from "@/lib/questions";
export const runtime="nodejs";
export function GET(){return NextResponse.json({version:1,...questionCatalog},{headers:{"Cache-Control":"public, max-age=300"}})}
