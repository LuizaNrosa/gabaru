import {redirect} from 'next/navigation';
import {examParsers} from '@/lib/catalogo/query-parsers';
import {JsonLd} from '@/components/json-ld';import {schemaGraph} from '@/lib/seo/schema-graph';
// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import { PageHero } from "@/components/ui";
import { AcervoBusca } from "@/components/acervo-busca";
import { metaPagina } from "@/lib/seo";

type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({searchParams}:Props){return metaPagina({
  titulo: "Provas anteriores: ENEM, vestibulares e vestibulinhos",
  descricao: "Encontre provas do ENEM, FUVEST, Unesp/Vunesp, Unicamp, ETEC e Institutos Federais por instituição e edição. Treine gratuitamente no Gabaru.",
  caminho: "/provas",semIndice:Object.keys(await searchParams).length>0,
});

}

export default async function AcervoDeProvas({searchParams}:Props) {
 const raw=await searchParams,query=new URLSearchParams();for(const [k,v]of Object.entries(raw))if(typeof v==='string')query.set(k,v);
 const clean=new URLSearchParams();for(const [key,parser]of Object.entries(examParsers)){const value=parser.parse(query.get(key)??'')??parser.defaultValue;if(value)clean.set(key,value);}
 if(Object.values(raw).some(Array.isArray)||query.toString()!==clean.toString())redirect('/provas'+(clean.size?'?'+clean:''));
  return <main id="conteudo-principal" tabIndex={-1}>
    <JsonLd dados={schemaGraph({path:"/provas",title:"Acervo de provas",breadcrumbs:[{name:"Início",path:"/"},{name:"Provas",path:"/provas"}]})}/><PageHero eyebrow="Acervo de provas" titulo={<>Encontre sua prova.<br /><mark>Comece a estudar.</mark></>}>
      <p>Busque por instituição, exame ou estado. A disponibilidade de cadernos, gabaritos e correção varia conforme a edição.</p>
    </PageHero>
    <AcervoBusca />
  </main>;
}
