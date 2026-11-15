import { NextResponse } from "next/server";
import { verifyRequestUser } from "@/lib/firebase/admin";
import { limitar, origemPermitida } from "@/lib/seguranca";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV !== "preview" || process.env.MERCADO_PAGO_ENABLE_TEST_CHECKOUT !== "1") {
    return NextResponse.json({ error: "Checkout de teste indisponível." }, { status: 404 });
  }
  if (!origemPermitida(request)) {
    return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
  }

  const user = await verifyRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Entre na sua conta de teste." }, { status: 401 });
  }
  if (user.uid !== process.env.MERCADO_PAGO_TEST_OPERATOR_UID) {
    return NextResponse.json({ error: "Conta sem acesso ao teste." }, { status: 403 });
  }
  if (!limitar(`mp-preview:${user.uid}`, 5, 60_000)) {
    return NextResponse.json({ error: "Aguarde um minuto para tentar novamente." }, { status: 429 });
  }

  const token = process.env.MERCADO_PAGO_TEST_ACCESS_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ error: "Credencial de teste ausente." }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{
          id: "apostila-gabaru-teste",
          title: "Apostila Gabaru",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 60,
        }],
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[mercado-pago/checkout-teste] status", response.status);
      return NextResponse.json({ error: "O Mercado Pago não criou a preferência de teste." }, { status: 502 });
    }

    const preference = await response.json() as { id?: unknown; sandbox_init_point?: unknown };
    if (typeof preference.id !== "string" || typeof preference.sandbox_init_point !== "string") {
      throw new Error("Preferência de teste incompleta.");
    }
    const checkout = new URL(preference.sandbox_init_point);
    if (checkout.origin !== "https://sandbox.mercadopago.com" &&
        checkout.origin !== "https://sandbox.mercadopago.com.br") {
      throw new Error("URL de teste inesperada.");
    }

    return NextResponse.json({ id: preference.id, checkoutUrl: checkout.href }, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível abrir o checkout de teste." }, { status: 502 });
  }
}
