import Link from "next/link";
import { QuestaoDemo } from "@/components/questao-demo";
import { MapaHabilidades } from "@/components/mapa-habilidades";
import { Badge, CONTAINER, CtaCadastro, FotoUniversidade } from "@/components/ui";
import { PROVAS } from "@/data/provas";
import { DISCIPLINAS } from "@/data/disciplinas";
import { UNIVERSIDADES } from "@/data/universidades";
import { MATRIZ_ENEM } from "@/data/enem-matriz";

const totalHabilidades = Object.values(MATRIZ_ENEM).reduce((n, a) => n + a.habilidades.length, 0);

const PASSOS = [
  ["Diagnóstico", "Você resolve questões e o Gabaru descobre onde está cada habilidade."],
  ["Mapa de habilidades", "Cada questão do banco carrega a habilidade da Matriz do ENEM. O seu mapa mostra o que está dominado e o que não está."],
  ["Plano de estudo", "O plano vira uma fila curta: só o que falta, na ordem certa, com revisão do que você já errou."],
  ["Treino e revisão", "Cada erro vem com a explicação do porquê. O que você errou volta no momento de revisar."],
];

const FAQ = [
  ["O Gabaru serve só para o ENEM?", "Não. O ENEM é a espinha dorsal, porque a Matriz de Referência organiza o estudo por habilidade. Mas o mesmo mapa serve para FUVEST, UNICAMP, UNESP, vestibulinhos, ITA, IME e militares, cada prova com a sua estrutura."],
  ["Quais disciplinas estão disponíveis agora?", "Matemática e Física. Português, Redação, Química, Biologia, História, Geografia, Inglês, Filosofia e Sociologia já têm lugar na plataforma e entram em seguida."],
  ["Preciso de cadastro para testar?", "Não. A primeira questão é aberta. O cadastro serve para guardar o seu progresso e montar o seu plano."],
  ["O que é a Matriz de Referência do ENEM?", "É o documento do INEP que lista as competências e habilidades cobradas em cada área da prova. São 30 habilidades por área, 120 no total."],
];

