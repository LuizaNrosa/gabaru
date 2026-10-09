import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 pt-16">
      <h1 className="text-3xl font-bold">Criar conta</h1>
      <AuthForm modo="cadastro" />
    </main>
  );
}
