import "server-only";

/**
 * Limitador simples em memória (janela fixa). Vale por instância do servidor:
 * protege contra abuso básico. Para limite global, trocar por Redis/Key Value.
 */
const baldes = new Map<string, { n: number; fim: number }>();

export function limitar(chave: string, max: number, janelaMs: number): boolean {
  const agora = Date.now();
  const b = baldes.get(chave);
  if (!b || b.fim < agora) {
    baldes.set(chave, { n: 1, fim: agora + janelaMs });
    if (baldes.size > 5000) for (const [k, v] of baldes) if (v.fim < agora) baldes.delete(k);
    return true;
  }
  b.n += 1;
  return b.n <= max;
}

/** Aceita apenas requisições vindas do próprio site (defesa contra CSRF). */
export function origemPermitida(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const permitidas = new Set([site, "http://localhost:3000"].filter(Boolean) as string[]);
  try {
    if (site) permitidas.add(new URL(site).origin);
  } catch {}
  return permitidas.has(origin) || origin === new URL(req.url).origin;
}
