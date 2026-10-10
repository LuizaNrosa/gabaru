"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { friendlyAuthError, useAuth } from "@/context/auth-context";
import { getClientAuth } from "@/lib/firebase/client";

export default function PainelPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  async function assinar() {
    setErro(null);
    setEnviando(true);
    try {
      const token = await getClientAuth().currentUser?.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "checkout");
      window.location.href = data.url;
    } catch (err) {
      setErro(friendlyAuthError(err));
      setEnviando(false);
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-2xl px-5 pt-16">
        {loading || !user ? (
          <p className="text-n5">Carregando...</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold">
              Olá{user.displayName ? `, ${user.displayName}` : ""}.
            </h1>
            <p className="mt-2 text-n5">{user.email}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={assinar}
                disabled={enviando}
                className="min-h-12 rounded-md bg-gold px-6 font-semibold text-ink hover:opacity-90 disabled:opacity-50"
              >
                {enviando ? "Aguarde..." : "Assinar"}
              </button>
              <button onClick={() => signOut().then(() => router.push("/"))} className="min-h-12 rounded-md border border-ink px-6 font-semibold">
                Sair
              </button>
            </div>
            {erro && (
              <p role="alert" className="mt-4 rounded-md border-l-4 border-anil bg-white p-3 text-anil">
                {erro}
              </p>
            )}
          </>
        )}
      </main>
    </>
  );
}
