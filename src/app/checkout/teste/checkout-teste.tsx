"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

export function CheckoutTeste() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");

  async function criarPreferencia() {
    if (!user || busy) return;
    setBusy(true);
    setMessage("");
    setCheckoutUrl("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/mercado-pago/checkout-teste", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (!response.ok || typeof body.checkoutUrl !== "string") {
        setMessage(typeof body.error === "string" ? body.error : "Não foi possível criar a preferência.");
        return;
      }
      setCheckoutUrl(body.checkoutUrl);
    } catch {
      setMessage("Não foi possível conectar ao checkout de teste.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="gb-container py-10">
      <h1 className="gb-page-title">Checkout de teste</h1>
      <p className="mt-4">Apostila Gabaru · R$ 60,00 · ambiente de teste do Mercado Pago.</p>
      {loading ? (
        <p className="mt-5" role="status">Verificando sessão…</p>
      ) : user ? (
        <button type="button" className="gb-button mt-5" onClick={criarPreferencia} disabled={busy || Boolean(checkoutUrl)}>
          {busy ? "Criando preferência…" : "Criar preferência de teste"}
        </button>
      ) : (
        <Link className="gb-button mt-5" href="/login">Entrar com a conta de teste</Link>
      )}
      {message && <p className="gb-notice mt-5" role="alert">{message}</p>}
      {checkoutUrl && <a className="gb-button mt-5" href={checkoutUrl} target="_blank" rel="noopener noreferrer">Abrir checkout do Mercado Pago em nova aba ↗</a>}
    </main>
  );
}
