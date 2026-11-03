import type { Metadata } from "next";
import {
  NotaCorteColuniTool,
  type EdicaoColuni,
} from "@/components/nota-corte-coluni-tool";
import { JsonLd } from "@/components/json-ld";
import { jsonLd, metaPagina } from "@/lib/seo";
import dadosJson from "@/data/coluni-demanda-cortes.json";

export const metadata: Metadata = metaPagina({
  titulo:
    "Minha nota dá para passar no COLUNI? Corte derivado e demanda oficiais — UFV",
  descricao:
    "Calcule sua nota do COLUNI pela fórmula oficial de 73 pontos e compare com o corte derivado das listas oficiais de convocados e com a demanda oficial, por modalidade. Sem estimativas: a UFV não publica nota de corte — nós derivamos da lista.",
  caminho: "/nota-de-corte-coluni",
});

type HistoricoBonus = {
  edicao: number;
  escala: number;
  bonusPercentual: number;
  diasProva: number;
  demanda: {
    inscritos: number | null;
    candidatosPorVaga: number | null;
  } | null;
  corte1aChamada: number | null;
  piso: { nota: number; chamada: number } | null;
  fronteiraEspera: number | null;
  esperaDerivavel: boolean;
};

const dados = dadosJson as unknown as {
  edicoes: EdicaoColuni[];
  historicoBonus: HistoricoBonus[];
};
const historico = dados.historicoBonus;

const faq: readonly (readonly string[])[] = [
  [
    "A UFV publica a nota de corte do COLUNI?",
    "Não. A UFV publica as listas de convocados de cada chamada, com as pontuações. O que mostramos é o corte derivado dessas listas: a menor pontuação entre os convocados de cada chamada e modalidade. É um valor calculado de documentos oficiais, não um número divulgado pela universidade — e rotulamos isso sempre.",
  ],
  [
    "Como é calculada a nota do COLUNI (73 pontos)?",
    "Pela fórmula do edital: Língua Portuguesa vale 10 questões × 2 = 20 pontos; Matemática, 10 × 2 = 20; Ciências, 8 × 1 = 8; Inglês, 2 × 1 = 2; Geografia, 4 × 1 = 4; História, 4 × 1 = 4; e a produção textual vale até 15. Total: 73 pontos. Não há TRI nem bônus de escola pública desde 2022 — a reserva de vagas é feita pelas modalidades da Lei de Cotas.",
  ],
  [
    "O que é a fronteira de espera?",
    "É a maior pontuação entre os candidatos que permaneceram na lista de espera de uma modalidade sem serem convocados. Ela mostra onde a convocação parou: entre a fronteira e o piso das chamadas seguintes fica a zona de “quase” — que no COLUNI costuma ser estreita (em 2026, na ampla concorrência, a fronteira foi 60,00 e o corte de 1ª chamada, 60,40).",
  ],
  [
    "Por que as edições de 2016 a 2021 aparecem separadas?",
    "Porque eram outro exame: lista geral única, sem modalidades, com bônus de 15% (2016–2017) ou 20% (2018–2021) para quem fez todo o Ensino Fundamental em escola pública — e as notas publicadas já incluem esse bônus. Em 2016–2017 a prova tinha dois dias e a escala era de 100 pontos. Misturar essas notas com a escala atual de 73 pontos induziria em erro, por isso elas ficam na tabela histórica, com a era assinalada.",
  ],
  [
    "Quantas vagas tem o COLUNI?",
    "150 vagas por edição, todas para a 1ª série do Ensino Médio, numa única escola (o Colégio de Aplicação da UFV, em Viçosa/MG). Não há curso, unidade ou turno para escolher: a concorrência divide-se só pelas modalidades da Lei de Cotas e pela ampla concorrência.",
  ],
];

const fmt = (n: number, casas = 2) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
const fmtCv = (n: number) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const acDe = (e: EdicaoColuni) =>
  e.modalidades.find((m) => m.codigo === "AC" || m.codigo === "9");

