import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { metaPagina } from "@/lib/seo";
export const metadata: Metadata = metaPagina({
  titulo: "Entrar na área do aluno",
  descricao: "Acesse sua conta no Gabaru para continuar estudando.",
  caminho: "/login",
  semIndice: true,
});
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
