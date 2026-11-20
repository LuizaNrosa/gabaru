import Image from 'next/image';
import Link from 'next/link';
import { ChapterToc } from '@/components/chapter-toc';
import type { CapituloPortugues, ExemploPortugues } from '@/lib/apostila-etec-portugues';
import type { ReactNode } from 'react';
import edital from '../../specs/apostila-etec/edital-verticalizado-etec.json';
import type { Livro } from '@/lib/livros';
import matriz from '../../specs/apostila-etec/matriz-incidencia-etec.json';
import recente from '../../specs/apostila-etec/incidencia-recente.json';

const nivelRecente = (provas: number) => provas >= 18 ? 'alta' : provas >= 10 ? 'média' : 'baixa';

const sumario = [
  { id: 'raio-x', titulo: 'Raio-X da banca' },
  { id: 'desbloqueio', titulo: 'Desbloqueio e intuição' },
  { id: 'teoria', titulo: 'Teoria calibrada ao edital' },
  { id: 'exemplos', titulo: 'Exemplos resolvidos' },
  { id: 'bateria', titulo: 'Bateria oficial' },
  { id: 'resumo', titulo: 'Resumo tático de bolso' },
];

const percentual = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

/** Blocos separados por linha em branco viram parágrafos; um bloco cujas linhas começam com "• " vira lista. */
export function TextoTeoria({ texto }: { texto: string }) {
  return texto.split(/\n{2,}/).map((bloco, i) => {
    const linhas = bloco.split('\n');
    if (linhas.every(linha => linha.startsWith('• '))) {
      return <ul key={i} className="list-disc pl-6">{linhas.map(linha => <li key={linha}>{linha.slice(2)}</li>)}</ul>;
    }
    return <p key={i}>{bloco}</p>;
  });
}

function ExemploResolvido({ exemplo, numero }: { exemplo: ExemploPortugues; numero: number }) {
  return (
    <section className="gb-worked-example" aria-labelledby={`exemplo-${numero}`}>
      <h3 id={`exemplo-${numero}`}>Exemplo {numero}</h3>
      {exemplo.suporte.map(trecho => <p key={trecho}>{trecho}</p>)}
      <p><strong>{exemplo.comando}</strong></p>
      <ol type="A" className="list-[upper-alpha] pl-6">
        {exemplo.alternativas.map(alternativa => <li key={alternativa}>{alternativa}</li>)}
      </ol>
      <details>
        <summary>Ver resolução</summary>
        <ol className="list-decimal pl-6">{exemplo.passos.map(passo => <li key={passo}>{passo}</li>)}</ol>
        <p><strong>Resposta {exemplo.correta}.</strong></p>
        <ul className="list-disc pl-6" aria-label="Por que as demais alternativas estão incorretas">
          {exemplo.distratores.map(distrator => <li key={distrator}>{distrator}</li>)}
        </ul>
      </details>
    </section>
  );
}

