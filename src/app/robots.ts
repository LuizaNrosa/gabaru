import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const liberado = process.env.NEXT_PUBLIC_INDEXAR === "1";
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabaru.com.br";
  return liberado
    ? {
        rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/painel"] },
        sitemap: `${base}/sitemap.xml`,
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
