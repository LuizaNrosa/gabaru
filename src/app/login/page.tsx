import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
export const metadata: Metadata = { title: "Entrar na área do aluno" };
export default function Page() {
  return (
    <main className="gb-auth">
      <p className="gb-eyebrow">SEU ESPAÇO NO GABARU</p>
      <h1 className="mt-4">Entrar na área do aluno</h1>
      <p className="mt-3 text-sm text-n5">
        O treino gratuito também está disponível sem cadastro. Histórico e plano
        individual estão em desenvolvimento.
      </p>
      <AuthForm modo="login" />
    </main>
  );
}
