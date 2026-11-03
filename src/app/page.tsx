import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { jsonLd, metaHome } from "@/lib/seo";

export const metadata: Metadata = metaHome();

const paths = [
  {
    n: "01",
    name: "Vestibulinho ETEC",
    exams: "41 provas oficiais · 1.990 questões",
    text: "Provas oficiais com correção pelo gabarito, nota de corte e demanda do curso que você quer.",
    href: "/pre-vestibulinho",
    tag: "Foco do Gabaru",
  },
  {
    n: "02",
    name: "Acervo de provas",
    exams: "ETEC · COLUNI · ENEM · Unesp · Unicamp",
    text: "Os cadernos oficiais, edição a edição, para ler, responder e conferir na hora.",
    href: "/provas/etec",
    tag: "Disponível",
  },
  {
    n: "03",
    name: "Treino ENEM",
    exams: "ENEM · 2.127 questões oficiais",
    text: "Sessões por disciplina com as questões dos cadernos oficiais do INEP.",
    href: "/treino",
    tag: "Disponível",
  },
];
const faq = [
  [
    "O que posso usar agora, de graça?",
    "O acervo completo do Vestibulinho ETEC (41 provas e 1.990 questões, com correção pelo gabarito oficial), a ferramenta “Minha nota dá para passar?” e o treino do ENEM. Dá para começar sem cadastro.",
  ],
  [
    "A nota de corte da ferramenta é uma estimativa?",
    "Não. Só publicamos nota de corte quando a lemos numa lista de classificação oficial. Nas combinações ainda em coleta, a ferramenta mostra a demanda oficial e diz “em coleta” — nunca um número estimado disfarçado.",
  ],
  [
    "O ENEM saiu do Gabaru?",
    "Não. O acervo e o treino do ENEM continuam no ar: são 2.127 questões, com 1.560 gabaritos oficiais já casados às questões. A vitrine passou a ser do Vestibulinho porque era lá que faltava tudo isto.",
  ],
  [
    "Sou de um cursinho comunitário. Quanto custa o Painel do Cursinho?",
    "Nada. O painel nasce gratuito para cursinhos comunitários e populares. Ele está em construção; as primeiras turmas-piloto vêm a seguir.",
  ],
  [
    "O Gabaru já está vendendo planos?",
    "Não. A plataforma está em construção e as vendas continuam bloqueadas. Tudo o que está no ar hoje é gratuito.",
  ],
];
export default function Home() {
  return (
    <main className="gb-home">
      <JsonLd dados={jsonLd.faq(faq)} />
      <section className="gb-hero gb-container" aria-labelledby="gb-title">
        <div className="gb-hero-copy">
          <p className="gb-eyebrow">
            <span className="gb-live-dot" /> VESTIBULINHO ETEC · PROVAS OFICIAIS
            VERIFICADAS
          </p>
          <h1 id="gb-title">
            Sua vaga na ETEC
            <br />
            se conquista na
            <br />
            <em>prova de verdade.</em>
          </h1>
          <p className="gb-lead">
            As 41 provas oficiais do Vestibulinho, com gabarito conferido e
            correção na hora — e a resposta que nenhum concorrente dá: a sua
            nota, hoje, dá para passar no curso que você quer?
          </p>
          <div className="gb-actions">
            <Link className="gb-button" href="/nota-de-corte">
              Minha nota dá para passar? <span aria-hidden="true">↗</span>
            </Link>
            <a className="gb-text-link" href="/provas/etec">
              Abrir o acervo de provas <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="gb-footnote">
            Grátis, sem cadastro. Dados oficiais do Centro Paula Souza.
          </p>
        </div>
        <div
          className="gb-hero-art"
          role="img"
          aria-label="Folha de prova do Vestibulinho ETEC com alternativas marcadas, gabarito oficial assinalado a carimbo e o selo: questão oficial verificada"
        >
          <div className="gb-sheet-head">
            <span>Vestibulinho ETEC · 2026/1</span>
            <span>Caderno oficial</span>
          </div>
          <p className="gb-sheet-q">QUESTÃO 07 — MATEMÁTICA</p>
          <div className="gb-sheet-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="gb-sheet-alts" aria-hidden="true">
            <p className="gb-sheet-alt">
              <span className="gb-bubble" /> A
            </p>
            <p className="gb-sheet-alt">
              <span className="gb-bubble" /> B
            </p>
            <p className="gb-sheet-alt">
              <span className="gb-bubble gb-bubble-on" /> C · a sua marcação
            </p>
            <p className="gb-sheet-alt gb-sheet-alt-key">
              <span className="gb-bubble gb-bubble-key">✓</span> D · gabarito
              oficial
            </p>
            <p className="gb-sheet-alt">
              <span className="gb-bubble" /> E
            </p>
          </div>
          <div className="gb-sheet-grid" aria-hidden="true">
            {[
              1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0,
              0, 0, 1, 0, 0, 1, 0, 0,
            ].map((on, i) => (
              <span
                key={i}
                className={`gb-bubble${on ? " gb-bubble-on" : ""}`}
              />
            ))}
          </div>
          <span className="gb-stamp gb-hero-stamp">
            Questão oficial
            <br />
            verificada ✓
          </span>
        </div>
      </section>
      <div className="gb-facts">
        <div className="gb-container">
          <span>41 provas oficiais do Vestibulinho</span>
          <span>1.990 questões com gabarito oficial</span>
          <span>714 já com enunciado e alternativas em texto</span>
          <span>ENEM: 2.127 questões · 1.560 gabaritos casados</span>
        </div>
      </div>
      <section
        className="gb-section gb-container"
        aria-labelledby="gb-tool-title"
      >
        <div className="gb-section-intro">
          <div>
            <p className="gb-eyebrow">FERRAMENTA GRATUITA</p>
            <h2 id="gb-tool-title">
              Minha nota
              <br />
              <em>dá para passar?</em>
            </h2>
          </div>
          <p>
            Escolha curso, unidade e turno, projete os seus acertos com a
            pontuação acrescida e compare com o corte real e a demanda oficial.
            Onde a coleta ainda não chegou, a ferramenta diz “em coleta” — não
            inventa número.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-stretch">
          <div className="rounded-lg border border-n2 bg-[#fffdf7] p-6 sm:p-8">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-n4">
              Exemplo real · lista oficial de 2026/1
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Desenvolvimento de Sistemas — Etec de Guarulhos, manhã
            </h3>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-md border border-n2 bg-paper p-4">
                <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-n4">
                  Demanda oficial
                </dt>
                <dd className="mt-1 text-2xl font-bold">
                  25,2 <span className="text-sm font-semibold">candidatos/vaga</span>
                </dd>
              </div>
              <div className="rounded-md border border-n2 bg-paper p-4">
                <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-n4">
                  Corte de 1ª chamada
                </dt>
                <dd className="mt-1 flex items-center gap-3 text-2xl font-bold text-gold">
                  45,00
                  <span className="gb-stamp gb-stamp-sm">Corte real ✓</span>
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-n5">
              Nota final do 40º classificado (40 vagas), já com bônus, entre
              898 classificados. É este número — lido na lista oficial, não
              estimado — que a sua projeção enfrenta.
            </p>
          </div>
          <div className="flex flex-col justify-center rounded-lg border-2 border-dashed border-n3 p-6 sm:p-8">
            <ol className="grid gap-5">
              {[
                [
                  "01",
                  "Escolha o alvo",
                  "Curso, unidade e turno: é dentro dessa combinação que você disputa a vaga.",
                ],
                [
                  "02",
                  "Projete a sua nota",
                  "Acertos de 0 a 50, com +10% (escola pública) e +3% (autodeclaração afrodescendente), como manda a regra oficial.",
                ],
                [
                  "03",
                  "Enfrente o corte real",
                  "Veja se a sua nota passa, quanto falta e qual é a demanda do curso — com a fonte de cada número.",
                ],
              ].map(([n, t, d]) => (
                <li key={n} className="flex gap-4">
                  <span className="font-mono text-sm font-bold text-gold-text">
                    {n}
                  </span>
                  <div>
                    <h3 className="font-semibold">{t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-n5">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-7">
              <Link className="gb-button" href="/nota-de-corte">
                Testar a minha nota <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section
        id="caminhos"
        className="gb-section gb-container"
        aria-labelledby="gb-paths"
      >
        <div className="gb-section-intro">
          <div>
            <p className="gb-eyebrow">COMECE POR AQUI</p>
            <h2 id="gb-paths">
              Para onde você
              <br />
              quer ir?
            </h2>
          </div>
          <p>
            O foco é o Vestibulinho — e o acervo completo continua aberto,
            edição a edição, para quem mira mais longe.
          </p>
        </div>
        <div className="gb-path-grid">
          {paths.map((p) => (
            <Link href={p.href} className="gb-path" key={p.n}>
              <div className="gb-path-top">
                <span>{p.n}</span>
                <span aria-hidden="true">↗</span>
              </div>
              <p className="gb-path-tag">{p.tag}</p>
              <h3>{p.name}</h3>
              <p className="gb-path-exams">{p.exams}</p>
              <p>{p.text}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="gb-practice" aria-labelledby="gb-practice-title">
        <div className="gb-container gb-practice-grid">
          <div>
            <p className="gb-eyebrow">ACERVO ETEC · DISPONÍVEL</p>
            <h2 id="gb-practice-title">
              Treine na
              <br />
              <em>prova de verdade.</em>
            </h2>
            <p>
              Nada de questão parecida com a oficial: são os cadernos que já
              caíram, com o gabarito que decidiu as vagas — conferidos um a um.
            </p>
            <Link href="/provas/etec" className="gb-button gb-button-light">
              Abrir o acervo ETEC <span aria-hidden="true">↗</span>
            </Link>
            <p className="gb-practice-limit">
              Os enunciados em texto estão a ser extraídos edição a edição;
              onde ainda não há texto, o PDF oficial acompanha a questão.
            </p>
          </div>
          <ol className="gb-practice-list">
            <li>
              <span>01</span>
              <div>
                <h3>Escolha a edição</h3>
                <p>
                  41 provas oficiais do Vestibulinho, das edições mais antigas
                  à mais recente.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Responda no caderno</h3>
                <p>
                  714 questões já trazem enunciado e alternativas em texto;
                  nas demais, responda pela folha de respostas ao lado do PDF.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Confira pelo gabarito oficial</h3>
                <p>
                  Correção imediata, questão a questão — com as questões
                  anuladas sinalizadas, como na lista oficial.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
      <section
        id="cursinhos"
        className="gb-section gb-container"
        aria-labelledby="gb-b2b-title"
      >
        <div className="gb-section-intro">
          <div>
            <p className="gb-eyebrow">PARA CURSINHOS COMUNITÁRIOS</p>
            <h2 id="gb-b2b-title">
              O painel que o seu
              <br />
              cursinho <em>não tem.</em>
            </h2>
          </div>
          <p>
            Cursinhos populares e comunitários preparam para a ETEC com quadro,
            presença e boa vontade — e sem nenhum dado. O Painel do Cursinho
            cruza a evolução da turma, assunto a assunto, com a meta real dos
            cursos que os alunos vão disputar.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col justify-center">
            <ul className="grid gap-4 text-[15px] leading-relaxed">
              <li>
                <strong>Turma × assunto:</strong> onde a turma acerta e onde
                tropeça, nos assuntos que a prova da ETEC cobra.
              </li>
              <li>
                <strong>Turma × meta:</strong> a distância da turma para o
                corte e a demanda dos cursos-alvo dos alunos — não uma média
                genérica.
              </li>
              <li>
                <strong>Grátis para cursinhos comunitários,</strong> feito
                para funcionar também impresso, em papel, na sala de aula.
              </li>
            </ul>
            <p className="gb-footnote">
              Em construção: as primeiras turmas-piloto vêm a seguir.
            </p>
            <div className="gb-actions">
              <Link className="gb-button" href="/sobre">
                Conhecer o projeto <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <div
            className="rounded-lg border border-n2 bg-[#fffdf7] p-6 sm:p-8"
            role="img"
            aria-label="Prévia conceitual do Painel do Cursinho: assuntos da prova com o desempenho da turma e a meta do curso-alvo"
          >
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-n4">
              Prévia do painel · em construção
            </p>
            {[
              ["Frações e porcentagens", 62, "meta: corte do curso-alvo"],
              ["Geometria plana", 48, "meta: corte do curso-alvo"],
              ["Interpretação de texto", 74, "meta: corte do curso-alvo"],
              ["Ciências — corpo humano", 55, "meta: corte do curso-alvo"],
            ].map(([assunto, pct, meta]) => (
              <div key={assunto as string} className="mt-5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{assunto}</span>
                  <span className="font-mono text-xs text-n4">
                    turma {pct}% · {meta}
                  </span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-n1">
                  <div
                    className="h-2.5 rounded-full bg-gold"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="mt-6 text-xs leading-relaxed text-n4">
              Ilustração do formato do painel, com valores de exemplo. Os dados
              reais virão das provas aplicadas à sua turma.
            </p>
          </div>
        </div>
      </section>
      <section className="gb-section gb-container gb-vision">
        <p className="gb-eyebrow">MÉTRICAS QUE OS CONCORRENTES NÃO TÊM</p>
        <h2>
          Dado oficial,
          <br />
          <em>ou não é dado.</em>
        </h2>
        <div className="gb-vision-grid">
          {[
            [
              "EM IMPLANTAÇÃO NO ACERVO",
              "Selo de Questão Oficial Verificada",
              "Cada questão conferida contra o PDF oficial, com edição, fonte e estado (íntegra ou anulada) — a prova de que você está a treinar na questão certa.",
            ],
            [
              "NO AR · BASE A CRESCER",
              "Corte e demanda por curso",
              "Nota de corte real e demanda oficial por curso, unidade e turno — a base que nenhum concorrente do Vestibulinho publica. Coleta em curso, edição a edição.",
            ],
            [
              "FASE 2 · SOBRE A BASE DE CORTES",
              "Índice de Prontidão",
              "A sua nota projetada contra o corte histórico do seu curso-alvo: pronto, quase lá ou longe — sempre com o número oficial por trás.",
            ],
          ].map(([s, t, d]) => (
            <div key={t}>
              <span className="gb-planned">{s}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="gb-section gb-container gb-faq"
        aria-labelledby="gb-faq-title"
      >
        <div>
          <p className="gb-eyebrow">ANTES DE COMEÇAR</p>
          <h2 id="gb-faq-title">Tudo às claras.</h2>
          <p>O que já existe, o que está a caminho e o que nunca vamos inventar.</p>
        </div>
        <div>
          {faq.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="gb-container">
        <div className="gb-final">
          <span className="gb-eyebrow">COMECE PELA PERGUNTA CERTA</span>
          <h2>Sua nota dá para passar?</h2>
          <Link href="/nota-de-corte" className="gb-button">
            Descobrir agora, grátis <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
