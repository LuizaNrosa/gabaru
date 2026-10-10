/**
 * Modo "em construção": o site fica no ar, mas não vende nada.
 * Liga por padrão. Para abrir as vendas no lançamento, defina NEXT_PUBLIC_EM_CONSTRUCAO=0 no Render.
 * O checkout também bloqueia enquanto o modo estiver ligado (ver api/stripe/checkout).
 */
export const EM_CONSTRUCAO = process.env.NEXT_PUBLIC_EM_CONSTRUCAO !== "0";
