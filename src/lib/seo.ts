import {seoTitle,seoDescription} from './seo/metadata-contract';
import {env} from '../env.mjs';
import provasIndexaveis from '@/data/editorial/provas-indexaveis.json';
import type { Metadata } from "next";
import type { Organization, WebSite, FAQPage, BreadcrumbList, ItemList, WithContext } from "schema-dts";

/**
 * SEO central do Gabaru.
 * Toda a rota pública deve exportar metadata a partir de `metaPagina`,
 * para garantir título, descrição, canonical, Open Graph e Twitter
 * coerentes. Dados estruturados (JSON-LD) vivem em `jsonLd` e são
 * renderizados pelo componente `JsonLd` — apenas esquemas que
 * correspondem a conteúdo real e visível da página.
 */

export const SITE_URL = "https://gabaru.com.br";

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
  titulo=seoTitle(titulo);descricao=seoDescription(descricao);
  const indexar =
    env.NEXT_PUBLIC_INDEXAR !== "0" && !semIndice && (!/^\/provas\/[^/]+\/[^/]+$/.test(caminho)||(provasIndexaveis as string[]).includes(caminho));
  return {
    title: {absolute:titulo},
    description: descricao,
    alternates: { canonical: caminho },
    robots: { index: indexar, follow: true },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: SITE_NOME,
      title: titulo,
      description: descricao,
      url: caminho,
      images: [{ url: OG_IMAGEM, width: 1200, height: 630, alt: "GABARU" }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      images: [OG_IMAGEM],
    },
  };
}

/** Metadata da página inicial: título absoluto, sem o template. */
export function metaHome(): Metadata {
  const titulo = seoTitle("ENEM, vestibulinhos e vestibulares: provas");
  const indexar = env.NEXT_PUBLIC_INDEXAR !== "0";
  return {
    title: { absolute: titulo },
    description: DESCRICAO_PADRAO,
    alternates: { canonical: "/" },
    robots: { index: indexar, follow: true },
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



export const jsonLd = {
  organizacao(): WithContext<Organization> {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Gabaru",
      url: SITE_URL,
      logo: `${SITE_URL}/marca/gabaru-logo-512.png`,
      description: DESCRICAO_PADRAO,
      founder: {
        "@type": "Person",
        name: "Luiza Nascimento Rosa",
        url: "https://github.com/LuizaNrosa",
      },
    };
  },
  site(): WithContext<WebSite> {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Gabaru",
      url: SITE_URL,
      inLanguage: "pt-BR",
    };
  },
  faq(perguntas: readonly (readonly string[])[]): WithContext<FAQPage> {
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
  trilhas(itens: readonly { nome: string; caminho: string }[]): WithContext<BreadcrumbList> {
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
  ): WithContext<ItemList> {
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

