import {getServerEnv} from '../env.mjs';
import "server-only";
import {RateBucket} from "./security/bucket";

/**
 * Limitador simples em memória (janela fixa). Vale por instância do servidor:
 * protege contra abuso básico. Para limite global, trocar por Redis/Key Value.
 */
const buckets=new RateBucket();
export function limitar(chave:string,max:number,janelaMs:number,cost=1){return buckets.consume(chave,max,janelaMs,cost);}

/** Aceita apenas requisições vindas do próprio site (defesa contra CSRF). */
export function origemPermitida(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const site = getServerEnv().NEXT_PUBLIC_SITE_URL;
  const permitidas = new Set([site, "http://localhost:3000"].filter(Boolean) as string[]);
  try {
    if (site) permitidas.add(new URL(site).origin);
  } catch {}
  return permitidas.has(origin) || origin === new URL(req.url).origin;
}
