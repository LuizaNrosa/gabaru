import Link from "next/link";
import { MapaHabilidades } from "@/components/mapa-habilidades";
import { CONTAINER, CartaoLogo, CtaCadastro, CtaSecundario, Eyebrow, FotoUniversidade } from "@/components/ui";
import { DISCIPLINAS } from "@/data/disciplinas";
import { UNIVERSIDADES } from "@/data/universidades";
import { MATRIZ_ENEM } from "@/data/enem-matriz";
import { BANCO, PLANOS, mil } from "@/data/banco";
import { EM_CONSTRUCAO } from "@/lib/construcao";

const totalHabilidades = Object.values(MATRIZ_ENEM).reduce((n, a) => n + a.habilidades.length, 0);

const NUMEROS = [
  { valor: mil(BANCO.oficiais), texto: "questões oficiais resolvidas" },
  { valor: mil(BANCO.internacionais), texto: "internacionais para ITA, IME e militares" },
  { valor: mil(BANCO.passoAPasso), texto: "resolvidas passo a passo" },
  { valor: "1 a 1", texto: "cronograma de estudo feito para você" },
];

const PASSOS = [
  ["Diagnóstico", "Um teste curto mostra onde estão as suas lacunas, por disciplina e habilidade."],
  ["Cronograma individual", "O plano considera a sua data de prova, o seu tempo disponível e o seu ponto de partida."],
  ["Questões oficiais", "Você treina com o que já caiu na sua prova, com gabarito e a habilidade de cada questão."],
  ["Passo a passo e revisão", "As questões difíceis vêm resolvidas em etapas. O que você errou volta na hora certa."],
];

const FAQ = [
  ["O Gabaru serve só para o ENEM?", "Não. O ENEM é a espinha dorsal, porque a Matriz de Referência organiza o estudo por habilidade. O mesmo banco atende FUVEST, UNICAMP, UNESP, vestibulinhos, ITA, IME e militares, cada prova com a sua estrutura."],
  ["Quanto custa?", `Plano Básico: ${PLANOS[0].parcelas} parcelas de ${PLANOS[0].valorParcela}. Plano Elite: ${PLANOS[1].parcelas} parcelas de ${PLANOS[1].valorParcela}, com ${PLANOS[1].aulas} aulas. Veja os detalhes na página de planos.`],
  ["Quais disciplinas estão disponíveis agora?", "Matemática e Física. Português, Redação, Química, Biologia, História, Geografia, Inglês, Filosofia e Sociologia já têm lugar na plataforma e entram em seguida."],
  ["O que é a Matriz de Referência do ENEM?", "É o documento do INEP que lista as competências e habilidades cobradas em cada área da prova. São 30 habilidades por área, 120 no total."],
];

