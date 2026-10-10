import type { Metadata } from "next";
import Link from "next/link";
import { CONTAINER, CartaoLogo, CtaCadastro, Eyebrow, FotoUniversidade, GarantiaSeteDias } from "@/components/ui";
import { provasDa } from "@/data/provas";
import { UNIVERSIDADES } from "@/data/universidades";
import { OFERTA_VESTIBULINHO, valoresOferta } from "@/data/banco";
import { EM_CONSTRUCAO } from "@/lib/construcao";

export const metadata: Metadata = {
  title: "Pré-vestibulinho: ETEC, Coluni, Embraer e Institutos Federais",
  description: "Prepare-se para os vestibulinhos de ensino técnico e médio técnico com questões oficiais e cronograma individualizado. Oferta para as primeiras vagas.",
};

const PASSOS = [
  ["Escolha a sua prova", "ETEC, Coluni, Embraer ou Institutos Federais. Cada uma tem a sua estrutura."],
  ["Faça o diagnóstico", "Um teste curto mostra o que você já domina em Português e Matemática."],
  ["Estude no seu ritmo", "O cronograma considera a sua data de prova e o tempo que você tem por dia."],
];

const FAQ = [
  ["Quando as vendas abrem?", "Quando o site sair da fase de construção. Quem criar a conta agora é avisado primeiro."],
  ["Quais formas de pagamento?", "Pix, cartão e boleto, conforme forem ativados no lançamento. Não cobramos nada antes de a compra estar disponível."],
  ["A oferta vale para quem?", `Para as primeiras ${OFERTA_VESTIBULINHO.vagas} alunas e alunos. Depois, o valor volta ao preço cheio.`],
];