export default function NotaDeCorteColuni() {
  return (
    <main className="gb-container py-10">
      <JsonLd dados={jsonLd.faq(faq)} />
      <p className="gb-eyebrow">FERRAMENTA GRATUITA · COLUNI/UFV</p>
      <h1 className="gb-page-title">
        Minha nota <mark>dá para passar</mark> no COLUNI?
      </h1>
      <div className="mt-5 max-w-2xl text-lg leading-relaxed text-n5">
        <p>
          Escolha a edição e a sua modalidade, monte a sua nota pela{" "}
          <strong className="text-ink">fórmula oficial de 73 pontos</strong>{" "}
          e compare com o <strong className="text-ink">corte derivado</strong>{" "}
          das listas oficiais de convocados e com a{" "}
          <strong className="text-ink">demanda oficial</strong> do COLUNI.
        </p>
        <p className="mt-3">
          A UFV não publica “nota de corte” — quem disser o contrário está a
          vender estimativa. Aqui, cada corte é a menor nota entre os
          convocados da lista oficial, com a fonte ligada. Onde a lista não
          existe, a página diz que está em coleta.
        </p>
      </div>

      <div className="mt-8">
        <NotaCorteColuniTool />
      </div>

      <section className="gb-section" aria-labelledby="ncc-como">
        <p className="gb-eyebrow">A REGRA DO JOGO</p>
        <h2 id="ncc-como" className="gb-section-title mt-3">
          Como a nota e o corte funcionam de verdade
        </h2>
        <div className="gb-content-grid mt-8">
          <div className="gb-content-card">
            <h3>73 pontos, fórmula do edital</h3>
            <p>
              Portuguesa e Matemática pesam o dobro (10 questões × 2 cada);
              Ciências vale 8, História e Geografia 4 cada, Inglês 2 — e a
              produção textual completa com até 15 pontos. Sem TRI e sem
              bônus: desde 2022, a reserva é por modalidades da Lei de
              Cotas.
            </p>
          </div>
          <div className="gb-content-card">
            <h3>Corte derivado, não publicado</h3>
            <p>
              A UFV divulga listas de convocados, não cortes. O corte
              derivado de uma chamada é a menor pontuação entre os
              convocados daquela lista — calculado por nós, de agregados,
              sem nenhum dado individual, e sempre com a fonte oficial
              ligada.
            </p>
          </div>
          <div className="gb-content-card">
            <h3>150 vagas, uma só escola</h3>
            <p>
              Não há curso, unidade nem turno: são 150 vagas para a 1ª série
              do Ensino Médio do Colégio de Aplicação, em Viçosa. A
              concorrência divide-se entre ampla concorrência e modalidades
              de reserva — e quem é elegível concorre em várias ao mesmo
              tempo.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="ncc-serie">
        <p className="gb-eyebrow">A SÉRIE RECENTE</p>
        <h2 id="ncc-serie" className="gb-section-title mt-3">
          Ampla concorrência, 2022–2026
        </h2>
        <p className="mt-3 max-w-2xl text-n5">
          Demanda oficial e corte derivado de 1ª chamada da ampla
          concorrência nas edições da era de modalidades. As restantes
          modalidades de cada edição estão na ferramenta acima.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-n2">
          <table className="w-full min-w-[640px] border-collapse bg-[#fffdf7] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink font-mono text-[11px] uppercase tracking-wider">
                <th scope="col" className="p-4">Edição</th>
                <th scope="col" className="p-4">Inscritos</th>
                <th scope="col" className="p-4">Demanda oficial</th>
                <th scope="col" className="p-4">
                  Corte derivado (1ª chamada, AC)
                </th>
                <th scope="col" className="p-4">Piso das chamadas</th>
              </tr>
            </thead>
            <tbody>
              {dados.edicoes.map((e) => {
                const ac = acDe(e);
                return (
                  <tr
                    key={e.edicao}
                    className="border-b border-n2 align-top last:border-0"
                  >
                    <td className="p-4 font-semibold">{e.edicao}</td>
                    <td className="p-4">
                      {e.demanda?.inscritos != null
                        ? e.demanda.inscritos.toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="p-4">
                      {e.demanda?.candidatosPorVaga != null ? (
                        <strong>{fmtCv(e.demanda.candidatosPorVaga)} c/v</strong>
                      ) : (
                        <span className="text-n4">não localizada</span>
                      )}
                    </td>
                    <td className="p-4">
                      {ac?.corte1aChamada != null ? (
                        <strong className="text-gold-text">
                          {fmt(ac.corte1aChamada)} ✓
                        </strong>
                      ) : (
                        <span className="text-n4">Em coleta</span>
                      )}
                    </td>
                    <td className="p-4">
                      {ac?.piso
                        ? `${fmt(ac.piso.nota)} (${ac.piso.chamada}ª chamada)`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gb-section" aria-labelledby="ncc-historico">
        <p className="gb-eyebrow">ERA DO BÔNUS · 2016–2021</p>
        <h2 id="ncc-historico" className="gb-section-title mt-3">
          O exame antigo, na tabela histórica
        </h2>
        <p className="mt-3 max-w-2xl text-n5">
          Até 2021 não havia modalidades: era uma lista geral única, com
          bônus de pontuação para quem fez todo o Ensino Fundamental em
          escola pública — e as notas abaixo <strong>já incluem esse
          bônus</strong>. Em 2016–2017 a prova tinha dois dias e valia 100
          pontos; de 2018 em diante, 73. Por isso estas edições não entram
          no comparador acima.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-n2">
          <table className="w-full min-w-[720px] border-collapse bg-[#fffdf7] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink font-mono text-[11px] uppercase tracking-wider">
                <th scope="col" className="p-4">Edição</th>
                <th scope="col" className="p-4">Escala / bônus</th>
                <th scope="col" className="p-4">Demanda oficial</th>
                <th scope="col" className="p-4">
                  Corte derivado geral (1ª chamada)
                </th>
                <th scope="col" className="p-4">Piso das chamadas</th>
                <th scope="col" className="p-4">Fronteira de espera</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((h) => (
                <tr
                  key={h.edicao}
                  className="border-b border-n2 align-top last:border-0"
                >
                  <td className="p-4 font-semibold">{h.edicao}</td>
                  <td className="p-4">
                    {h.escala} pts · bônus de {h.bonusPercentual}%
                    {h.diasProva === 2 && (
                      <span className="block text-xs text-n4">
                        prova em 2 dias
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {h.demanda?.candidatosPorVaga != null ? (
                      <>
                        <strong>{fmtCv(h.demanda.candidatosPorVaga)} c/v</strong>
                        {h.demanda.inscritos != null && (
                          <span className="block text-xs text-n4">
                            {h.demanda.inscritos.toLocaleString("pt-BR")}{" "}
                            inscritos
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-n4">
                        documento não localizado
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {h.corte1aChamada != null ? (
                      <strong className="text-gold-text">
                        {fmt(h.corte1aChamada)} ✓
                      </strong>
                    ) : (
                      <span className="text-n4">Em coleta</span>
                    )}
                  </td>
                  <td className="p-4">
                    {h.piso
                      ? `${fmt(h.piso.nota)} (${h.piso.chamada}ª chamada)`
                      : "—"}
                  </td>
                  <td className="p-4">
                    {h.fronteiraEspera != null ? (
                      fmt(h.fronteiraEspera)
                    ) : h.esperaDerivavel ? (
                      "—"
                    ) : (
                      <span className="text-n4">
                        lista de espera não localizada
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gb-section" aria-labelledby="ncc-fontes">
        <div className="gb-faq">
          <div>
            <p className="gb-eyebrow">FONTES E MÉTODO</p>
            <h2 id="ncc-fontes" className="gb-section-title mt-3">
              De onde vêm estes números
            </h2>
            <p className="mt-4">
              Demanda: relatórios oficiais candidato/vaga publicados pela
              UFV para cada edição (150 vagas em todas). Cortes: derivados
              por nós das listas oficiais de convocados e de espera de cada
              chamada — só agregados (menor e maior pontuação por chamada e
              modalidade), sem nenhum dado individual de candidato. Arquivamos
              os documentos oficiais de cada edição enquanto estão
              publicados, porque portais reorganizam-se e documentos
              desaparecem — foi assim que se perderam listas antigas de
              outros exames.
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
