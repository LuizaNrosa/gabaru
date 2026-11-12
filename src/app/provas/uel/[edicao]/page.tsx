import Edicao, {generateMetadata as meta} from "@/components/exames-lote/edicao";
import provas from "@/data/uerj-uel-2026.json";
type Props={params:Promise<{edicao:string}>};
export function generateStaticParams(){return provas.filter(p=>p.instituicao.toLowerCase()==="uel").map(p=>({edicao:p.id}));}
export async function generateMetadata({params}:Props){return meta({params:Promise.resolve({banca:"uel",edicao:(await params).edicao})});}
export default async function Page({params}:Props){return Edicao({params:Promise.resolve({banca:"uel",edicao:(await params).edicao})});}
