import Link from "next/link";
import { Wordmark } from "@/components/logo";
import { CATEGORIAS } from "@/data/provas";
import { DISCIPLINAS } from "@/data/disciplinas";

export function SiteFooter() {
  const col = "grid gap-1";
  const link = "flex min-h-9 items-center text-sm text-n5 hover:text-ink hover:underline";
  return (
    <footer className="mt-24 border-t border-n2 bg-n1">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark className="h-auto w-28 text-ink" />
          <p className="mt-4 max-w-xs text-sm text-n5">
            Preparação para vestibulinhos, vestibulares, ENEM e concursos. Você estuda só o que precisa.
          </p>
        </div>
        <nav aria-label="Provas" className={col}>
          <p className="font-mono text-xs font-bold uppercase tracking-wider">Provas</p>
          {Object.values(CATEGORIAS).map((c) => (
            <Link key={c.nome} href={c.href} className={link}>{c.nome}</Link>
          ))}
        </nav>
        <nav aria-label="Disciplinas" className={col}>
          <p className="font-mono text-xs font-bold uppercase tracking-wider">Disciplinas</p>
          {DISCIPLINAS.slice(0, 6).map((d) => (
            <Link key={d.slug} href={`/disciplinas/${d.slug}`} className={link}>
              {d.nome}
              {d.status === "em-breve" && <span className="ml-2 text-xs text-n4">em breve</span>}
            </Link>
          ))}
        </nav>
        <nav aria-label="Gabaru" className={col}>
          <p className="font-mono text-xs font-bold uppercase tracking-wider">Gabaru</p>
          <Link href="/sobre" className={link}>Sobre nós</Link>
          <Link href="/planos" className={link}>Planos</Link>
          <Link href="/materiais-gratuitos" className={link}>Materiais gratuitos</Link>
          <Link href="/login" className={link}>Área do aluno</Link>
        </nav>
      </div>
      <div className="border-t border-n2">
        <p className="mx-auto max-w-6xl px-5 py-5 font-mono text-xs text-n5 sm:px-8">
          gabaru.com.br · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
