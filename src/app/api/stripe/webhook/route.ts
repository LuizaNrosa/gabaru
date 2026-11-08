import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { aplicarEventoStripe } from "@/server/entitlements";

export const runtime = "nodejs";

/**
 * Webhook do Stripe. Configure o endpoint no painel do Stripe (conta do Gabaru):
 *   https://gabaru.com.br/api/stripe/webhook
 * Em desenvolvimento: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 *
 * Semântica das respostas:
 *  - 500 "Webhook mal configurado.": falta STRIPE_SECRET_KEY no servidor
 *    (problema de configuração — reter o reenvio não ajuda, mas o erro é
 *    honesto e o log mostra a causa; a auditoria de 2026-11-03 pedia esta
 *    distinção em vez do antigo 400 genérico);
 *  - 400 "Assinatura inválida.": corpo assinado com outro segredo ou
 *    adulterado — NÃO é erro nosso, o Stripe não deve reenviar;
 *  - 200 { received: true }: evento verificado. O efeito (entitlements)
 *    é aplicado por src/server/entitlements.ts, que nunca lança — falhas
 *    de I/O ficam no log e o reenvio cobre (idempotência por event.id).
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook mal configurado." }, { status: 400 });
  }

  // O cliente Stripe vem PRIMEIRO: sem STRIPE_SECRET_KEY o problema é de
  // configuração do servidor (500), não de assinatura (400).
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error("[stripe/webhook] cliente Stripe indisponível:", err);
    return NextResponse.json(
      { error: "Webhook mal configurado." },
      { status: 500 },
    );
  }

  // O corpo precisa ser o texto bruto para a verificação da assinatura.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  // Eventos verificados: aplica o entitlement (ativar/desativar/marcar).
  // A função não lança; o resultado detalhado fica no log do servidor.
  const resultado = await aplicarEventoStripe(event);
  console.log(
    `[stripe/webhook] ${event.type} → ${resultado.acao}${resultado.uid ? ` (uid=${resultado.uid})` : ""}`,
  );

  return NextResponse.json({ received: true });
}
