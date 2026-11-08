"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { PainelEvolucao } from "@/components/painel-evolucao";
export default function Page() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
  return (
    <main className="gb-container gb-dashboard">
      {loading || !user ? (
        <p role="status">Carregando sua área…</p>
      ) : (
        <>
          <p className="gb-eyebrow">ÁREA DO ALUNO</p>
          <h1 className="mt-4">
            Olá{user.displayName ? `, ${user.displayName}` : ""}.
          </h1>
          <p className="mt-3 text-n5">
            Um passo de cada vez. Escolha seu ponto de partida.
          </p>
          <div className="gb-content-grid mt-9">
            <article className="gb-content-card">
              <p className="gb-eyebrow">DISPONÍVEL</p>
              <h2>Seu treino de hoje</h2>
              <p>
                Escolha uma disciplina e pratique com questões ENEM. Com a
                conta ativa, cada resposta do acervo ETEC também fica gravada
                no seu histórico.
              </p>
              <Link href="/treino" className="gb-button">
                Iniciar treino ↗
              </Link>
            </article>
            <PainelEvolucao />
            <article className="gb-content-card">
              <p className="gb-eyebrow">CONHECER</p>
              <h2>Encontre seu caminho</h2>
              <p>
                Explore os temas e as instituições que fazem parte do projeto.
              </p>
              <Link href="/pre-vestibulinho">Vestibulinhos ↗</Link>
              <Link href="/pre-vestibular">ENEM e vestibulares ↗</Link>
            </article>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <p className="text-sm text-n5">{user.email}</p>
            <button
              className="gb-login"
              onClick={() => signOut().then(() => router.push("/"))}
            >
              Sair da conta
            </button>
          </div>
        </>
      )}
    </main>
  );
}
