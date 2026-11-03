import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { metaPagina } from "@/lib/seo";
export const metadata: Metadata = metaPagina({
  titulo: "Criar sua conta",
  descricao: "Crie sua conta gratuita no Gabaru e comece a estudar.",
  caminho: "/cadastro",
  semIndice: true,
});
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