export function LeitorPortuguesEtec({ livro, slug, titulo, capitulo, marca, minutos }: {
  livro: Livro;
  slug: string;
  titulo: string;
  capitulo: CapituloPortugues;
  marca: string;
  minutos: number | null;
}) {
  const incidencia = recente.topicos.filter(topico => capitulo.codigos.includes(topico.codigo));
  const temRaioX = incidencia.length > 0 || capitulo.raioX.length > 0;
  const itens = sumario.filter(item =>
    (item.id !== 'raio-x' || temRaioX)
    && (item.id !== 'exemplos' || capitulo.exemplos.length > 0)
    && (item.id !== 'bateria' || capitulo.oficiais.length > 0));

  return (
    <EstruturaLeitor livro={livro} slug={slug} marca={marca} minutos={minutos} itens={itens}>
      <header>
        <Image src="/marca/gabaru-carimbo.webp" width={52} height={52} alt="Carimbo Gabaru" />
        <p className="gb-eyebrow">{capitulo.materia ?? 'Matéria 1 · Português e Interpretação de Texto'}</p>
        <h1>{titulo}</h1>
        <p>{capitulo.introducao}</p>
      </header>
      {temRaioX && <section aria-labelledby="raio-x">
        <h2 id="raio-x">Raio-X da banca</h2>
        {incidencia.length > 0 && <ul className="gb-incidencia">
          {incidencia.map(topico => (
            <li key={topico.codigo}>
              <span className="gb-incidencia-selo">Incidência {nivelRecente(topico.provas)}</span>{' '}
              {topico.topico} · presente em {topico.provas} de {recente.edicoes.length} provas recentes ({topico.itens} questões, {percentual.format(topico.itens / recente.edicoes.length)} por prova)
            </li>
          ))}
        </ul>}
        {capitulo.raioX && <p>{capitulo.raioX}</p>}
      </section>}
      <section aria-labelledby="desbloqueio">
        <h2 id="desbloqueio">Desbloqueio e intuição</h2>
        <ol className="list-decimal pl-6">{capitulo.intuicao.map(passo => <li key={passo}>{passo}</li>)}</ol>
      </section>
      <section aria-labelledby="teoria">
        <h2 id="teoria">Teoria calibrada ao edital</h2>
        {capitulo.teoria.map(item => <div key={item.titulo}><h3>{item.titulo}</h3><TextoTeoria texto={item.texto} /></div>)}
        <aside className="gb-exam-trap" aria-labelledby="armadilha">
          <h3 id="armadilha">Armadilha clássica da ETEC</h3>
          <p>{capitulo.armadilha}</p>
        </aside>
      </section>
      {capitulo.exemplos.length > 0 && <section aria-labelledby="exemplos">
        <h2 id="exemplos">Exemplos resolvidos · Autoria Gabaru</h2>
        {capitulo.exemplos.map((exemplo, i) => <ExemploResolvido key={exemplo.comando} exemplo={exemplo} numero={i + 1} />)}
      </section>}
      {capitulo.oficiais.length > 0 && <section aria-labelledby="bateria">
        <h2 id="bateria">Bateria oficial · Questões reais da ETEC</h2>
        {capitulo.oficiais.map(questao => {
          const [, edicao, numero] = /^etec-(.+)-q(\d+)$/.exec(questao.id) ?? [];
          return (
            <section key={questao.id} aria-labelledby={questao.id}>
              <h3 id={questao.id}>ETEC {edicao?.replace('-', '/')} · Questão {Number(numero)}</h3>
              <p><Link className="gb-text-link" href={`/questoes/${questao.id}`}>Resolver no banco de questões</Link></p>
              <details>
                <summary>Ver gabarito comentado</summary>
                <p><strong>Alternativa {questao.correta}.</strong> {questao.justificativa}</p>
                <ul className="list-disc pl-6">{questao.distratores.map(distrator => <li key={distrator}>{distrator}</li>)}</ul>
              </details>
            </section>
          );
        })}
      </section>}
      <section aria-labelledby="resumo">
        <h2 id="resumo">Resumo tático de bolso · 1 minuto</h2>
        <ol className="list-decimal pl-6">{capitulo.resumo.map(item => <li key={item}>{item}</li>)}</ol>
      </section>
    </EstruturaLeitor>
  );
}

function EstruturaLeitor({ livro, slug, marca, minutos, itens, children }: {
  livro: Livro;
  slug: string;
  marca: string;
  minutos: number | null;
  itens: { id: string; titulo: string }[];
  children: ReactNode;
}) {
  return (
    <div className="gb-reader-layout">
      <aside>
        <ChapterToc items={itens} minutos={minutos} />
        <nav aria-label="Outros capítulos da apostila">
          <h2>{livro.titulo}</h2>
          <ol>
            {livro.capitulos.map(item => (
              <li key={item.slug}><Link prefetch={false} aria-current={item.slug === slug ? 'page' : undefined}
                href={`/livros/${livro.slug}/${item.slug}`}>{item.titulo}</Link></li>
            ))}
          </ol>
        </nav>
      </aside>
      <article className="gb-chapter gb-apostila">
        {children}
        <p className="gb-watermark">Leitura pessoal · sessão {marca}</p>
      </article>
    </div>
  );
}

