// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import Link from 'next/link';
import {getServerEnv} from '../../../env.mjs';
import {JsonLd} from '@/components/json-ld';
import {ComprarProduto} from '@/components/comprar-produto';
import {apostilaMatematica,totaisApostila} from '@/lib/apostila-matematica';
import {produtos,precoBRL} from '@/lib/loja/produtos';
import {metaPagina,SITE_URL} from '@/lib/seo';
import '../apostila.css';

const produto=produtos[apostilaMatematica.produto];
const t=totaisApostila();
const preco=precoBRL(produto.precoCentavos);
const base=`/apostilas/${apostilaMatematica.slug}`;

export const metadata=metaPagina({
 titulo:`Apostila de Matemática para o Vestibulinho ETEC 2027 por ${preco}`,
 descricao:`${t.capitulos} capítulos com teoria do zero, ${t.exemplos} exemplos resolvidos, ${t.fixacao} exercícios de fixação e gabarito comentado. Leitura no site, Capítulo 1 grátis.`,
 caminho:base,
});

const faq=[
 {question:'Como recebo a apostila?',answer:`A apostila é lida aqui no Gabaru, capítulo por capítulo, no computador ou no celular. Depois que o Pix é confirmado, os ${t.capitulos} capítulos ficam liberados na sua conta, sem prazo de validade.`},
 {question:'Posso ler antes de comprar?',answer:'Sim. O Capítulo 1 (base numérica, frações, MMC, MDC e conjuntos) é grátis para quem cria uma conta.'},
 {question:'Tem questões da prova da ETEC?',answer:`Sim. Cada capítulo indica questões reais de provas anteriores da ETEC, com o link do caderno e do gabarito oficiais, e o gabarito comentado escrito pela equipe Gabaru. São ${t.questoesEtec} questões oficiais no total.`},
 {question:'E se eu me arrepender?',answer:'Você pode pedir o reembolso em até 7 dias após a compra, conforme o artigo 49 do Código de Defesa do Consumidor. Veja a página de reembolso.'},
];

export default function Page(){
 const vendaAberta=getServerEnv().LOJA_ENABLED==='1';
 const url=SITE_URL+base;
 const schema={'@context':'https://schema.org','@graph':[
  {'@type':'Product','@id':url+'#produto',name:produto.titulo,description:metadata.description,url,brand:{'@type':'Brand',name:'Gabaru'},inLanguage:'pt-BR',
   ...(vendaAberta?{offers:{'@type':'Offer',price:(produto.precoCentavos/100).toFixed(2),priceCurrency:'BRL',availability:'https://schema.org/InStock',url}}:{})},
  {'@type':'Book','@id':url+'#livro',name:produto.titulo,inLanguage:'pt-BR',bookFormat:'https://schema.org/EBook',educationalLevel:'Ensino Fundamental II',
   hasPart:apostilaMatematica.capitulos.map(c=>({'@type':'Chapter',position:c.numero,name:c.titulo,url:`${url}/${c.slug}`}))},
  {'@type':'FAQPage','@id':url+'#faq',mainEntity:faq.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))},
  {'@type':'BreadcrumbList',itemListElement:[{name:'Início',path:'/'},{name:'Livros',path:'/livros'},{name:'Apostila de Matemática ETEC',path:base}].map((b,i)=>({'@type':'ListItem',position:i+1,name:b.name,item:SITE_URL+b.path}))},
 ]};
 const amostra=apostilaMatematica.capitulos.find(c=>c.numero===apostilaMatematica.amostra)!;
 return <main id="conteudo-principal" className="gb-container v2-page gb-apostila-venda">
  <JsonLd dados={schema}/>
  <nav aria-label="Trilha"><Link className="underline" href="/livros">Livros e apostilas</Link></nav>
  <header className="gb-venda-hero">
   <p className="gb-eyebrow">VESTIBULINHO ETEC 2027 · MATEMÁTICA</p>
   <h1 className="gb-page-title">A Matemática inteira da ETEC, do zero até a prova.</h1>
   <p className="v2-lead">{t.capitulos} capítulos com teoria em linguagem de aluno, contas feitas no papel, sem calculadora, do jeito que a prova cobra. Cada capítulo fecha com exercícios, questões reais da ETEC e gabarito comentado.</p>
   <ul className="gb-venda-numeros" aria-label="O que tem na apostila">
    <li><b>{t.capitulos}</b> capítulos</li>
    <li><b>{t.exemplos}</b> exemplos resolvidos</li>
    <li><b>{t.fixacao}</b> exercícios de fixação</li>
    <li><b>{t.questoes}</b> questões com gabarito comentado</li>
    <li><b>{t.questoesEtec}</b> questões oficiais da ETEC indicadas</li>
    <li><b>{Math.round(t.minutos/60)} h</b> de leitura guiada</li>
   </ul>
   <div id="comprar"><ComprarProduto produto={produto.id} preco={preco} vendaAberta={vendaAberta} destino={`${base}/${apostilaMatematica.capitulos[0].slug}`}/></div>
   <p><Link className="gb-text-link" href={`${base}/${amostra.slug}`}>Ler o Capítulo 1 grátis (com conta)</Link></p>
  </header>

  <section aria-labelledby="sumario"><h2 id="sumario" className="v2-subtitle">Sumário</h2>
   <ol className="gb-venda-sumario">{apostilaMatematica.capitulos.map(c=><li key={c.slug}>
    <span className="gb-venda-num" aria-hidden="true">{String(c.numero).padStart(2,'0')}</span>
    <div><h3><Link href={`${base}/${c.slug}`} prefetch={false}>{c.titulo}</Link></h3>
     <p>{c.resumo}</p>
     <p className="gb-book-meta"><span className={`gb-incid gb-incid-${c.incidencia}`}>Incidência {c.incidencia}</span> · {c.exemplos} exemplos · {c.fixacao} de fixação · {c.questoes} questões · cerca de {c.minutos} min{c.numero===apostilaMatematica.amostra?' · grátis com conta':''}</p>
     <details><summary>Ao terminar, você vai conseguir</summary><ul>{c.objetivos.map(o=><li key={o}>{o}</li>)}</ul></details>
    </div></li>)}</ol>
  </section>

  <section aria-labelledby="como-e"><h2 id="como-e" className="v2-subtitle">Como cada capítulo funciona</h2>
   <ol className="gb-venda-passos">
    <li><b>A aula.</b> Teoria do começo, com figuras e o quadro “Onde a ETEC tenta te pegar”.</li>
    <li><b>Vamos resolver juntos.</b> Exemplos resolvidos passo a passo, com as contas no papel.</li>
    <li><b>Agora é sua vez.</b> 15 exercícios de fixação rápida, questões autorais e questões reais da ETEC.</li>
    <li><b>Confira depois de tentar.</b> Gabarito comentado escondido até você decidir abrir.</li>
    <li><b>Para levar na cabeça.</b> Regras de ouro e a tabela “Se você tem… faça isto”.</li>
   </ol>
  </section>

  <section aria-labelledby="duvidas"><h2 id="duvidas" className="v2-subtitle">Dúvidas</h2>
   <dl>{faq.map(f=><div key={f.question}><dt className="mt-5 font-bold">{f.question}</dt><dd>{f.answer}{f.question.startsWith('E se')&&<> <Link className="underline" href="/reembolso">Política de reembolso</Link>.</>}</dd></div>)}</dl>
  </section>
 </main>;
}
