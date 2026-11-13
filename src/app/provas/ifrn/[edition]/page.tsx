import {IfExam,listaIfs,metaIfEdicao} from "@/components/if-archive-pages";
type Props={params:Promise<{edition:string}>};
export function generateStaticParams(){return listaIfs.filter(e=>e.instituicao.toLowerCase()==="ifrn").map(e=>({edition:e.id}));}
export async function generateMetadata({params}:Props){return metaIfEdicao("ifrn",(await params).edition);}
export default async function Page({params}:Props){return <IfExam slug="ifrn" id={(await params).edition}/>;}
