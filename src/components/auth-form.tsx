"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { friendlyAuthError, useAuth } from "@/context/auth-context";

export function AuthForm({ modo }: { modo: "login" | "cadastro" }) {
  const { signIn, signUp, signInWithGoogle, available } = useAuth();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const cadastro = modo === "cadastro";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (cadastro) await signUp(nome, email, senha);
      else await signIn(email, senha);
      router.push("/painel");
    } catch (err) {
      setErro(friendlyAuthError(err));
    } finally {
      setEnviando(false);
    }
  }

  async function onGoogle() {
    setErro(null);
    setEnviando(true);
    try {
      await signInWithGoogle();
      router.push("/painel");
    } catch (err) {
      setErro(friendlyAuthError(err));
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    "mt-1 min-h-12 w-full rounded-md border border-n3 bg-white px-3 text-base";

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate={false}>
      {!available && (
        <p
          role="alert"
          className="rounded-md border-l-4 border-anil bg-white p-3"
        >
          O login ainda não está disponível. Volte em breve.
        </p>
      )}
      <button
        type="button"
        onClick={onGoogle}
        disabled={enviando || !available}
        className="flex min-h-12 items-center justify-center gap-3 rounded-md border border-n3 bg-white px-6 font-semibold hover:bg-n1 disabled:opacity-50"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        {cadastro ? "Criar conta com Google" : "Entrar com Google"}
      </button>
      <p className="flex items-center gap-3 text-sm text-n5" aria-hidden="true">
        <span className="h-px flex-1 bg-n3" />
        ou com e-mail
        <span className="h-px flex-1 bg-n3" />
      </p>
      {cadastro && (
        <label className="block font-semibold">
          Nome
          <input
            className={campo}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
          />
        </label>
      )}
      <label className="block font-semibold">
        E-mail
        <input
          type="email"
          required
          className={campo}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="block font-semibold">
        Senha
        <input
          type="password"
          required
          minLength={6}
          className={campo}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete={cadastro ? "new-password" : "current-password"}
        />
      </label>
      {erro && (
        <p
          role="alert"
          className="rounded-md border-l-4 border-anil bg-white p-3 text-anil"
        >
          {erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando || !available}
        className="min-h-12 rounded-md bg-gold-text px-6 font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {enviando ? "Aguarde..." : cadastro ? "Criar conta" : "Entrar"}
      </button>
      <p className="text-sm text-n5">
        {cadastro ? (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold">
              Entrar
            </Link>
          </>
        ) : (
          <>
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold">
              Criar conta
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