const sumarioApendice = [
  { id: 'edital', titulo: 'Edital verticalizado' },
  { id: 'historico', titulo: 'Incidência histórica de Português' },
];

export function ApendicePortuguesEtec({ livro, marca }: { livro: Livro; marca: string }) {
  const topicos = edital.topicos.filter(topico => topico.componente_bncc === 'LP');
  const historico = matriz.topicos.filter(topico => topicos.some(item => item.codigo === topico.codigo_topico));

  return (
    <EstruturaLeitor livro={livro} slug="apendice" marca={marca} minutos={4} itens={sumarioApendice}>
      <header>
        <Image src="/marca/gabaru-carimbo.webp" width={52} height={52} alt="Carimbo Gabaru" />
        <p className="gb-eyebrow">Apostila ETEC</p>
        <h1>Apêndice</h1>
      </header>
      <section aria-labelledby="edital">
        <h2 id="edital">Edital verticalizado</h2>
        <p>{edital.processo} · {edital.escopo}. O art. 28 da Portaria nº 5320/2026 prevê {edital.prova.questoes_objetivas}{' '}
          questões objetivas, com {edital.prova.alternativas_por_item} alternativas cada, e remete à BNCC dos anos finais.</p>
        <h3>Competências de referência</h3>
        <ul className="list-disc pl-6">
          {Object.entries(edital.competencias).map(([codigo, descricao]) => <li key={codigo}>{codigo} · {descricao}</li>)}
        </ul>
        <h3>Português e Interpretação de Texto</h3>
        <dl>
          {topicos.map(item => (
            <div key={item.codigo} className="my-4">
              <dt><strong>{item.codigo} · {item.topico}</strong></dt>
              <dd>{item.escopo_editorial} Competências {item.competencias_etec_relacionadas.join(', ')}.
                BNCC {item.habilidades_bncc_de_referencia.join(', ')}.</dd>
              {item.capitulo && <dd><Link className="gb-text-link" href={`/livros/${livro.slug}/${item.capitulo}`}>Ler capítulo</Link></dd>}
            </div>
          ))}
        </dl>
        <p><a className="gb-text-link" href={edital.fundamento.retificacoes}>Portaria e retificações</a>
          {' · '}<a className="gb-text-link" href={edital.fundamento.bncc}>BNCC no MEC</a></p>
      </section>
      <section aria-labelledby="historico">
        <h2 id="historico">Incidência histórica de Português</h2>
        <p>A frequência indica em quantos dos {matriz.provas_inventariadas} cadernos aparece pelo menos uma questão válida
          do tópico. A análise inclui {matriz.cadernos_adicionais} cadernos adicionais e classifica cada questão pela
          operação principal.</p>
        <div className="overflow-x-auto">
          <table>
            <caption>Matéria 1 · Português e Interpretação de Texto</caption>
            <thead><tr><th scope="col">Tópico</th><th scope="col">Cadernos</th><th scope="col">Incidência</th><th scope="col">Itens</th></tr></thead>
            <tbody>
              {historico.map(item => (
                <tr key={item.codigo_topico}>
                  <th scope="row" className="text-start">{item.codigo_topico} · {item.topico}</th>
                  <td>{item.provas_com_aparicao_confirmada}/{matriz.provas_inventariadas}</td>
                  <td>{percentual.format(item.percentual_de_provas ?? 0)}% · {item.nivel_incidencia}</td>
                  <td>{item.aparicoes_absolutas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p><Link className="gb-text-link" href="/provas/etec">Consultar os cadernos no Gabaru</Link></p>
      </section>
    </EstruturaLeitor>
  );
}
