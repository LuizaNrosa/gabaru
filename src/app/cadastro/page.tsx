import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
export const metadata: Metadata = { title: "Criar sua conta" };
export default function Page() {
  return (
    <main className="gb-auth">
      <p className="gb-eyebrow">SEU ESPAÇO NO GABARU</p>
      <h1 className="mt-4">Criar sua conta</h1>
      <p className="mt-3 text-sm text-n5">
        O treino gratuito também está disponível sem cadastro. Histórico e plano
        individual estão em desenvolvimento.
      </p>
      <AuthForm modo="cadastro" />
    </main>
  );
}
