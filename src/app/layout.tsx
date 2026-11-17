import {NuqsAdapter} from 'nuqs/adapters/next/app';
import {env} from '../env.mjs';
import { organization, author } from "@/lib/seo/schema-graph";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/auth-context";
import { LogoDefs } from "@/components/logo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TabBar } from "@/components/tab-bar";
import { JsonLd } from "@/components/json-ld";
import { OG_IMAGEM, jsonLd } from "@/lib/seo";
import "katex/dist/katex.min.css";
import "./globals.css";

// Fontes OFL locais: sem consulta externa durante o build.
export const metadata: Metadata = {
  title: {
    default: "GABARU · A gente estuda junto até você gabaritar",
    template: "%s · GABARU",
  },
  description:
    "Estude para ENEM, vestibulinhos e vestibulares com questões verificadas, provas oficiais, revisão espaçada e livros lidos na plataforma.",
  authors: [{ name: "Luiza Nascimento Rosa", url: "https://github.com/LuizaNrosa" }],
  creator: "Luiza Nascimento Rosa",
  publisher: "Luiza Nascimento Rosa",
  // O preview pode definir NEXT_PUBLIC_INDEXAR=0. Produção usa o domínio canônico sem www.
  robots:
    env.NEXT_PUBLIC_INDEXAR !== "0"
      ? { index: true, follow: true }
      : { index: false, follow: false },
  metadataBase: new URL(
    "https://gabaru.com.br",
  ),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "GABARU",
    title: "GABARU · A gente estuda junto até você gabaritar",
    description:
      "Estude para ENEM, vestibulinhos e vestibulares com questões verificadas, provas oficiais, revisão espaçada e livros lidos na plataforma.",
    images: [{ url: OG_IMAGEM, width: 1200, height: 630, alt: "GABARU" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGEM],
  },
  other: {
    copyright: `© ${new Date().getFullYear()} Luiza Nascimento Rosa`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f8f2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className="fontes-gabaru"
    >
      <head><link rel="preload" as="font" href="/fonts/atkinson/847c6af3f14ca2aa.p.2dv7oiayrgfo5.woff2" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" as="font" href="/fonts/atkinson/50a63ac321745c44.p.202x5_1668z2o.woff2" type="font/woff2" crossOrigin="anonymous"/></head>
      <body className="min-h-screen bg-paper pb-16 font-sans text-ink antialiased sm:pb-0">
        <JsonLd dados={{"@context":"https://schema.org","@graph":[organization,author]}} />
        <JsonLd dados={jsonLd.site()} />
        <LogoDefs />
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-gold-text focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
        >
          Pular para o conteúdo
        </a>
        <NuqsAdapter><AuthProvider>
          <SiteHeader />
          <div id="conteudo" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <SiteFooter />
          <TabBar />
        </AuthProvider></NuqsAdapter>
      </body>
    </html>
  );
}
