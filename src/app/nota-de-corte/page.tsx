import type { Metadata } from "next";
import { NotaCorteTool, type Combinacao } from "@/components/nota-corte-tool";
import { JsonLd } from "@/components/json-ld";
import { jsonLd, metaPagina } from "@/lib/seo";
import dadosJson from "@/data/etec-demanda-cortes.json";

export const metadata: Metadata = metaPagina({
  titulo: "Minha nota dá para passar? Nota de corte e demanda do Vestibulinho ETEC",
  descricao:
    "Calcule sua nota final do Vestibulinho com a pontuação acrescida e compare com a nota de corte real e a demanda oficial por curso, unidade e turno da ETEC. Sem estimativas: corte só de lista oficial.",
  caminho: "/nota-de-corte",
});

const combinacoes = (
  dadosJson as unknown as { combinacoes: Combinacao[] }
).combinacoes;

const faq: readonly (readonly string[])[] = [
  [
    "Existe nota mínima para passar no Vestibulinho da ETEC?",
    "Não. O Vestibulinho não usa TRI nem tem nota mínima: a classificação é um ranking por curso, unidade e turno. Entra quem ficar dentro do número de vagas, na ordem da nota final.",
  ],
  [
    "Como é calculada a nota final do Vestibulinho?",
    "A prova tem 50 questões. A nota final é NF = acertos × (1 + 3% + 10%): soma-se 3% para candidatos autodeclarados afrodescendentes e 10% para quem cursou todo o Ensino Fundamental II em escola pública, quando aplicável.",
  ],
  [
    "De onde vem a nota de corte mostrada nesta página?",
    "Da lista de classificação oficial de cada unidade: o corte de 1ª chamada é a nota final do classificado na posição igual ao número de vagas. Só publicamos corte quando lemos esse valor numa lista oficial; nas demais combinações, mostramos a demanda oficial e o estado “em coleta”.",
  ],
  [
    "Por que alguns cursos aparecem como “nota de corte em coleta”?",
    "Porque o Centro Paula Souza divulga as listas por edição e depois as retira do site oficial. Estamos a recuperar e a arquivar essas listas, edição a edição. Enquanto a de um curso não é lida, preferimos dizer “em coleta” a publicar uma estimativa disfarçada.",
  ],
];

