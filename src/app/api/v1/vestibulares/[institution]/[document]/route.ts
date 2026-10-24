import { ARCHIVES, type Institution } from "@/lib/vestibular-archive";
import { fetchOfficialPdf } from "@/lib/official-pdf";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ institution: string; document: string }> }) {
  const { institution, document } = await params;
  if (institution !== "unesp" && institution !== "unicamp") return Response.json({ error: "Instituição inexistente" }, { status: 404 });
  const asset = ARCHIVES[institution as Institution].documents.find(d => d.id === document);
  if (!asset) return Response.json({ error: "Documento inexistente" }, { status: 404 });
  try {
    const bytes = await fetchOfficialPdf(asset);
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${institution}-${asset.id}.pdf"`,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "frame-ancestors 'self'",
    } });
  } catch {
    return new Response("Não foi possível carregar o PDF verificado. Volte ao caderno e use o link para a fonte oficial.", { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
}
