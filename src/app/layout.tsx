import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/auth-context";
import { LogoDefs } from "@/components/logo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TabBar } from "@/components/tab-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GABARU · A gente estuda junto até você gabaritar",
    template: "%s · GABARU",
  },
  description:
    "Matemática e física para ETEC, Coluni, ENEM, FUVEST, UNICAMP, UNESP, ITA, IME e concursos.",
  // Enquanto o site está em construção, buscadores não indexam. Para liberar: NEXT_PUBLIC_INDEXAR=1 no Render.
  robots: process.env.NEXT_PUBLIC_INDEXAR === "1" ? { index: true, follow: true } : { index: false, follow: false },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabaru.com.br"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f4ee",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@200..800&family=Atkinson+Hyperlegible+Mono:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-paper pb-16 font-sans text-ink antialiased sm:pb-0">
        <LogoDefs />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
        >
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <SiteHeader />
          <div id="conteudo" tabIndex={-1} className="outline-none">{children}</div>
          <SiteFooter />
          <TabBar />
        </AuthProvider>
      </body>
    </html>
  );
}
