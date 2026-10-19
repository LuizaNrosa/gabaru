"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { friendlyAuthError, useAuth } from "@/context/auth-context";

export function AuthForm({ modo }: { modo: "login" | "cadastro" }) {
  const { signIn, signUp, available } = useAuth();
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
        className="min-h-12 rounded-md bg-gold px-6 font-semibold text-ink hover:opacity-90 disabled:opacity-50"
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
