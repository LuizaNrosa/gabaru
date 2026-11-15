import { notFound } from "next/navigation";
import { CheckoutTeste } from "./checkout-teste";

export const dynamic = "force-dynamic";

export default function Page() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.MERCADO_PAGO_ENABLE_TEST_CHECKOUT !== "1") notFound();
  return <CheckoutTeste />;
}
