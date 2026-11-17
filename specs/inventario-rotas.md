# Inventário de rotas App Router

Instantâneo da árvore. XMLs e robots são arquivos públicos gerados por next-sitemap no postbuild; llms usa o mesmo catálogo público. O auditor percorre todas as URLs concretas dos sitemaps e links internos alcançáveis.

| Rota | Arquivo proprietário | Contrato |
| --- | --- | --- |
| `/api/auth/session` | `src/app/api/auth/session/route.ts` | API: contrato de método/autenticação |
| `/api/billing/cancelar` | `src/app/api/billing/cancelar/route.ts` | API: contrato de método/autenticação |
| `/api/billing/checkout` | `src/app/api/billing/checkout/route.ts` | API: contrato de método/autenticação |
| `/api/billing/status` | `src/app/api/billing/status/route.ts` | API: contrato de método/autenticação |
| `/api/billing/webhook` | `src/app/api/billing/webhook/route.ts` | API: contrato de método/autenticação |
| `/api/launch-notifications` | `src/app/api/launch-notifications/route.ts` | API: contrato de método/autenticação |
| `/api/mercado-pago/checkout-teste` | `src/app/api/mercado-pago/checkout-teste/route.ts` | API: contrato de método/autenticação |
| `/api/stripe/checkout` | `src/app/api/stripe/checkout/route.ts` | API: contrato de método/autenticação |
| `/api/stripe/portal` | `src/app/api/stripe/portal/route.ts` | API: contrato de método/autenticação |
| `/api/stripe/webhook` | `src/app/api/stripe/webhook/route.ts` | API: contrato de método/autenticação |
| `/api/v1/acervo/correcao` | `src/app/api/v1/acervo/correcao/route.ts` | API: contrato de método/autenticação |
| `/api/v1/attempts` | `src/app/api/v1/attempts/route.ts` | API: contrato de método/autenticação |
| `/api/v1/catalog` | `src/app/api/v1/catalog/route.ts` | API: contrato de método/autenticação |
| `/api/v1/coluni` | `src/app/api/v1/coluni/route.ts` | API: contrato de método/autenticação |
| `/api/v1/enem-simulado` | `src/app/api/v1/enem-simulado/route.ts` | API: contrato de método/autenticação |
| `/api/v1/entitlement` | `src/app/api/v1/entitlement/route.ts` | API: contrato de método/autenticação |
| `/api/v1/etec/correcao` | `src/app/api/v1/etec/correcao/route.ts` | API: contrato de método/autenticação |
| `/api/v1/etec` | `src/app/api/v1/etec/route.ts` | API: contrato de método/autenticação |
| `/api/v1/fuvest/[doc]` | `src/app/api/v1/fuvest/[doc]/route.ts` | API: contrato de método/autenticação |
| `/api/v1/ifs/correcao` | `src/app/api/v1/ifs/correcao/route.ts` | API: contrato de método/autenticação |
| `/api/v1/ifsc` | `src/app/api/v1/ifsc/route.ts` | API: contrato de método/autenticação |
| `/api/v1/ifsp` | `src/app/api/v1/ifsp/route.ts` | API: contrato de método/autenticação |
| `/api/v1/progress` | `src/app/api/v1/progress/route.ts` | API: contrato de método/autenticação |
| `/api/v1/questions` | `src/app/api/v1/questions/route.ts` | API: contrato de método/autenticação |
| `/api/v1/study` | `src/app/api/v1/study/route.ts` | API: contrato de método/autenticação |
| `/api/v1/vestibulares/[institution]/[document]` | `src/app/api/v1/vestibulares/[institution]/[document]/route.ts` | API: contrato de método/autenticação |
| `/assunto/[slug]` | `src/app/assunto/[slug]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/banca/[slug]` | `src/app/banca/[slug]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/cadastro` | `src/app/cadastro/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/checkout/teste` | `src/app/checkout/teste/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/concursos` | `src/app/concursos/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/disciplina/[disciplina]` | `src/app/disciplina/[disciplina]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/disciplinas/[slug]` | `src/app/disciplinas/[slug]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/enem` | `src/app/enem/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/etec` | `src/app/etec/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/institutos-federais` | `src/app/institutos-federais/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/livros/[livroSlug]/[capituloSlug]` | `src/app/livros/[livroSlug]/[capituloSlug]/page.tsx` | Sessão no servidor; noindex |
| `/livros` | `src/app/livros/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/login` | `src/app/login/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/materiais-gratuitos` | `src/app/materiais-gratuitos/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/nota-de-corte/cotuca` | `src/app/nota-de-corte/cotuca/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/nota-de-corte/fuvest` | `src/app/nota-de-corte/fuvest/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/nota-de-corte/ifrn` | `src/app/nota-de-corte/ifrn/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/nota-de-corte` | `src/app/nota-de-corte/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/nota-de-corte/sisu` | `src/app/nota-de-corte/sisu/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/nota-de-corte/unesp` | `src/app/nota-de-corte/unesp/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/nota-de-corte/unicamp` | `src/app/nota-de-corte/unicamp/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/nota-de-corte-coluni` | `src/app/nota-de-corte-coluni/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/nota-de-corte-ifsc` | `src/app/nota-de-corte-ifsc/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/` | `src/app/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/painel` | `src/app/painel/page.tsx` | Sessão no servidor; noindex |
| `/painel/premium` | `src/app/painel/premium/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/planos` | `src/app/planos/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/pre-vestibular` | `src/app/pre-vestibular/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/pre-vestibulinho` | `src/app/pre-vestibulinho/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/privacidade` | `src/app/privacidade/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/[slug]/[ano]` | `src/app/provas/[slug]/[ano]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/[slug]` | `src/app/provas/[slug]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/coluni/[edition]` | `src/app/provas/coluni/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/coluni` | `src/app/provas/coluni/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/enem/[edition]` | `src/app/provas/enem/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/enem` | `src/app/provas/enem/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/etec/2026-2` | `src/app/provas/etec/2026-2/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/etec/[edition]` | `src/app/provas/etec/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/etec` | `src/app/provas/etec/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/fuvest/[year]` | `src/app/provas/fuvest/[year]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/fuvest` | `src/app/provas/fuvest/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifam` | `src/app/provas/ifam/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifba/[edition]` | `src/app/provas/ifba/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifba` | `src/app/provas/ifba/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifce/[edition]` | `src/app/provas/ifce/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifce` | `src/app/provas/ifce/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifmg/[edition]` | `src/app/provas/ifmg/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifmg` | `src/app/provas/ifmg/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifmt/[edition]` | `src/app/provas/ifmt/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifmt` | `src/app/provas/ifmt/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifrn/[edition]` | `src/app/provas/ifrn/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifrn` | `src/app/provas/ifrn/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifrs/[edition]` | `src/app/provas/ifrs/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifrs` | `src/app/provas/ifrs/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifsc/[edition]` | `src/app/provas/ifsc/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifsc` | `src/app/provas/ifsc/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifsp/[edition]` | `src/app/provas/ifsp/[edition]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/ifsp` | `src/app/provas/ifsp/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas` | `src/app/provas/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/uel/[edicao]` | `src/app/provas/uel/[edicao]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/uel` | `src/app/provas/uel/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/uerj/[edicao]` | `src/app/provas/uerj/[edicao]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/uerj` | `src/app/provas/uerj/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/unesp/[year]` | `src/app/provas/unesp/[year]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/unesp` | `src/app/provas/unesp/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/unicamp/[year]` | `src/app/provas/unicamp/[year]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/provas/unicamp` | `src/app/provas/unicamp/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/questoes/[slug]` | `src/app/questoes/[slug]/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/questoes` | `src/app/questoes/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/questoes-gratis` | `src/app/questoes-gratis/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/reembolso` | `src/app/reembolso/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/sitemap/[id]` | `src/app/sitemap/[id]/route.ts` | Alias legado: 301 |
| `/sitemaps/[tipo]/[parte]` | `src/app/sitemaps/[tipo]/[parte]/route.ts` | Alias legado: 301 |
| `/sobre` | `src/app/sobre/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/termos` | `src/app/termos/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/treino` | `src/app/treino/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/vestibulares` | `src/app/vestibulares/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/vestibulares-paulistas` | `src/app/vestibulares-paulistas/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/vestibulinho` | `src/app/vestibulinho/page.tsx` | Página pública; valida parâmetros do catálogo |
| `/videoaulas` | `src/app/videoaulas/page.tsx` | Página pública; valida parâmetros do catálogo |
