import type { MetadataRoute } from "next";
import { enemExams } from "@/lib/enem-acervo";
import { archiveYears } from "@/lib/vestibular-archive";
import { DISCIPLINAS } from "@/data/disciplinas";
import { PROVAS } from "@/data/provas";
import etecExams from "@/data/etec-exams.json";
import coluniExams from "@/data/coluni-exams.json";
import ifscExams from "@/data/ifsc-exams.json";
import ifspExams from "@/data/ifsp-exams.json";
import { examesUerjUel as uerjUel } from "@/lib/uerj-uel-exams";
import ifmt2025 from "@/data/ifmt-2025-1.json";
import ifmt2026 from "@/data/ifmt-2026-1.json";
import ifrs2025 from "@/data/ifrs-2025-1.json";
import ifrs2026 from "@/data/ifrs-2026-1.json";

/**
 * Mapa do site para os mecanismos de busca.
 * Gerado a partir das mesmas fontes de dados das páginas (acervos e
 * catálogos), para nunca listar endereços que não existem.
 * Páginas de conta e de pagamento ficam fora de propósito.
 * Sem `lastModified`: as fontes de dados não guardam datas de edição
 * fiáveis por página, e carimbar a data do build induziria os
 * rastreadores em erro. Adicionar quando houver datas reais.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabaru.com.br";
  const url = (caminho: string) => `${base}${caminho}`;

  const estaticas = [
    "",
    "/enem",
    "/provas",
    "/provas/enem",
    "/provas/uerj",
    "/provas/uel",
    "/provas/ifmt",
    "/provas/ifrs",
    "/concursos",
    "/materiais-gratuitos",
    "/nota-de-corte",
    "/nota-de-corte/fuvest",
    "/nota-de-corte/unicamp",
    "/nota-de-corte/unesp",
    "/nota-de-corte/sisu",
    "/nota-de-corte/cotuca",
    "/nota-de-corte/ifrn",
    "/nota-de-corte-coluni",
    "/nota-de-corte-ifsc",
    "/planos",
    "/pre-vestibular",
    "/pre-vestibulinho",
    "/questoes-gratis",
    "/sobre",
    "/treino",
  ].map((caminho) => ({ url: url(caminho) }));

  const categorias = PROVAS.map((p) => ({ url: url(`/provas/${p.slug}`) }));
  const disciplinas = DISCIPLINAS.map((d) => ({
    url: url(`/disciplinas/${d.slug}`),
  }));

  const enem = enemExams.map((e) => ({ url: url(`/provas/enem/${e.id}`) }));
  const etec = (etecExams as { id: string }[]).map((e) => ({
    url: url(`/provas/etec/${e.id}`),
  }));
  const coluni = (coluniExams as { id: string }[]).map((e) => ({
    url: url(`/provas/coluni/${e.id}`),
  }));
  const ifsc = (ifscExams as { id: string }[]).map((e) => ({
    url: url(`/provas/ifsc/${e.id}`),
  }));
  const ifsp = (ifspExams as { id: string }[]).map((e) => ({
    url: url(`/provas/ifsp/${e.id}`),
  }));
  const fuvest = Array.from({ length: 50 }, (_, i) => ({ url: url(`/provas/fuvest/${2026 - i}`) }));
  const unesp = archiveYears("unesp").map((ano) => ({
    url: url(`/provas/unesp/${ano}`),
  }));
  const unicamp = archiveYears("unicamp").map((ano) => ({
    url: url(`/provas/unicamp/${ano}`),
  }));

  const vistos = new Set<string>();
  return [
    ...estaticas,
    ...categorias,
    ...disciplinas,
    ...enem,
    ...etec,
    ...coluni,
    ...ifsc,
    ...ifsp,
    ...fuvest,
    ...unesp,
    ...unicamp,
    ...[...ifmt2025, ...ifmt2026, ...ifrs2025, ...ifrs2026].map(e => ({ url: url(`/provas/${e.instituicao.toLowerCase()}/${e.id}`) })),
    ...uerjUel.map(p => ({ url: url(`/provas/${p.instituicao.toLowerCase()}/${p.id}`) })),
  ].filter((item) => {
    if (vistos.has(item.url)) return false;
    vistos.add(item.url);
    return true;
  });
}
