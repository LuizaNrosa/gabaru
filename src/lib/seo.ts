import type { Metadata } from "next";

/**
 * SEO central do Gabaru.
 * Toda a rota pública deve exportar metadata a partir de `metaPagina`,
 * para garantir título, descrição, canonical, Open Graph e Twitter
 * coerentes. Dados estruturados (JSON-LD) vivem em `jsonLd` e são
 * renderizados pelo componente `JsonLd` — apenas esquemas que
 * correspondem a conteúdo real e visível da página.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabaru.com.br";

export const SITE_NOME = "GABARU";

/** Imagem social padrão (gerada a partir da capa social da ETEC). */
export const OG_IMAGEM = "/og/gabaru.png";

const DESCRICAO_PADRAO =
  "Estude para vestibulinhos, ENEM e vestibulares com provas oficiais, questões, gabaritos, materiais gratuitos e ferramentas de nota de corte.";

type OpcoesPagina = {
  /** Título já sem o sufixo " · GABARU" (o template do layout o aplica). */
  titulo: string;
  descricao: string;
  /** Caminho absoluto da rota, ex.: "/treino". */
  caminho: string;
  /** Páginas de conta/formulário: fora do índice mesmo após o lançamento. */
  semIndice?: boolean;
};

export function metaPagina({
  titulo,
  descricao,
  caminho,
  semIndice = false,
}: OpcoesPagina): Metadata {
  const indexar =
    process.env.NEXT_PUBLIC_INDEXAR === "1" && !semIndice;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: caminho },
    robots: { index: indexar, follow: indexar },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NOME,
      title: `${titulo} · ${SITE_NOME}`,
      description: descricao,
      url: caminho,
      images: [{ url: OG_IMAGEM, width: 1200, height: 630, alt: "GABARU" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titulo} · ${SITE_NOME}`,
      description: descricao,
      images: [OG_IMAGEM],
    },
  };
}

/** Metadata da página inicial: título absoluto, sem o template. */
export function metaHome(): Metadata {
  const titulo = "Vestibulinhos, ENEM e vestibulares: provas e questões | Gabaru";
  const indexar = process.env.NEXT_PUBLIC_INDEXAR === "1";
  return {
    title: { absolute: titulo },
    description: DESCRICAO_PADRAO,
    alternates: { canonical: "/" },
    robots: { index: indexar, follow: indexar },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NOME,
      title: titulo,
      description: DESCRICAO_PADRAO,
      url: "/",
      images: [{ url: OG_IMAGEM, width: 1200, height: 630, alt: "GABARU" }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: DESCRICAO_PADRAO,
      images: [OG_IMAGEM],
    },
  };
}

type ObjetoLd = Record<string, unknown>;

export const jsonLd = {
  organizacao(): ObjetoLd {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Gabaru",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description: DESCRICAO_PADRAO,
      founder: {
        "@type": "Person",
        name: "Luiza Nascimento Rosa",
        url: "https://github.com/LuizaNrosa",
      },
    };
  },
  site(): ObjetoLd {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Gabaru",
      url: SITE_URL,
      inLanguage: "pt-BR",
    };
  },
  faq(perguntas: readonly (readonly string[])[]): ObjetoLd {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: perguntas.map(([pergunta, resposta]) => ({
        "@type": "Question",
        name: pergunta,
        acceptedAnswer: { "@type": "Answer", text: resposta },
      })),
    };
  },
  trilhas(itens: readonly { nome: string; caminho: string }[]): ObjetoLd {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: itens.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.nome,
        item: `${SITE_URL}${item.caminho}`,
      })),
    };
  },
  lista(
    itens: readonly { nome: string; caminho: string }[],
  ): ObjetoLd {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: itens.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.nome,
        url: `${SITE_URL}${item.caminho}`,
      })),
    };
  },
};
