import Link from "next/link";
import { Wordmark } from "@/components/logo";
export function SiteFooter() {
  return (
    <footer className="gb-footer">
      <div className="gb-container gb-footer-grid">
        <div>
          <Wordmark />
          <p className="mt-5 max-w-xs text-sm text-n5">
            ENEM, vestibulinhos e vestibulares: encontre provas anteriores,
            questões e ferramentas para preparar seu próximo passo.
          </p>
          <p className="mt-3 text-xs text-n4">
            Plataforma em construção · © {new Date().getFullYear()} Luiza
            Nascimento Rosa.
          </p>
        </div>
        <nav aria-label="Caminhos">
          <h2>Caminhos</h2>
          <Link href="/pre-vestibulinho">Vestibulinhos</Link>
          <Link href="/pre-vestibular">Vestibulares</Link>
          <Link href="/enem">ENEM</Link>
          <Link href="/concursos">Concursos</Link>
        </nav>
        <nav aria-label="Estudar">
          <h2>Estudar</h2>
          <Link href="/nota-de-corte">Nota de corte ETEC</Link>
          <Link href="/provas">Acervo de provas</Link>
          <Link href="/treino">Treino gratuito</Link>
          <Link href="/questoes-gratis">Questões abertas</Link>
          <Link href="/materiais-gratuitos">Materiais e fontes</Link>
          <Link href="/disciplinas/matematica">Disciplinas</Link>
        </nav>
        <nav aria-label="Gabaru">
          <h2>Gabaru</h2>
          <Link href="/sobre">Sobre o projeto</Link>
          <Link href="/planos">Planos e lançamento</Link>
          <Link href="/login">Área do aluno</Link>
        </nav>
      </div>
      <div className="gb-footer-bottom">
        <div className="gb-container">
          © {new Date().getFullYear()} Luiza Nascimento Rosa · gabaru.com.br ·
          Projeto independente, sem vínculo com as instituições dos exames.
        </div>
      </div>
    </footer>
  );
}

