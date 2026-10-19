export type Question = {
  id: string;
  ano: number;
  numero: number;
  disciplina: string;
  tema: string;
  img: string;
  w: number;
  h: number;
};
export type Catalog = {
  total: number;
  years: number[];
  disciplines: { slug: string; count: number }[];
  institutions: string[];
};
export const API = (
  process.env.EXPO_PUBLIC_API_URL || "https://gabaru.com.br"
).replace(/\/$/, "");
if (!API.startsWith("https://"))
  throw new Error("A API do aplicativo deve usar HTTPS.");
export async function getJSON<T>(path: string): Promise<T> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 20000);
  try {
    const r = await fetch(`${API}${path}`, { signal: abort.signal });
    if (!r.ok) throw new Error("Serviço indisponível. Tente novamente.");
    return (await r.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
export function imageUrl(q: Question) {
  if (!/^\/questoes\/[a-zA-Z0-9._-]+$/.test(q.img))
    throw new Error("Imagem inválida");
  return API + q.img;
}
