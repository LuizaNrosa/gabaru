import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const liberado = process.env.NEXT_PUBLIC_INDEXAR === "1";
  return liberado
    ? { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/painel"] } }
    : { rules: { userAgent: "*", disallow: "/" } };
}
