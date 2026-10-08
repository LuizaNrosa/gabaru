import { NextResponse } from "next/server";
import { verifyRequestUser } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Cria uma sessão do Stripe Checkout para o usuário autenticado.
 * Ajuste `mode` para "subscription" se STRIPE_PRICE_ID for um preço recorrente.
 */
export async function POST(req: Request) {
  const user = await verifyRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID não configurado." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.uid,
      metadata: { firebaseUid: user.uid },
      success_url: `${siteUrl}/painel?checkout=sucesso`,
      cancel_url: `${siteUrl}/painel?checkout=cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Não foi possível criar o pagamento." }, { status: 500 });
  }
}