export default function PreVestibulinho() {
  const vestibulares = UNIVERSIDADES.filter((u) => u.slug !== "federal");
  const v = valoresOferta();
  const cta = EM_CONSTRUCAO ? "Quero ser avisado da oferta" : "Garantir uma das primeiras vagas";

  return (
    <main>
      <section className={`${CONTAINER} pt-6 sm:pt-10`}>
        <div className="grid grid-cols-1 gap-10 rounded-2xl bg-ink p-6 text-paper sm:p-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <Eyebrow claro>Pré-vestibulinho</Eyebrow>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
              O primeiro degrau, <span className="text-gold">bem feito</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg opacity-85">
              Português e Matemática são a base dos vestibulinhos. Questões oficiais e um cronograma pensado para quem está terminando o ensino fundamental.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaCadastro texto={cta} />
              <a href="#oferta" className="inline-flex min-h-12 items-center rounded-md border border-paper/40 px-6 font-semibold text-paper hover:bg-paper/10">Ver a oferta</a>
            </div>
          </div>
          <CartaoLogo src="/universidades/cps.png" alt="Logo do Centro Paula Souza" legenda="Centro Paula Souza · Etecs e Fatecs" />
        </div>
      </section>

      <section id="oferta" className={`${CONTAINER} scroll-mt-28 pt-16`} aria-labelledby="oferta-titulo">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col justify-center rounded-2xl bg-gold p-7 text-ink sm:p-10">
            <Eyebrow>Oferta de lançamento</Eyebrow>
            <h2 id="oferta-titulo" className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              {OFERTA_VESTIBULINHO.descontoPrimeiros}% de desconto para as primeiras {OFERTA_VESTIBULINHO.vagas} vagas.
            </h2>
            <p className="mt-4 max-w-md text-lg">Depois dessas vagas, o valor volta ao preço cheio. O desconto é só para quem entra na primeira leva.</p>
          </div>

          <div className="rounded-2xl border border-n2 bg-white/70 p-7 sm:p-10">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-n4">Primeiras vagas</p>
            <p className="mt-3 font-mono text-5xl font-bold tracking-tight">
              {v.parcelas}x de <span className="text-anil">R$ {v.parcelaOferta}</span>
            </p>
            <p className="mt-2 text-sm text-n4">Preço cheio: {v.parcelas}x de R$ {v.parcelaCheia}</p>

            <div className="mt-6 grid gap-3 border-t border-n2 pt-6 sm:grid-cols-2">
              <div className="rounded-xl bg-paper p-4">
                <p className="text-sm font-semibold">À vista no Pix</p>
                <p className="mt-1 font-mono text-2xl font-bold">R$ {v.pixOferta}</p>
                <p className="text-xs text-n4">{v.descontoPix}% de desconto sobre o total</p>
              </div>
              <div className="rounded-xl bg-paper p-4">
                <p className="text-sm font-semibold">No cartão e boleto</p>
                <p className="mt-1 font-mono text-2xl font-bold">{v.parcelas}x R$ {v.parcelaOferta}</p>
                <p className="text-xs text-n4">Formas de pagamento ativadas no lançamento</p>
              </div>
            </div>

            <ul className="mt-6 grid gap-2 text-sm text-n5" role="list">
              <li className="flex gap-2"><span aria-hidden="true" className="text-anil">✓</span>Questões oficiais das provas de vestibulinho</li>
              <li className="flex gap-2"><span aria-hidden="true" className="text-anil">✓</span>Cronograma de estudo individualizado</li>
              <li className="flex gap-2"><span aria-hidden="true" className="text-anil">✓</span>Revisão automática dos erros</li>
            </ul>
            <div className="mt-6"><CtaCadastro texto={cta} /></div>
            <div className="mt-6"><GarantiaSeteDias /></div>
          </div>
        </div>
      </section>

      <section className={`${CONTAINER} pt-16`} aria-labelledby="provas">
        <Eyebrow>Escolha a sua prova</Eyebrow>
        <h2 id="provas" className="mt-3 text-3xl font-bold sm:text-4xl">Vestibulinhos</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2" role="list">
          {provasDa("vestibulinho").map((p) => (
            <li key={p.slug}>
              <Link href={`/provas/${p.slug}`} className="group flex h-full flex-col rounded-xl border border-n2 bg-white/60 p-6 transition hover:border-ink hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-2xl font-bold">{p.nome}</span>
                  {p.confirmar && (
                    <span className="shrink-0 rounded border border-n3 px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-n4">Edital em mapeamento</span>
                  )}
                </div>
                <span className="mt-1 text-sm text-n4">{p.completo}</span>
                <span className="mt-3 text-n5">{p.resumo}</span>
                <span className="mt-auto pt-5 text-sm font-semibold text-ink group-hover:underline">Ver a prova →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${CONTAINER} pt-16`} aria-labelledby="como">
        <Eyebrow>Como funciona</Eyebrow>
        <h2 id="como" className="mt-3 text-3xl font-bold sm:text-4xl">Três passos até o dia da prova.</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3" role="list">
          {PASSOS.map(([t, d], i) => (
            <li key={t} className="rounded-xl border border-n2 bg-white/60 p-6">
              <span className="grid size-10 place-items-center rounded-full bg-ink font-mono font-bold text-gold">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-n5">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${CONTAINER} pt-16`} aria-labelledby="depois">
        <Eyebrow>Depois do vestibulinho</Eyebrow>
        <h2 id="depois" className="mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">Das Etecs às universidades paulistas.</h2>
        <p className="mt-3 max-w-2xl text-n5">Quem começa pelo vestibulinho pode seguir para o vestibular. O banco é o mesmo, com a estrutura de cada prova.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {vestibulares.map((u) => <FotoUniversidade key={u.slug} {...u} />)}
        </div>
      </section>

      <section className={`${CONTAINER} pt-16 pb-4`} aria-labelledby="faq-vest">
        <h2 id="faq-vest" className="text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
        <div className="mt-8 max-w-3xl divide-y divide-n2 border-y border-n2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-lg font-semibold">{q}<span className="font-mono group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="mt-2 text-n5">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