const fmt = (n: number, casas = 2) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
const fmtCv = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export default function NotaDeCorte() {
  return (
    <main className="gb-container py-10">
      <JsonLd dados={jsonLd.faq(faq)} />
      <p className="gb-eyebrow">FERRAMENTA GRATUITA · VESTIBULINHO ETEC</p>
      <h1 className="gb-page-title">
        Minha nota <mark>dá para passar?</mark>
      </h1>
      <div className="mt-5 max-w-2xl text-lg leading-relaxed text-n5">
        <p>
          Escolha o curso, a unidade e o turno que você quer, diga quantas
          questões pretende acertar e veja a sua nota final com a pontuação
          acrescida — comparada com a <strong className="text-ink">nota de
          corte real</strong> e com a <strong className="text-ink">demanda
          oficial</strong> daquele curso.
        </p>
        <p className="mt-3">
          Aqui, corte sem lista oficial não entra: onde ainda estamos a
          coletar, a página diz “em coleta”. Número inventado não ajuda
          ninguém a passar.
        </p>
      </div>

      <div className="mt-8">
        <NotaCorteTool />
      </div>

      <section className="gb-section" aria-labelledby="nc-como">
        <p className="gb-eyebrow">A REGRA DO JOGO</p>
        <h2 id="nc-como" className="gb-section-title mt-3">
          Como o corte funciona de verdade
        </h2>
        <div className="gb-content-grid mt-8">
          <div className="gb-content-card">
            <h3>Sem nota mínima, sem TRI</h3>
            <p>
              São 50 questões de múltipla escolha. Ninguém é eliminado por
              “não atingir o mínimo”: a classificação é um ranking dentro de
              cada curso, unidade e turno.
            </p>
          </div>
          <div className="gb-content-card">
            <h3>Nota final com bônus</h3>
            <p>
              NF = acertos × (1 + 3% + 10%). Os acréscimos são a Pontuação
              Acrescida: +3% para autodeclarados afrodescendentes e +10% para
              quem fez todo o Ensino Fundamental II em escola pública.
            </p>
          </div>
          <div className="gb-content-card">
            <h3>Corte = último convocado</h3>
            <p>
              A nota de corte de 1ª chamada é a nota final de quem ocupou a
              última vaga na lista de classificação. Ela muda a cada edição —
              por isso mostramos sempre a edição de cada número.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="nc-tabela">
        <p className="gb-eyebrow">A BASE, ABERTA</p>
        <h2 id="nc-tabela" className="gb-section-title mt-3">
          Combinações acompanhadas ({combinacoes.length})
        </h2>
        <p className="mt-3 max-w-2xl text-n5">
          Demanda oficial mais recente por combinação e o estado da coleta da
          nota de corte. A base cresce a cada edição — e, a partir de agora,
          arquivamos as listas enquanto estão publicadas.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-n2">
          <table className="w-full min-w-[760px] border-collapse bg-[#fffdf7] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink font-mono text-[11px] uppercase tracking-wider">
                <th scope="col" className="p-4">Unidade</th>
                <th scope="col" className="p-4">Curso</th>
                <th scope="col" className="p-4">Turno</th>
                <th scope="col" className="p-4">Demanda oficial</th>
                <th scope="col" className="p-4">Nota de corte (1ª chamada)</th>
              </tr>
            </thead>
            <tbody>
              {combinacoes.map((c) => {
                const d = c.demanda[0];
                return (
                  <tr
                    key={`${c.unidade}|${c.curso}|${c.turno}`}
                    className="border-b border-n2 align-top last:border-0"
                  >
                    <td className="p-4 font-semibold">
                      {c.unidade}
                      {c.municipio && (
                        <span className="block text-xs font-normal text-n4">
                          {c.municipio}
                        </span>
                      )}
                    </td>
                    <td className="p-4">{c.curso}</td>
                    <td className="p-4">{c.turno || "—"}</td>
                    <td className="p-4">
                      {d?.demandaCv != null ? (
                        <>
                          <strong>{fmtCv(d.demandaCv)} c/v</strong>
                          <span className="block text-xs text-n4">
                            edição {d.edicao.replace(".", "/")}
                            {d.vagas != null && ` · ${d.vagas} vagas`}
                          </span>
                        </>
                      ) : (
                        <span className="text-n4">não publicada</span>
                      )}
                    </td>
                    <td className="p-4">
                      {c.corte ? (
                        <>
                          <strong className="text-gold-text">
                            {fmt(c.corte.notaCorte)} ✓
                          </strong>
                          <span className="block text-xs text-n4">
                            lista oficial de {c.corte.edicao.replace(".", "/")}
                          </span>
                        </>
                      ) : c.listaRecuperada ? (
                        <>
                          <span className="font-semibold">Em coleta</span>
                          <span className="block text-xs text-n4">
                            lista de {c.listaRecuperada.edicao.replace(".", "/")}{" "}
                            já recuperada
                          </span>
                        </>
                      ) : (
                        <span className="text-n4">Em coleta</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gb-section" aria-labelledby="nc-fontes">
        <div className="gb-faq">
          <div>
            <p className="gb-eyebrow">FONTES E MÉTODO</p>
            <h2 id="nc-fontes" className="gb-section-title mt-3">
              De onde vêm estes números
            </h2>
            <p className="mt-4">
              Demanda: publicações oficiais do Centro Paula Souza e da
              Fundação FAT (organizadora do exame), por edição. Corte: listas
              de classificação oficiais das unidades — documentos que o CPS
              divulga a cada edição e depois retira do site; trabalhamos com as
              cópias preservadas no arquivo público da web e passamos a
              arquivar cada edição enquanto ela está publicada.
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
