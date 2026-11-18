import {IncidenceTable} from './incidence-table';
import Link from 'next/link';
import { catalogo,questoesPublicadas,nomeTaxonomia } from '@/lib/catalogo';
import type { Categoria } from '@/lib/catalogo/types';
import { JsonLd } from './json-ld';
import { schemaGraph } from '@/lib/seo/schema-graph';
import { EditorialByline } from './editorial-byline';
import { ExamCover } from './exam-cover';
export function CatalogHub({banca,categoria}:{banca?:string;categoria?:Categoria}) {
 const institution=catalogo.bancas.find(b=>b.slug===banca);
 const boards=catalogo.bancas.filter(b=>banca?b.slug===banca:b.categoria===categoria);
 const exams=catalogo.cadernos.filter(e=>boards.some(b=>b.slug===e.banca));
 const published=questoesPublicadas.filter(q=>boards.some(b=>b.slug===q.banca));
 const name=institution?.sigla??({enem:'ENEM',vestibulinho:'Vestibulinhos',vestibulares:'Vestibulares'}[categoria??'vestibulares']);
 const path=banca?`/banca/${banca}`:`/${categoria}`;
 const faq=[{question:'Como estudar com as provas anteriores?',answer:'Escolha a instituição e o ano, leia o caderno oficial e registre suas respostas. Nas questões com resolução publicada, compare seu raciocínio com o passo a passo e revise seus erros.'},{question:'Todas as questões já têm resolução comentada?',answer:'Não. O catálogo distingue gabarito oficial e resolução comentada. As transcrições em revisão são identificadas, e questões íntegras com gabarito conferido entram no sitemap; a resolução comentada tem indicação própria.'}];
 return <main id="conteudo-principal" className="gb-container v2-page"><nav className="v2-breadcrumb" aria-label="Trilha de navegação"><Link href="/">Início</Link><span aria-hidden="true">/</span><Link href="/provas">Acervo de provas</Link></nav><ExamCover banca={banca ?? (categoria === "enem" ? "enem" : "")} className="gb-hub-cover" /><p className="gb-eyebrow">Provas anteriores · fontes oficiais</p><h1 className="gb-page-title">{name}: seu estudo começa pela prova.</h1>
 <p className="v2-lead">{institution?.nome??name} reúne provas para ingresso na educação brasileira. No Gabaru, consulte cadernos por edição, confira a quantidade de itens e a duração informada, leia as questões disponíveis e pratique com gabaritos. Use as fontes oficiais para verificar regras, pesos e critérios específicos de cada seleção.</p>
 <JsonLd dados={schemaGraph({path,title:`Provas e questões de ${name}`,breadcrumbs:[{name:'Início',path:'/'},{name,path}],faq})}/>
 <div className="v2-actions"><Link className="v2-button v2-primary" href={`/questoes${banca?'?banca='+banca:''}`}>Encontrar questões</Link><a className="v2-button" href="#cadernos">Escolher um caderno</a></div>
 <section className="mt-12" aria-labelledby="cadernos"><h2 id="cadernos" className="v2-subtitle">Cadernos por edição</h2><p className="v2-help">{exams.length} cadernos cadastrados · {published.length} questões com resolução publicada neste grupo. As contagens de itens seguem os catálogos, incluindo versões de idioma quando existentes.</p>
 <div className="v2-table-wrap" tabIndex={0} role="region" aria-label="Tabela de cadernos de prova"><table className="v2-table"><caption>Estrutura e fontes dos cadernos de {name}</caption><thead><tr><th scope="col">Banca / edição</th><th scope="col">Itens cadastrados</th><th scope="col">Duração</th><th scope="col">Critérios e notas</th><th scope="col">Prova disponível</th></tr></thead><tbody>{exams.map(e=><tr key={e.id}><th scope="row">{e.titulo}</th><td className="v2-numbers">{e.total||'Em conferência'}</td><td>{e.duracaoMinutos?`${e.duracaoMinutos} min`:'Consultar edital'}</td><td>Conforme edital da edição</td><td><Link className="underline" href={e.href}>Abrir caderno</Link></td></tr>)}</tbody></table></div>
 {!exams.length&&<p className="v2-editorial">Ainda não há cadernos cadastrados para esta instituição. Consulte a fonte oficial para provas e editais.</p>}</section>
 <IncidenceTable questions={catalogo.questoes.filter(q=>boards.some(b=>b.slug===q.banca))}/>
 {!banca&&<section className="mt-12" aria-labelledby="bancas-titulo"><h2 className="v2-subtitle" id="bancas-titulo">Escolha sua instituição</h2><ul className="v2-results mt-5">{boards.map(b=><li className="v2-result gb-exam-card" key={b.slug}><ExamCover banca={b.slug} className="gb-exam-cover" /><div><h3><Link href={`/banca/${b.slug}`}>{b.sigla} · {b.nome}</Link></h3><p>{b.estado} · {b.periodicidade}</p></div></li>)}</ul></section>}
 {published.length>0&&<section className="mt-12" aria-labelledby="comentadas-titulo"><h2 className="v2-subtitle" id="comentadas-titulo">Questões comentadas para começar</h2><ul className="v2-results mt-5">{published.map(q=><li className="v2-result" key={q.id}><Link href={`/questoes/${q.slug}`}>{q.banca.toUpperCase()} {q.ano} · Questão {q.numero} · {nomeTaxonomia(q.assunto)}</Link></li>)}</ul></section>}
 <section className="mt-12" aria-labelledby="duvidas-titulo"><h2 id="duvidas-titulo" className="v2-subtitle">Dúvidas sobre o acervo</h2>{faq.map(f=><article className="v2-editorial" key={f.question}><h3 className="font-semibold">{f.question}</h3><p>{f.answer}</p></article>)}</section><EditorialByline source={institution?.fonte??boards.find(b=>b.fonte)?.fonte??''}/>
 </main>;
}
