import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import { LogoDefs } from "@/components/logo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TabBar } from "@/components/tab-bar";
import { JsonLd } from "@/components/json-ld";
import { OG_IMAGEM, jsonLd } from "@/lib/seo";
import "./globals.css";

// Fontes auto-hospedadas pelo Next: sem CSS externo bloqueante e com
// preload automático. Atkinson Hyperlegible foi desenhada para legibilidade.
const fonteTexto = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-atkinson-next",
  display: "swap",
});
const fonteMono = Atkinson_Hyperlegible_Mono({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-atkinson-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GABARU · A gente estuda junto até você gabaritar",
    template: "%s · GABARU",
  },
  description:
    "Vestibulinho ETEC com as provas oficiais: 41 edições e 1.990 questões com gabarito verificado, nota de corte e demanda por curso, unidade e turno. Acervo ENEM, COLUNI, Unesp e Unicamp.",
  authors: [{ name: "Luiza Nascimento Rosa", url: "https://github.com/LuizaNrosa" }],
  creator: "Luiza Nascimento Rosa",
  publisher: "Luiza Nascimento Rosa",
  other: { copyright: "© 2026 Luiza Nascimento Rosa" },
  // Enquanto o site está em construção, buscadores não indexam. Para liberar: NEXT_PUBLIC_INDEXAR=1 no Render.
  robots:
    process.env.NEXT_PUBLIC_INDEXAR === "1"
      ? { index: true, follow: true }
      : { index: false, follow: false },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabaru.com.br",
  ),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "GABARU",
    title: "GABARU · A gente estuda junto até você gabaritar",
    description:
      "Vestibulinho ETEC com as provas oficiais: 41 edições e 1.990 questões com gabarito verificado, nota de corte e demanda por curso, unidade e turno. Acervo ENEM, COLUNI, Unesp e Unicamp.",
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
  themeColor: "#f7f3ea",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteTexto.variable} ${fonteMono.variable}`}
    >
      <body className="min-h-screen bg-paper pb-16 font-sans text-ink antialiased sm:pb-0">
        <JsonLd dados={jsonLd.organizacao()} />
        <JsonLd dados={jsonLd.site()} />
        <LogoDefs />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-gold-text focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
        >
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <SiteHeader />
          <div id="conteudo" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <SiteFooter />
          <TabBar />
        </AuthProvider>
      </body>
    </html>
  );
}

