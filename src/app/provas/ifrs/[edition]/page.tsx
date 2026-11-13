import {IfExam,listaIfs,metaIfEdicao} from "@/components/if-archive-pages";
type Props={params:Promise<{edition:string}>};
export function generateStaticParams(){return listaIfs.filter(e=>e.instituicao.toLowerCase()==="ifrs").map(e=>({edition:e.id}));}
export async function generateMetadata({params}:Props){return metaIfEdicao("ifrs",(await params).edition);}
export default async function Page({params}:Props){return <IfExam slug="ifrs" id={(await params).edition}/>;}
