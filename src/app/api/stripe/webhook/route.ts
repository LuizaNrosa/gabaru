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
      // TODO: liberar acesso ao usuário `uid` (ex.: gravar no Firestore ou custom claim).
      console.log("[stripe/webhook] pagamento concluído para", uid);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
