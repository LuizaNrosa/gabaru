# Blindagem do esqueleto técnico

**Goal:** substituir a geração de SEO por next-sitemap, centralizar ambiente com t3-env e filtros com nuqs, completar rotas e validar antes do push autorizado.

**Architecture:** manifesto público único com fingerprints e datas reais estáveis; next-sitemap gera famílias estáticas de até 2.000 URLs e índice/robots no postbuild; rotas antigas apenas redirecionam. Ambiente opcional sem segredos por padrão, mas valores configurados são validados e pagamentos permanecem bloqueados pelas flags. Estado de filtros no adaptador Next do nuqs, com SSR e canonical limpo. Conteúdo privado e branding preservados.

- [x] Instalar três bibliotecas e validar licenças (919/919, 0 bloqueadas).
- [x] Testes de sitemap sem duplicidade, lastmod estável, ambiente e filtros.
- [x] Migração para next-sitemap; ambiente central; filtros nuqs; rotas institucionais e metadados.
- [x] tsc/build/postbuild/HTMLHint/Playwright/axe e auditor XML integral.
- [x] Revisar diff e limpar temporários; entrega pronta para commit e push autorizado, acompanhados pelo PR.

Execução direta sem delegação. Não usar data de build como atualização editorial fictícia. Não incluir leitores autenticados ou Tier 0 no índice. Campos e segredos opcionais não ativam serviços; valores inválidos não são ignorados. As exceções LGPL herdadas de Sharp/libvips permanecem limitadas à allowlist já aprovada, sem novos GPL/AGPL/SSPL.
