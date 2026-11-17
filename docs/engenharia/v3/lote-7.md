# Lote 7 — SEO e GEO

Canonical e redirect 301 para `https://gabaru.com.br` já existiam e foram preservados. Robots explicita agentes solicitados, bloqueia áreas privadas/API e filtros. Questões Tier 0 mantêm noindex/follow inclusive quando faltam alternativas; o texto não é inventado. Sitemaps públicos selecionam somente N1/N2 (tiers correspondentes), com máximo 2.000 URLs por parte.

Mantidos o índice `/sitemap.xml`, quatro nomes XML existentes e fragmentos `/sitemaps/...`, para preservar submissões anteriores. Acrescentado `src/app/sitemap.ts` com `generateSitemaps`: aliases nativos Next por grupo/parte, sem duplicar URLs dentro de um sitemap. Livros e videoaulas entram no hub; capítulos pagos não entram em sitemap ou llms.

Grafo schema-dts liga organização, autoria, recursos e quiz; vídeos opcionais recebem VideoObject ligado à questão. Nenhum vídeo, uploadDate ou resolução foi fabricado. FAQ permanece restrito ao conteúdo fornecido pela página. llms inclui catálogo de livros internos e as questões validadas, sem texto privado ou dados de aluno.

O primeiro build detectou conflito real entre metadata e `app/sitemap.xml/route.ts`. Causa corrigida antes de repetir: implementação do índice movida para `/sitemap-index.xml`, com rewrite interno de `/sitemap.xml` no Next. O endereço declarado em robots e Search Console permanece `/sitemap.xml`; os aliases metadata não disputam mais o arquivo de rota.
