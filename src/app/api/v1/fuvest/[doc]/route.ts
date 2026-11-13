// © 2026 Luiza Nascimento Rosa e Felipe Nascimento Rosa. Todos os direitos reservados.
import documentos from "@/data/fuvest-documentos.json";

export const runtime = "nodejs";

/**
 * Proxy dos PDFs oficiais da FUVEST para o leitor integrado.
 * Mesmo padrão do acervo da Unesp/Unicamp: o aluno treina dentro do
 * Gabaru, o documento continua vindo da fonte oficial.
 *   GET /api/v1/fuvest/12  (índice do documento em fuvest-documentos.json)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ doc: string }> },
) {
  const { doc } = await params;
  const indice = Number(doc);
  if (!Number.isInteger(indice) || indice < 0 || indice >= documentos.length)
    return Response.json({ error: "Documento inexistente" }, { status: 404 });
  const alvo = documentos[indice];
  const url = new URL(alvo.url);
  if (url.protocol !== "https:" || url.hostname !== "www.fuvest.br")
    return Response.json({ error: "Fonte não permitida" }, { status: 400 });
  try {
    const resposta = await fetch(alvo.url, {
      signal: AbortSignal.timeout(45000),
      headers: { "User-Agent": "Gabaru/1.0 (leitor integrado; gabaru.com.br)" },
    });
    if (!resposta.ok || !resposta.headers.get("content-type")?.includes("pdf"))
      throw new Error("Resposta inválida");
    const bytes = new Uint8Array(await resposta.arrayBuffer());
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="fuvest-${alvo.year}-${indice}.pdf"`,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "Não foi possível carregar o PDF oficial agora." },
      { status: 502 },
    );
  }
}
