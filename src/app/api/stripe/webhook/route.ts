import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Webhook do Stripe. Configure o endpoint no painel do Stripe (conta do Gabaru):
 *   https://gabaru.com.br/api/stripe/webhook
 * Em desenvolvimento: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook mal configurado." }, { status: 400 });
  }

  // O corpo precisa ser o texto bruto para a verificação da assinatura.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.client_reference_id ?? session.metadata?.firebaseUid;
      // O acesso ainda não é provisionado. Responder erro preserva a
      // possibilidade de reprocessamento e evita confirmar um efeito inexistente.
      console.error("[stripe/webhook] pagamento sem provisionamento implementado", Boolean(uid));
      return NextResponse.json({ error: "Provisionamento indisponível." }, { status: 503 });
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
