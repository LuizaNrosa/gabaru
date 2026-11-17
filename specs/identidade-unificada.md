# Contrato da identidade unificada

Base: `a09c4ee0`, PR #111. Branch de implementação: `feat/identidade-unificada-capas-sumarios`.

- Papel `#f8f8f2`, tinta `#123d35`, acento de marca `#c8501e`; texto de acento `#9c2b12`. Cores semânticas auxiliares não se tornam cores de marca/capa.
- Logo geométrico G, wordmark minúsculo em Archivo 900 real, ponto laranja. Fontes locais, sem requisições a Google Fonts no navegador.
- Capas editáveis, sem raster, IA ou degradês: 14 disciplinas, 10 bancas e 6 livros cadastrados, em A4, quadrado e miniatura. Os 14 volumes de disciplina são projetos editoriais; não se tornam livros publicados pela existência da capa.
- Nenhum carimbo afirma edital conferido, questões resolvidas ou edição revisada sem comprovação. Material planejado usa “Em preparação editorial”.
- Sumário público lista todos os capítulos, estado editorial, contagem calculada de questões elegíveis e tempo aproximado apenas quando existe conteúdo. Prévia nova: `noindex, follow`, sem inclusão no sitemap nesta entrega.
- Leitor exige sessão Firebase no servidor, inclusive com billing desligado. Sem download autoral de PDF/EPUB e sem serialização pública do livro inteiro.
- Sumário do capítulo usa âncoras nativas, `aria-current`, progresso e posição sticky apenas onde cabe. Coluna de leitura em 68ch. Em 320px, tabelas largas são regiões focáveis com rolagem por teclado.
- Nas quatro amostras, 12 blocos originais de definição têm 40–60 palavras e exemplo resolvido, pegadinha e prática por assunto real. Fallback de assunto inexistente é explicitamente a disciplina. Não se promete conteúdo privado indexável por robôs.
- Grafos tipados Book/Chapter/LearningResource/BreadcrumbList; FAQPage somente com respostas visíveis. Estado de preparação preservado no grafo.
- Titles indexáveis: 30–60 caracteres incluindo marca; descriptions: 120–160. Títulos visíveis permanecem integrais.
- Sitemaps: mesmo conjunto anterior de 3.372 URLs, sem duplicatas, lastmod ISO em todas. Aliases 301, Tier 0 excluído e noindex. Auditor lê todos os XMLs e verifica metadados efetivamente emitidos por todas as URLs declaradas.
- Aceitação: typecheck Web/APK, lint sem erros, testes Node/Vitest/E2E, build, HTMLHint, axe a 1440/390/320 e Linkinator integral. Evidências e limites em `docs/engenharia/identidade-unificada.md`.
- Não ativar cobrança, alterar questionários oficiais, publicar rascunhos, rastrear PDFs privados ou artefatos temporários.
