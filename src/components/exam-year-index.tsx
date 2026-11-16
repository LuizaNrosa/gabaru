import Link from 'next/link';
import { notFound } from 'next/navigation';
import { catalogo } from '@/lib/catalogo';
export function ExamYearIndex({banca,year}:{banca:string;year:number}) {
 const exams=catalogo.cadernos.filter(e=>e.banca===banca&&e.ano===year);if(!exams.length)notFound();
 return <main id="conteudo-principal" className="gb-container v2-page"><Link className="v2-source" href={`/banca/${banca}`}>Todas as edições de {banca.toUpperCase()}</Link><h1 className="gb-page-title">Provas {banca.toUpperCase()} {year}</h1><p className="v2-lead">Escolha a aplicação e a versão do caderno. Cada edição mantém sua fonte oficial e seu gabarito; versões diferentes não representam necessariamente questões inéditas.</p><ul className="v2-results">{exams.map(e=><li className="v2-result" key={e.id}><h2>{e.id.includes(":doc-")?<a href={e.fonte} target="_blank" rel="noopener noreferrer">{e.titulo} · documento original</a>:<Link href={e.href}>{e.titulo}</Link>}</h2><p>{e.total?`${e.total} itens`:"Contagem de itens em revisão"} · {e.duracaoMinutos?e.duracaoMinutos+' minutos':'Duração: consulte o edital'}</p></li>)}</ul></main>;
}
