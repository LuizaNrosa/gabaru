import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {verifySessionCookie} from '@/lib/firebase/admin';
import type { Metadata } from "next";
import { metaPagina } from "@/lib/seo";
import { PainelProviders } from "@/components/painel-providers";

// A página do painel é um componente de cliente; a metadata vive neste
// layout de servidor. Área do aluno: nunca indexar.
export const metadata: Metadata = metaPagina({
  titulo: "Área do aluno",
  descricao: "Sua área no Gabaru: progresso, histórico e próximos passos.",
  caminho: "/painel",
  semIndice: true,
});

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie=(await cookies()).get('__session')?.value;
  if(!cookie||!await verifySessionCookie(cookie))redirect('/login');
  return <PainelProviders>{children}</PainelProviders>;
}
