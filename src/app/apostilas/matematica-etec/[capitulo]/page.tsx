// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {createHash} from 'node:crypto';
import Link from 'next/link';
import {cookies} from 'next/headers';
import {notFound,redirect} from 'next/navigation';
import {ChapterToc} from '@/components/chapter-toc';
import {verifySessionCookie} from '@/lib/firebase/admin';
import {apostilaMatematica,capituloPorSlug,htmlCapitulo} from '@/lib/apostila-matematica';
import {metaPagina} from '@/lib/seo';
import {temProduto} from '@/server/produtos';
import '../../apostila.css';

export const dynamic='force-dynamic';
type Props={params:Promise<{capitulo:string}>};
const base=`/apostilas/${apostilaMatematica.slug}`;

export async function generateMetadata({params}:Props){
 const c=capituloPorSlug((await params).capitulo);
 return metaPagina({titulo:c?`Matemática ${String(c.numero).padStart(2,'0')}: ${c.titulo}`:'Capítulo não encontrado',descricao:c?.resumo??'Apostila de Matemática ETEC do Gabaru.',caminho:`${base}/${(await params).capitulo}`,semIndice:true});
}

const toc=[{id:'abertura',titulo:'Abertura'},{id:'teoria',titulo:'Parte 1 · A aula'},{id:'exemplos',titulo:'Parte 2 · Exemplos resolvidos'},
 {id:'exercicios',titulo:'Parte 3 · Exercícios'},{id:'gabarito',titulo:'Parte 4 · Gabarito comentado'},{id:'fechamento',titulo:'Para levar na cabeça'}];

export default async function Page({params}:Props){
 const capitulo=capituloPorSlug((await params).capitulo);if(!capitulo)notFound();
 const sessao=(await cookies()).get('__session')?.value;const user=sessao?await verifySessionCookie(sessao):null;
 if(!user)redirect('/login');
 const amostra=capitulo.numero===apostilaMatematica.amostra;
 if(!amostra&&!await temProduto(user.uid,apostilaMatematica.produto))redirect(`${base}#comprar`);
 const marca=createHash('sha256').update(`${user.uid}:${user.auth_time}`).digest('hex').slice(0,12);
 const corpo=await htmlCapitulo(capitulo);
 const lista=apostilaMatematica.capitulos,i=lista.indexOf(capitulo),anterior=lista[i-1],proximo=lista[i+1];
 return <main id="conteudo-principal" className="gb-container v2-page">
  <nav aria-label="Biblioteca"><Link className="underline" href={base}>Apostila de Matemática ETEC</Link></nav>
  <div className="gb-reader-layout">
   <aside>
    <ChapterToc items={toc} minutos={capitulo.minutos}/>
    <nav aria-label="Capítulos da apostila"><h2>Capítulos</h2><ol>{lista.map(c=><li key={c.slug}><Link prefetch={false} aria-current={c.slug===capitulo.slug?'page':undefined} href={`${base}/${c.slug}`}>{String(c.numero).padStart(2,'0')} · {c.titulo}</Link></li>)}</ol></nav>
   </aside>
   <article className="gb-chapter gb-apostila-mat" aria-labelledby="titulo-capitulo">
    {amostra&&<p className="gb-sample-badge">Capítulo grátis para contas cadastradas · <Link href={`${base}#comprar`}>liberar os {lista.length} capítulos</Link></p>}
    {/* HTML gerado no repositório por ferramentas/apostila-matematica/exportar_site.py (sem entrada de usuário). */}
    {corpo?<div dangerouslySetInnerHTML={{__html:corpo}}/>:<p role="alert">Este capítulo está sendo atualizado. Tente de novo em alguns minutos.</p>}
    <p className="gb-watermark">Leitura pessoal · sessão {marca}</p>
    <nav className="gb-apostila-nav" aria-label="Navegação entre capítulos">
     {anterior?<Link href={`${base}/${anterior.slug}`} prefetch={false}>← {String(anterior.numero).padStart(2,'0')} · {anterior.titulo}</Link>:<span/>}
     {proximo&&<Link href={`${base}/${proximo.slug}`} prefetch={false}>{String(proximo.numero).padStart(2,'0')} · {proximo.titulo} →</Link>}
    </nav>
   </article>
  </div>
 </main>;
}
