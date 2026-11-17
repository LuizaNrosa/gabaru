# Inventário de rotas App Router

Instantâneo da árvore nesta entrega. Parâmetros dinâmicos vêm do catálogo; o auditor verifica todas as URLs concretas declaradas nos sitemaps e os links internos alcançáveis. Metadados automáticos robots, llms e sitemap são cobertos pelo índice/links, além desta lista de arquivos page/route.

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
| `/assunto/[slug]` | `src/app/assunto/[slug]/page.tsx` | Página |
| `/banca/[slug]` | `src/app/banca/[slug]/page.tsx` | Página |
| `/cadastro` | `src/app/cadastro/page.tsx` | Página |
| `/checkout/teste` | `src/app/checkout/teste/page.tsx` | Página |
| `/concursos` | `src/app/concursos/page.tsx` | Página |
| `/disciplina/[disciplina]` | `src/app/disciplina/[disciplina]/page.tsx` | Página |
| `/disciplinas/[slug]` | `src/app/disciplinas/[slug]/page.tsx` | Página |
| `/enem` | `src/app/enem/page.tsx` | Página |
| `/etec` | `src/app/etec/page.tsx` | Página |
| `/institutos-federais` | `src/app/institutos-federais/page.tsx` | Página |
| `/livros/[livroSlug]/[capituloSlug]` | `src/app/livros/[livroSlug]/[capituloSlug]/page.tsx` | Página |
| `/livros` | `src/app/livros/page.tsx` | Página |
| `/login` | `src/app/login/page.tsx` | Página |
| `/materiais-gratuitos` | `src/app/materiais-gratuitos/page.tsx` | Página |
| `/nota-de-corte/cotuca` | `src/app/nota-de-corte/cotuca/page.tsx` | Página |
| `/nota-de-corte/fuvest` | `src/app/nota-de-corte/fuvest/page.tsx` | Página |
| `/nota-de-corte/ifrn` | `src/app/nota-de-corte/ifrn/page.tsx` | Página |
| `/nota-de-corte` | `src/app/nota-de-corte/page.tsx` | Página |
| `/nota-de-corte/sisu` | `src/app/nota-de-corte/sisu/page.tsx` | Página |
| `/nota-de-corte/unesp` | `src/app/nota-de-corte/unesp/page.tsx` | Página |
| `/nota-de-corte/unicamp` | `src/app/nota-de-corte/unicamp/page.tsx` | Página |
| `/nota-de-corte-coluni` | `src/app/nota-de-corte-coluni/page.tsx` | Página |
| `/nota-de-corte-ifsc` | `src/app/nota-de-corte-ifsc/page.tsx` | Página |
| `/` | `src/app/page.tsx` | Página |
| `/painel` | `src/app/painel/page.tsx` | Página |
| `/painel/premium` | `src/app/painel/premium/page.tsx` | Página |
| `/planos` | `src/app/planos/page.tsx` | Página |
| `/pre-vestibular` | `src/app/pre-vestibular/page.tsx` | Página |
| `/pre-vestibulinho` | `src/app/pre-vestibulinho/page.tsx` | Página |
| `/privacidade` | `src/app/privacidade/page.tsx` | Página |
| `/provas/[slug]/[ano]` | `src/app/provas/[slug]/[ano]/page.tsx` | Página |
| `/provas/[slug]` | `src/app/provas/[slug]/page.tsx` | Página |
| `/provas/coluni/[edition]` | `src/app/provas/coluni/[edition]/page.tsx` | Página |
| `/provas/coluni` | `src/app/provas/coluni/page.tsx` | Página |
| `/provas/enem/[edition]` | `src/app/provas/enem/[edition]/page.tsx` | Página |
| `/provas/enem` | `src/app/provas/enem/page.tsx` | Página |
| `/provas/etec/2026-2` | `src/app/provas/etec/2026-2/page.tsx` | Página |
| `/provas/etec/[edition]` | `src/app/provas/etec/[edition]/page.tsx` | Página |
| `/provas/etec` | `src/app/provas/etec/page.tsx` | Página |
| `/provas/fuvest/[year]` | `src/app/provas/fuvest/[year]/page.tsx` | Página |
| `/provas/fuvest` | `src/app/provas/fuvest/page.tsx` | Página |
| `/provas/ifam` | `src/app/provas/ifam/page.tsx` | Página |
| `/provas/ifba/[edition]` | `src/app/provas/ifba/[edition]/page.tsx` | Página |
| `/provas/ifba` | `src/app/provas/ifba/page.tsx` | Página |
| `/provas/ifce/[edition]` | `src/app/provas/ifce/[edition]/page.tsx` | Página |
| `/provas/ifce` | `src/app/provas/ifce/page.tsx` | Página |
| `/provas/ifmg/[edition]` | `src/app/provas/ifmg/[edition]/page.tsx` | Página |
| `/provas/ifmg` | `src/app/provas/ifmg/page.tsx` | Página |
| `/provas/ifmt/[edition]` | `src/app/provas/ifmt/[edition]/page.tsx` | Página |
| `/provas/ifmt` | `src/app/provas/ifmt/page.tsx` | Página |
| `/provas/ifrn/[edition]` | `src/app/provas/ifrn/[edition]/page.tsx` | Página |
| `/provas/ifrn` | `src/app/provas/ifrn/page.tsx` | Página |
| `/provas/ifrs/[edition]` | `src/app/provas/ifrs/[edition]/page.tsx` | Página |
| `/provas/ifrs` | `src/app/provas/ifrs/page.tsx` | Página |
| `/provas/ifsc/[edition]` | `src/app/provas/ifsc/[edition]/page.tsx` | Página |
| `/provas/ifsc` | `src/app/provas/ifsc/page.tsx` | Página |
| `/provas/ifsp/[edition]` | `src/app/provas/ifsp/[edition]/page.tsx` | Página |
| `/provas/ifsp` | `src/app/provas/ifsp/page.tsx` | Página |
| `/provas` | `src/app/provas/page.tsx` | Página |
| `/provas/uel/[edicao]` | `src/app/provas/uel/[edicao]/page.tsx` | Página |
| `/provas/uel` | `src/app/provas/uel/page.tsx` | Página |
| `/provas/uerj/[edicao]` | `src/app/provas/uerj/[edicao]/page.tsx` | Página |
| `/provas/uerj` | `src/app/provas/uerj/page.tsx` | Página |
| `/provas/unesp/[year]` | `src/app/provas/unesp/[year]/page.tsx` | Página |
| `/provas/unesp` | `src/app/provas/unesp/page.tsx` | Página |
| `/provas/unicamp/[year]` | `src/app/provas/unicamp/[year]/page.tsx` | Página |
| `/provas/unicamp` | `src/app/provas/unicamp/page.tsx` | Página |
| `/questoes/[slug]` | `src/app/questoes/[slug]/page.tsx` | Página |
| `/questoes` | `src/app/questoes/page.tsx` | Página |
| `/questoes-gratis` | `src/app/questoes-gratis/page.tsx` | Página |
| `/sitemap-disciplinas.xml` | `src/app/sitemap-disciplinas.xml/route.ts` | Endpoint de sitemap |
| `/sitemap-hubs.xml` | `src/app/sitemap-hubs.xml/route.ts` | Endpoint de sitemap |
| `/sitemap-index.xml` | `src/app/sitemap-index.xml/route.ts` | Endpoint de sitemap |
| `/sitemap-provas.xml` | `src/app/sitemap-provas.xml/route.ts` | Endpoint de sitemap |
| `/sitemap-questoes.xml` | `src/app/sitemap-questoes.xml/route.ts` | Endpoint de sitemap |
| `/sitemaps/[tipo]/[parte]` | `src/app/sitemaps/[tipo]/[parte]/route.ts` | Endpoint de sitemap |
| `/sobre` | `src/app/sobre/page.tsx` | Página |
| `/treino` | `src/app/treino/page.tsx` | Página |
| `/vestibulares` | `src/app/vestibulares/page.tsx` | Página |
| `/vestibulares-paulistas` | `src/app/vestibulares-paulistas/page.tsx` | Página |
| `/vestibulinho` | `src/app/vestibulinho/page.tsx` | Página |
| `/videoaulas` | `src/app/videoaulas/page.tsx` | Página |
