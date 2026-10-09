import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 pt-16">
      <h1 className="text-3xl font-bold">Entrar na área do aluno</h1>
      <AuthForm modo="login" />
    </main>
  );
}
