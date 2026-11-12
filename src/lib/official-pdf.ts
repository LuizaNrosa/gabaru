import { createHash } from "node:crypto";

const HOSTS = new Set(["documento.vunesp.com.br", "www.vunesp.com.br", "vestibular.unesp.br", "network.grupoabril.com.br", "www.comvest.unicamp.br", "comvest.unicamp.br"]);
type Document = { url: string; sha256: string; bytes: number };
export async function fetchOfficialPdf(document: Document, fetcher: typeof fetch = fetch): Promise<Uint8Array> {
  let url = new URL(document.url);
  const signal = AbortSignal.timeout(60_000);
  for (let redirects = 0; redirects <= 3; redirects++) {
    if (url.protocol !== "https:" || !HOSTS.has(url.hostname) || url.port || url.username || url.password) throw new Error("Invalid official source");
    const response = await fetcher(url, { redirect: "manual", cache: "no-store", signal });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Invalid redirect");
      url = new URL(location, url); continue;
    }
    if (!response.ok || !response.body) throw new Error("Official PDF unavailable");
    const announcedSize = Number(response.headers.get("content-length"));
    if (announcedSize > document.bytes) { await response.body.cancel(); throw new Error("PDF size changed"); }
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > document.bytes) { await reader.cancel(); throw new Error("PDF size changed"); }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    if (size !== document.bytes || bytes.subarray(0, 5).toString() !== "%PDF-" || createHash("sha256").update(bytes).digest("hex") !== document.sha256) throw new Error("PDF integrity changed");
    return bytes;
  }
  throw new Error("Too many redirects");
}
