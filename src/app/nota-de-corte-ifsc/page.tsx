import type { Metadata } from "next";
import {
  NotaCorteIfscTool,
  type EdicaoIfsc,
} from "@/components/nota-corte-ifsc-tool";
import { JsonLd } from "@/components/json-ld";
import { jsonLd, metaPagina } from "@/lib/seo";
import dadosJson from "@/data/ifsc-demanda-cortes.json";

export const metadata: Metadata = metaPagina({
  titulo:
    "Minha nota dá para passar no IFSC? Agregado oficial, corte derivado e demanda — Exame de Classificação",
  descricao:
    "Projete seus acertos no Exame de Classificação do IFSC e compare com o agregado oficial de pontuação publicado pelo instituto e com o corte derivado da 1ª chamada, por câmpus, curso, turno e modalidade — com a demanda oficial ao lado. Sem estimativas.",
  caminho: "/nota-de-corte-ifsc",
});

const dados = dadosJson as unknown as { edicoes: EdicaoIfsc[] };

const faq: readonly (readonly string[])[] = [
  [
    "O IFSC publica a nota de corte?",
    "Não publica um número chamado “nota de corte”. O que o IFSC publica é a lista de pontuação máxima e mínima dos aprovados de cada curso — é esse agregado oficial que mostramos como referência final. Além disso, para 2026.1 calculamos o corte derivado da 1ª chamada a partir da Classificação Geral oficial: a menor nota entre os aprovados de cada modalidade. Cada número aparece com o seu rótulo e a sua fonte; nenhum é estimativa.",
  ],
  [
    "Qual é a diferença entre agregado oficial e corte derivado?",
    "O agregado oficial é publicado pelo próprio IFSC e é final: cobre todas as chamadas, por isso a sua mínima é a menor nota de quem acabou aprovado naquele curso. O corte derivado é calculado por nós, só existe para 2026.1 e é de 1ª chamada, por modalidade — mostra onde a convocação começou, que é a referência mais exigente. Dos 44 cursos de 2026.1, 34 passaram nas validações cruzadas contra os documentos oficiais e têm corte derivado; os outros ficam só com o agregado oficial.",
  ],
  [
    "Como é calculada a nota do Exame de Classificação?",
    "Pelo número de acertos, sem pesos nem bônus: quem acerta mais, classifica primeiro, dentro do curso e da modalidade. O formato mudou com o tempo — até 2023.2 eram 20 questões, só de Língua Portuguesa e Matemática; em 2024.1 foram 24 (Linguagens, Matemática e Ciências Humanas); de 2024.2 em diante são 28, sete por área (Língua Portuguesa, Matemática, Geografia e História e Ciências). No empate, o edital desempata pelas questões que a maioria dos candidatos errou no curso e, depois, pela maior idade.",
  ],
  [
    "O que significa um curso “dispensado de prova”?",
    "Quando os inscritos de um curso não passam do número de vagas (candidatos/vaga ≤ 1), o edital manda não realizar prova: todos os inscritos são aprovados automaticamente (item 7.2). Nas 17 edições que compilamos, isso aconteceu com 12 cursos. A ferramenta assinala esses casos em vez de mostrar um “corte” que não existiu.",
  ],
  [
    "Por que seis edições não têm corte nenhum?",
    "Porque o IFSC não publicou a lista de pontuação dessas edições (2019.2, 2020.1, 2022.1, 2022.2, 2023.1 e 2023.2) nas suas páginas oficiais de estatísticas, e sem uma lista oficial com notas não há corte para mostrar nem para derivar. Nessas edições mostramos só a demanda oficial, que existe para as 17 edições. Os semestres de 2020.2 a 2021.2, da pandemia, nem sequer tiveram prova — a seleção foi por outros métodos e eles ficam fora desta ferramenta.",
  ],
  [
    "Todos os cursos do IFSC são por prova?",
    "Não. O Exame de Classificação cobre os cursos técnicos integrados dos editais principais, mas em algumas edições determinados câmpus ofertaram as vagas por sorteio público (por exemplo, em 2026.1: Caçador, Itajaí, Palhoça Bilíngue e São Carlos). Esta ferramenta cobre só os cursos com prova, e a demanda e os cortes são sempre da edição, do câmpus, do curso e do turno escolhidos — nunca emprestados de outra combinação.",
  ],
];

const fmtCv = (n: number) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtInt = (n: number) => n.toLocaleString("pt-BR");

const estadoCortes = (e: EdicaoIfsc) => {
  let oficial = false;
  let derivado = false;
  for (const c of e.cursos) {
    for (const r of c.referencias) {
      if (r.oficial) oficial = true;
      if (r.derivado1a) derivado = true;
    }
  }
  if (derivado) return "Agregado oficial + corte derivado de 1ª chamada";
  if (oficial) return "Agregado oficial publicado";
  return null;
};