export default function Home() {
  const paulistas = PROVAS.filter((p) => p.categoria !== "concurso");
  return (
    <main>
      <section className={`${CONTAINER} grid gap-10 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center`}>
        <div>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            A gente estuda junto até você <mark>gabaritar</mark>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-n5">
            Banco de questões, plano de estudo e um mapa das {totalHabilidades} habilidades do ENEM. Você estuda só o que precisa.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#questao" className="inline-flex min-h-12 items-center rounded-md bg-rosa px-6 font-semibold text-white hover:opacity-90">
              Fazer a primeira questão
            </a>
            <span className="text-sm text-n4">Sem cadastro para começar.</span>
          </div>
        </div>
        <MapaHabilidades />
      </section>

      <section className={`${CONTAINER} pt-14`} aria-labelledby="provas">
        <h2 id="provas" className="font-mono text-xs font-bold uppercase tracking-wider text-n4">Qual é a sua prova?</h2>
        <ul className="mt-4 flex flex-wrap gap-2" role="list">
          {paulistas.map((p) => (
            <li key={p.slug}>
              <Link href={`/provas/${p.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-ink px-4 font-mono text-sm font-semibold hover:bg-ink hover:text-paper">
                {p.nome}
              </Link>
            </li>
          ))}
          <li><Link href="/enem" className="inline-flex min-h-11 items-center rounded-full border border-ink px-4 font-mono text-sm font-semibold hover:bg-ink hover:text-paper">ENEM</Link></li>
          <li><Link href="/concursos" className="inline-flex min-h-11 items-center rounded-full border border-ink px-4 font-mono text-sm font-semibold hover:bg-ink hover:text-paper">Concursos</Link></li>
        </ul>
      </section>

      <section id="questao" className={`${CONTAINER} scroll-mt-28 pt-14`}>
        <QuestaoDemo />
      </section>

      <section className={`${CONTAINER} pt-24`} aria-labelledby="enem">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-n4">Referência no ENEM</p>
        <h2 id="enem" className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
          Estudar tudo é o que o cursinho faz. A gente mostra o que <mark>falta</mark>.
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-mono text-5xl font-bold">{totalHabilidades}</p>
            <p className="mt-2 font-semibold">habilidades da Matriz do INEP</p>
            <p className="mt-1 text-n5">Trinta por área. Cada questão do nosso banco é marcada com a sua habilidade.</p>
          </div>
          <div>
            <p className="font-mono text-5xl font-bold">4</p>
            <p className="mt-2 font-semibold">áreas, um mapa só seu</p>
            <p className="mt-1 text-n5">Na área do aluno você vê, habilidade por habilidade, o quanto já domina, calculado a partir das suas respostas.</p>
          </div>
          <div>
            <p className="font-mono text-5xl font-bold">5</p>
            <p className="mt-2 font-semibold">eixos cognitivos, todos treinados</p>
            <p className="mt-1 text-n5">O plano de estudo tira da fila o que está dominado e põe na frente o que mais pesa na sua prova.</p>
          </div>
        </div>
        <div className="mt-8"><Link href="/enem" className="font-semibold underline">Ver a Matriz de Referência completa</Link></div>
      </section>

      <section className={`${CONTAINER} pt-24`} aria-labelledby="como">
        <h2 id="como" className="text-3xl font-bold sm:text-4xl">Como o Gabaru funciona</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-4" role="list">
          {PASSOS.map(([t, d], i) => (
            <li key={t} className="rounded-lg border border-n2 bg-white/60 p-5">
              <span className="grid size-10 place-items-center rounded-full border-2 border-ink font-mono font-bold">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm text-n5">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${CONTAINER} pt-24`} aria-labelledby="disciplinas">
        <h2 id="disciplinas" className="text-3xl font-bold sm:text-4xl">Disciplinas</h2>
        <p className="mt-3 max-w-2xl text-n5">Abrimos com Matemática e Física. As outras já estão na estrutura e entram em seguida.</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {DISCIPLINAS.filter((d) => d.status === "ativo" || ["portugues", "redacao", "quimica", "biologia", "historia", "geografia"].includes(d.slug)).map((d) => (
            <li key={d.slug}>
              <Link href={`/disciplinas/${d.slug}`} className="flex h-full min-h-28 flex-col justify-between rounded-lg border border-n2 bg-white/60 p-4 hover:border-ink">
                <span className="text-lg font-bold">{d.nome}</span>
                <span className="mt-3"><Badge status={d.status} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${CONTAINER} pt-24`} aria-labelledby="universidades">
        <h2 id="universidades" className="text-3xl font-bold sm:text-4xl">Para chegar lá</h2>
        <p className="mt-3 max-w-2xl text-n5">Cada prova tem a sua estrutura. Do ensino técnico às universidades públicas, o plano parte da prova que você escolheu.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {UNIVERSIDADES.map((u) => <FotoUniversidade key={u.slug} {...u} />)}
        </div>
      </section>

      <section className={`${CONTAINER} pt-24`} aria-labelledby="promessa">
        <h2 id="promessa" className="text-3xl font-bold sm:text-4xl">O que a gente promete</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3" role="list">
          <li><h3 className="text-lg font-bold">Estudar só o que precisa</h3><p className="mt-2 text-n5">O plano nasce do seu mapa de habilidades, não de uma grade igual para todo mundo.</p></li>
          <li><h3 className="text-lg font-bold">O erro também ensina</h3><p className="mt-2 text-n5">Cada alternativa errada vem com o motivo. Quem errou entende por que errou.</p></li>
          <li><h3 className="text-lg font-bold">Os seus dados, não o nosso marketing</h3><p className="mt-2 text-n5">Você vê a sua evolução em números reais. Sem promessa de resultado que a gente não consiga mostrar.</p></li>
        </ul>
      </section>

      <section className={`${CONTAINER} pt-24`} aria-labelledby="faq">
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

      <section className={`${CONTAINER} pt-24`}>
        <div className="rounded-lg bg-ink p-8 text-paper sm:p-12">
          <h2 className="max-w-xl text-3xl font-bold">Crie sua conta e guarde o seu mapa.</h2>
          <p className="mt-3 max-w-xl opacity-80">O primeiro diagnóstico leva poucos minutos.</p>
          <div className="mt-6"><CtaCadastro /></div>
        </div>
      </section>
    </main>
  );
}
