# Capas Gabaru — Papel de Prova + Carimbo

Gerador determinístico: `node scripts/gerar-capas.mjs`. Fontes e textos permanecem editáveis em SVG. Não há imagens de IA, raster interno, degradês ou mascotes.

Paleta exclusiva das capas: papel `#f8f8f2`, tinta `#123d35`, carimbo `#c8501e`. O significado também é expresso por texto, molduras e formas, sem depender de cor. Em P&B a composição mantém os títulos e os limites das áreas.

O site usa Archivo variável local (100–900); os SVGs incorporam instâncias reais 400/900 e Atkinson Hyperlegible Mono local, com fontes WOFF2 incorporadas no SVG para leitura independente de instalações externas. Licenças OFL preservadas em `public/fonts/`.

## Arquivos e dimensões

- 14 disciplinas: `livro-[disciplina].svg`, `social-livro-[disciplina].svg`, `mini-livro-[disciplina].svg`. São projetos de volumes, não livros completos disponíveis.
- Dez bancas: `capa-[banca].svg`, `social-[banca].svg`, `mini-capa-[banca].svg`: ETEC, ENEM, COLUNI, FUVEST, UNICAMP, UNESP, IFSP, IFSC, IFRN, IFMG. Os seis nomes anteriores permanecem válidos.
- Seis livros cadastrados: `livro-[livroSlug].svg`, `social-livro-[livroSlug].svg`, `mini-livro-[livroSlug].svg`.
- Retrato A4: 1240×1754. Social: 1200×1200. Miniatura simplificada: 320×452, mantendo o viewBox editorial.

Manifesto completo com nomes, dimensões e SHA-256: `src/data/capas-manifesto.json` (90 SVGs). A imagem social padrão `public/og/gabaru.png` é uma rasterização determinística da capa social ETEC, sem geração por IA.

## Anatomia

Moldura de 3px a 56px da borda (48px nas sociais); G geométrico vazado e wordmark gabaru. com peso 900; régua dupla; kicker; disciplina/banca dominante; contexto de edital; painel com quatro eixos ou folha ilustrativa A–E; carimbo rotacionado −9° com traços externo de 8px e interno de 2,5px; rodapé GABARU · A GENTE ESTUDA JUNTO.

As bolhas ilustrativas não representam o gabarito de uma prova. Capas de acervo não atribuem uma edição a todas as provas de uma banca.

## Evidência antes de selar

“QUESTÕES / OFICIAIS / VERIFICADAS” exige caderno com qualidade aprovada no catálogo. Nos demais casos, “EM / PREPARAÇÃO / EDITORIAL”. Livros planejados ou com amostras não recebem automaticamente “EDITAL / CONFERIDO / 2026” ou “TEORIA / + QUESTÕES / RESOLVIDAS”. O componente web admite contextos homologados, condicionados à validação; o conteúdo atual permanece identificado como preparação.

Contagens são questões oficiais vinculadas, não quantidades de resoluções inventadas. Miniaturas simplificam o conteúdo secundário para preservar a leitura do assunto a 120px. A aceitação visual em navegador e o ensaio monocromático são registrados no relatório de engenharia.