export default function NotaDeCorteIfsc() {
  return (
    <main className="gb-container py-10">
      <JsonLd dados={jsonLd.faq(faq)} />
      <p className="gb-eyebrow">FERRAMENTA GRATUITA · IFSC</p>
      <h1 className="gb-page-title">
        Minha nota <mark>dá para passar</mark> no IFSC?
      </h1>
      <div className="mt-5 max-w-2xl text-lg leading-relaxed text-n5">
        <p>
          Escolha a edição, o câmpus, o curso e o turno, projete os seus{" "}
          <strong className="text-ink">acertos</strong> e compare com o{" "}
          <strong className="text-ink">agregado oficial</strong> de pontuação
          publicado pelo IFSC e, em 2026.1, com o{" "}
          <strong className="text-ink">corte derivado</strong> da 1ª chamada
          — sempre com a <strong className="text-ink">demanda oficial</strong>{" "}
          do curso ao lado.
        </p>
        <p className="mt-3">
          O IFSC não publica “nota de corte” — publica a lista de pontuação
          máxima e mínima dos aprovados. Compilamos 17 edições semestrais e
          406 cursos: a demanda existe para todos; os cortes, para as 11
          edições em que há lista oficial com notas. Onde não há, a página
          diz isso em vez de estimar.
        </p>
      </div>

      <div className="mt-8">
        <NotaCorteIfscTool />
      </div>

      <section className="gb-section" aria-labelledby="nci-como">
        <p className="gb-eyebrow">A REGRA DO JOGO</p>
        <h2 id="nci-como" className="gb-section-title mt-3">
          Como a nota e os cortes funcionam de verdade
        </h2>
        <div className="gb-content-grid mt-8">
          <div className="gb-content-card">
            <h3>Nota = número de acertos</h3>
            <p>
              Sem pesos, sem TRI, sem bônus: a classificação é a ordem
              decrescente de acertos, por curso e modalidade. A prova mudou
              de tamanho — 20 questões até 2023.2 (só Português e
              Matemática), 24 em 2024.1 e 28 de 2024.2 em diante, sete por
              área. A ferramenta ajusta a projeção à era da edição
              escolhida.
            </p>
          </div>
          <div className="gb-content-card">
            <h3>Dois números, dois rótulos</h3>
            <p>
              O <strong>agregado oficial</strong> é a lista de pontuação
              máxima e mínima dos aprovados que o próprio IFSC publica —
              final, de todas as chamadas. O <strong>corte derivado</strong>{" "}
              é calculado por nós da Classificação Geral oficial, só para
              2026.1: a menor nota dos aprovados da 1ª chamada, por
              modalidade. Nunca misturamos os dois sem dizer qual é qual.
            </p>
          </div>
          <div className="gb-content-card">
            <h3>Dispensa de prova</h3>
            <p>
              Se os inscritos de um curso não passam das vagas
              (candidatos/vaga ≤ 1), o edital dispensa a prova e aprova
              todos os inscritos automaticamente. Aconteceu com 12 cursos
              nas edições compiladas — a ferramenta assinala a dispensa em
              vez de inventar um corte para um exame que não houve.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="nci-edicoes">
        <p className="gb-eyebrow">AS EDIÇÕES COMPILADAS</p>
        <h2 id="nci-edicoes" className="gb-section-title mt-3">
          Demanda em todas, cortes onde há lista oficial
        </h2>
        <p className="mt-3 max-w-2xl text-n5">
          São 17 edições semestrais do Exame de Classificação (2017.1–2026.2)
          e 406 cursos técnicos integrados. Os cortes cobrem 284 cursos nas
          11 edições com lista oficial de pontuações; nas outras seis, o IFSC
          não publicou a lista e mostramos só a demanda.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-n2">
          <table className="w-full min-w-[760px] border-collapse bg-[#fffdf7] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink font-mono text-[11px] uppercase tracking-wider">
                <th scope="col" className="p-4">Edição</th>
                <th scope="col" className="p-4">Prova</th>
                <th scope="col" className="p-4">Cursos</th>
                <th scope="col" className="p-4">Inscritos (edição)</th>
                <th scope="col" className="p-4">Demanda da edição</th>
                <th scope="col" className="p-4">Cortes</th>
              </tr>
            </thead>
            <tbody>
              {dados.edicoes.map((e) => {
                const estado = estadoCortes(e);
                return (
                  <tr
                    key={e.edicao}
                    className="border-b border-n2 align-top last:border-0"
                  >
                    <td className="p-4 font-semibold">
                      {e.edicao}
                      <span className="block text-xs font-normal text-n4">
                        Edital {e.editais.join(" · ")}
                      </span>
                    </td>
                    <td className="p-4">{e.questoes} questões</td>
                    <td className="p-4">{e.cursos.length}</td>
                    <td className="p-4">
                      {e.inscritosTotais != null
                        ? fmtInt(e.inscritosTotais)
                        : "—"}
                    </td>
                    <td className="p-4">
                      {e.candidatosPorVagaEdicao != null ? (
                        <strong>
                          {fmtCv(e.candidatosPorVagaEdicao)} c/v
                        </strong>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4">
                      {estado ? (
                        <strong className="text-gold-text">{estado} ✓</strong>
                      ) : (
                        <span className="text-n4">
                          lista não publicada — só demanda
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gb-section" aria-labelledby="nci-fontes">
        <div className="gb-faq">
          <div>
            <p className="gb-eyebrow">FONTES E MÉTODO</p>
            <h2 id="nci-fontes" className="gb-section-title mt-3">
              De onde vêm estes números
            </h2>
            <p className="mt-4">
              Demanda: a relação candidato/vaga oficial de cada edição,
              curso a curso (vagas, inscritos e a relação entre eles). Cortes
              oficiais: a lista de pontuação máxima e mínima por curso
              (aprovados) que o IFSC publica nas suas páginas de estatísticas
              do processo seletivo. Corte derivado de 2026.1: agregados
              calculados por nós da Classificação Geral do Certame oficial —
              só contagens, mínima e máxima por modalidade, sem nenhum dado
              individual de candidato (as listas com nomes não ficam
              arquivadas connosco). Arquivamos os documentos oficiais de
              cada edição com o seu hash, porque portais reorganizam-se e
              documentos desaparecem.
            </p>
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
        </div>
      </section>
    </main>
  );
}
