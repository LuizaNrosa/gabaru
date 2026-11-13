import {IfExam,listaIfs,metaIfEdicao} from "@/components/if-archive-pages";
type Props={params:Promise<{edition:string}>};
export function generateStaticParams(){return listaIfs.filter(e=>e.instituicao.toLowerCase()==="ifmg").map(e=>({edition:e.id}));}
export async function generateMetadata({params}:Props){return metaIfEdicao("ifmg",(await params).edition);}
export default async function Page({params}:Props){return <IfExam slug="ifmg" id={(await params).edition}/>;}