export default function Home() {
  return (
    <main>
      <section className={`${CONTAINER} pt-6 sm:pt-10`}>
        <div className="grid grid-cols-1 gap-10 rounded-2xl bg-ink p-6 text-paper sm:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <Eyebrow claro>{EM_CONSTRUCAO ? "Em construção" : "Preparação para aprovação"}</Eyebrow>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.06] tracking-tight sm:text-6xl">
              Resolva o que cai na <span className="text-gold">sua prova</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg opacity-85">
              O maior banco de questões oficiais resolvidas entre os cursinhos online e presenciais, com um cronograma feito para você.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaCadastro texto={EM_CONSTRUCAO ? "Quero ser avisado" : "Começar agora"} />
              <CtaSecundario href="/planos">Ver planos</CtaSecundario>
            </div>
          </div>
          <dl className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
            {NUMEROS.map((n) => (
              <div key={n.texto} className="min-w-0 rounded-xl bg-paper p-4 text-ink shadow-md sm:p-5">
                <dt className="sr-only">{n.texto}</dt>
                <dd className="whitespace-nowrap font-mono text-2xl font-bold text-ink sm:text-4xl lg:text-5xl">{n.valor}</dd>
                <dd className="mt-2 text-sm text-n5">{n.texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${CONTAINER} pt-20`} aria-labelledby="universidades">
        <Eyebrow>Para onde você quer ir</Eyebrow>
        <h2 id="universidades" className="mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
          Cada prova tem a sua estrutura. O plano parte da sua.
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {UNIVERSIDADES.filter((u) => u.slug !== "federal").map((u) => <FotoUniversidade key={u.slug} {...u} />)}
        </div>
      </section>

      <section className={`${CONTAINER} pt-20`} aria-labelledby="como">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <Eyebrow>Cronograma individual</Eyebrow>
            <h2 id="como" className="mt-3 text-3xl font-bold sm:text-4xl">Um caminho só seu até a aprovação.</h2>
            <ol className="mt-8 grid gap-5" role="list">
              {PASSOS.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink font-mono font-bold text-gold">{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-bold">{t}</h3>
                    <p className="mt-1 text-n5">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="min-w-0 rounded-2xl border border-n2 bg-white/60 p-6 sm:p-8">
            <MapaHabilidades />
            <p className="mt-6 text-sm text-n5">
              O mapa mostra as {totalHabilidades} habilidades da Matriz do ENEM. Cada questão do banco é marcada com a sua, e o plano põe na frente o que ainda falta.
            </p>
          </div>
        </div>
      </section>

      <section className={`${CONTAINER} pt-20`} aria-labelledby="banco">
        <div className="rounded-2xl bg-gold-soft p-6 sm:p-12">
          <Eyebrow>Banco de questões</Eyebrow>
          <h2 id="banco" className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
            Questões oficiais, organizadas por disciplina e habilidade.
          </h2>
          <p className="mt-4 max-w-2xl text-n5">Hoje já estão organizadas <strong className="text-ink">2.127 questões oficiais do ENEM</strong>, cada uma com a sua disciplina, subtópico e habilidade da Matriz.</p>
          <ul className="mt-8 grid gap-6 md:grid-cols-3" role="list">
            <li className="rounded-xl bg-paper p-6">
              <p className="font-mono text-3xl font-bold">{mil(BANCO.oficiais)}</p>
              <p className="mt-2 font-semibold">questões oficiais</p>
              <p className="mt-1 text-sm text-n5">De ENEM, FUVEST, UNICAMP, UNESP, vestibulinhos e concursos.</p>
            </li>
            <li className="rounded-xl bg-paper p-6">
              <p className="font-mono text-3xl font-bold">{mil(BANCO.internacionais)}</p>
              <p className="mt-2 font-semibold">questões internacionais</p>
              <p className="mt-1 text-sm text-n5">Para ITA, IME e vestibulares militares.</p>
            </li>
            <li className="rounded-xl bg-paper p-6">
              <p className="font-mono text-3xl font-bold">{mil(BANCO.passoAPasso)}</p>
              <p className="mt-2 font-semibold">resolvidas passo a passo</p>
              <p className="mt-1 text-sm text-n5">Você vê o raciocínio inteiro, não só a letra certa.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className={`${CONTAINER} pt-20`} aria-labelledby="disciplinas">
        <Eyebrow>Disciplinas</Eyebrow>
        <h2 id="disciplinas" className="mt-3 text-3xl font-bold sm:text-4xl">Abrimos com Matemática e Física.</h2>
        <p className="mt-3 max-w-2xl text-n5">As outras disciplinas já estão na estrutura e entram em seguida.</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {DISCIPLINAS.filter((d) => d.status === "ativo" || ["portugues", "redacao", "quimica", "biologia", "historia", "geografia"].includes(d.slug)).map((d) => (
            <li key={d.slug}>
              <Link href={`/disciplinas/${d.slug}`} className="flex h-full min-h-28 flex-col justify-between rounded-xl border border-n2 bg-white/60 p-4 transition hover:border-ink">
                <span className="text-lg font-bold">{d.nome}</span>
                <span className="mt-3 text-sm font-semibold text-n4">
                  {d.status === "ativo" ? "Disponível" : "Em breve"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${CONTAINER} pt-20`} aria-labelledby="promessa">
        <Eyebrow>Nosso compromisso</Eyebrow>
        <h2 id="promessa" className="mt-3 text-3xl font-bold sm:text-4xl">Foco na aprovação, não no tamanho da grade.</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3" role="list">
          <li><h3 className="text-lg font-bold">Questão que cai na prova</h3><p className="mt-2 text-n5">Treino com o que já foi cobrado, não com exercício genérico.</p></li>
          <li><h3 className="text-lg font-bold">O erro também ensina</h3><p className="mt-2 text-n5">Cada alternativa errada vem com o motivo. Quem errou entende por que errou.</p></li>
          <li><h3 className="text-lg font-bold">Seus números, não promessas</h3><p className="mt-2 text-n5">Você acompanha a sua evolução real, habilidade por habilidade.</p></li>
        </ul>
      </section>

      <section className={`${CONTAINER} pt-20`} aria-labelledby="faq">
        <h2 id="faq" className="text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
        <div className="mt-8 max-w-3xl divide-y divide-n2 border-y border-n2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-lg font-semibold">{q}<span className="font-mono group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="mt-2 text-n5">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={`${CONTAINER} pb-4 pt-20`}>
        <div className="rounded-2xl bg-ink p-8 text-paper sm:p-12">
          <h2 className="max-w-xl text-3xl font-bold">Comece pela questão que cai na sua prova.</h2>
          <p className="mt-3 max-w-xl opacity-85">Crie a sua conta e monte o seu cronograma em poucos minutos.</p>
          <div className="mt-6"><CtaCadastro texto="Criar conta" /></div>
        </div>
      </section>
    </main>
  );
}
