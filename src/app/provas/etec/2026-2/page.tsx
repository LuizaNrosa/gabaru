import Page from "../[edition]/page";
import {metaPagina} from "@/lib/seo";
export const metadata=metaPagina({titulo:"ETEC 2026 · 2º semestre: 50 questões e gabarito oficial",descricao:"Consulte o caderno integral, responda às questões e confira o gabarito oficial no Gabaru.",caminho:"/provas/etec/2026-2"});
export default function Existing(){return Page({params:Promise.resolve({edition:"2026-2"})});}
