import {getServerEnv} from '../../../env.mjs';
import { notFound } from "next/navigation";
import { CheckoutTeste } from "./checkout-teste";

export const dynamic = "force-dynamic";

export default function Page() {
  if (getServerEnv().VERCEL_ENV !== "preview" || getServerEnv().MERCADO_PAGO_ENABLE_TEST_CHECKOUT !== "1") notFound();
  return <CheckoutTeste />;
}
