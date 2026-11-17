# Identidade unificada — execução dos dois anexos

Base: a09c4ee0. Branch: feat/identidade-unificada-capas-sumarios. Execução direta, sem delegação.

Direção aprovada: Papel de Prova + Carimbo. Papel #f8f8f2, tinta #123d35, acento #c8501e; superfícies editoriais neutras/sálvia. Tipografia local Atkinson Next/Mono e Archivo com peso real para títulos vetoriais. Sem geração de imagem por IA, degradês, mascotes ou acentos concorrentes em marca/capas.

Contratos: preservar exatamente o conjunto das 3.372 URLs existentes e aliases 301; páginas novas de sumário fora do sitemap por enquanto; leitores exigem sessão e respeitam billing; nenhuma venda ativada. Nenhuma alegação de edital conferido ou exercício resolvido será fabricada. Capas de materiais sem validação identificam preparação editorial. Contagens derivam do acervo e do conteúdo disponível.

As duas propostas divergem na legenda do carimbo dos livros: “EDITAL / CONFERIDO / 2026” e “TEORIA / + QUESTÕES / RESOLVIDAS”. São variantes condicionadas a comprovação, não atributos automaticamente atribuídos aos 14 volumes planejados. Também não se presume que todo CTA tem 12 questões: o número é calculado.

## Entrega implementada

- Tokens centralizados em `src/app/tokens.css`, importados por `globals.css`; APK usa a mesma paleta. Aliases existentes de Tailwind foram preservados para não quebrar componentes. Sky/ochre permanecem apenas como apoio semântico previsto no segundo anexo.
- G geométrico, wordmark minúsculo Archivo 900 e ponto laranja na interface, favicon e capas. Carimbo CSS com borda dupla e -7°; capas com -9°. Todos os SVGs usam apenas papel, tinta e laranja.
- Gerador determinístico: 14 disciplinas + 10 bancas + 6 livros efetivamente cadastrados, cada um em 1240×1754, 1200×1200 e miniatura 320×452: **90 SVGs**. Os 14 projetos por disciplina não foram apresentados como 14 livros publicados.
- Archivo local com eixo real 100–900 na web; instâncias reais 400/900 incorporadas às capas para portabilidade. Ajuste de títulos usa métricas reais de glifos, registradas com hash em `src/data/archivo-metricas.json`. Origem Google Fonts/Archivo, licença OFL em `public/fonts/archivo/OFL.txt`; nenhuma nova dependência de produção foi adicionada. Subsetting foi ferramenta local de preparação, não etapa exigida do build.
- Seis cards de catálogo com capas e sumários; seis novas prévias públicas `/livros/[livroSlug]`. Os 27 links de capítulos anteriores permanecem. Contagens de questões são calculadas do acervo elegível; tempos usam aproximadamente 180 palavras/minuto, apenas em conteúdo disponível.
- Leitor com coluna 68ch, navegação sticky desktop, âncoras nativas e indicador de seção/progresso. Em mobile a navegação volta ao fluxo normal. Links antigos de seção continuam funcionando.
- Quatro amostras receberam 12 definições originais de 40–60 palavras, exemplos passo a passo, pegadinhas e prática contextual com assuntos reais. Sem inferir gabarito ou inventar questões. Capítulos planejados permanecem explicitamente em preparação.
- JSON-LD tipado conecta Book, Chapter, LearningResource, autoria, organização e BreadcrumbList. FAQPage existe somente junto das respostas visíveis. A descrição de status editorial acompanha o estado real de cada capítulo.
- Titles de páginas indexáveis limitados a 30–60 caracteres incluindo marca; descriptions a 120–160. H1/H2 visíveis permanecem completos. Catálogo SEO/LLMs sincronizados, sem inserir novas URLs nas famílias de sitemap.

## Preservação de indexação, acesso e produto

O conjunto anterior de **3.372 URLs** permanece integral: hubs 28, provas 28, disciplinas/assuntos 107, questões 3.208, livros 1. Cinco famílias, seis XMLs de conteúdo e um índice. As novas prévias públicas recebem `noindex, follow` e ficam fora dos sitemaps nesta entrega para cumprir o contrato de conjunto idêntico; não substituímos URLs antigas por novas apenas para manter a contagem.

As 27 rotas de capítulos e `/painel` continuam exigindo sessão Firebase validada no servidor. Os blocos GEO dos capítulos são HTML do servidor **após autenticação**; não se alega que robôs anônimos possam indexar conteúdo protegido. Os sumários públicos expõem apenas metadados e tópicos. Nenhum livro inteiro foi colocado em JSON público, nenhum download autoral foi criado e o billing permanece desligado por padrão.

## Contraste medido

Método: luminância relativa sRGB e razão `(Lmaior + 0,05)/(Lmenor + 0,05)` conforme WCAG. Valores calculados, sem copiar números dos anexos.

| Texto / fundo | Razão | Aplicação |
| --- | ---: | --- |
| Ink / paper | 11,292:1 | AAA para texto normal |
| Ink-soft / paper | 7,493:1 | AAA para texto normal |
| Ink-muted / paper | 6,094:1 | AA para texto normal; o valor é inferior ao 6,45 presumido no anexo |
| Stamp-ink / paper | 7,118:1 | AAA para texto normal e links |
| Paper / stamp | 4,262:1 | AA para texto grande; botões primários em 20px/800, sem alegar AA para texto pequeno nessa combinação |
| Ink / sage-soft | 10,401:1 | AAA para texto normal na sidebar |
| Stamp-ink / paper-elevated | 6,268:1 | AA para texto normal |

Tabela numérica e auditoria de traces: [contraste-e-traces.json](identidade-unificada-evidencias/contraste-e-traces.json).

## Validação executada

| Verificador | Resultado real | Evidência |
| --- | --- | --- |
| `npx tsc --noEmit` Web | Código 0, sem diagnósticos | Registro de comandos abaixo |
| `npm --prefix APK run typecheck` | Código 0, sem diagnósticos | [tsc-apk.log](identidade-unificada-evidencias/tsc-apk.log) |
| `npm run lint` | 0 erros, 118 warnings herdados, mesma contagem da base | [lint.log](identidade-unificada-evidencias/lint.log) |
| `npm test` | 290 passaram, 0 falhas | [unitarios.log](identidade-unificada-evidencias/unitarios.log) |
| `npx vitest run` | 25 passaram, 0 falhas | [vitest.log](identidade-unificada-evidencias/vitest.log) |
| `npm run build` + pre/postbuild | Código 0; 919 pacotes auditados, nenhuma licença bloqueada | [build.log](identidade-unificada-evidencias/build.log) |
| `npx htmlhint '.next/server/app/**/*.html'` | 700 HTMLs, 0 erros | [htmlhint.log](identidade-unificada-evidencias/htmlhint.log) |
| E2E da identidade | 4 testes passaram, 0 falhas | [e2e-identidade.log](identidade-unificada-evidencias/e2e-identidade.log) |
| Regressão de coleção/esqueleto | 10 testes passaram, 0 falhas | [e2e-regressao.log](identidade-unificada-evidencias/e2e-regressao.log) |

E2E da identidade: 12 rotas × 3 larguras (1440, 390 e 320) = **36 auditorias axe/HTML**, sem violações sérias/críticas e sem transbordamento horizontal do documento. Inclui Home, catálogo, duas prévias, provas, questão Tier 2, painel, quatro amostras e um capítulo em preparação. Regressão anterior acrescenta 24 auditorias axe/HTML nas duas larguras de seus projetos. Total destas execuções: **60 auditorias de página**, sem alegar certificação WCAG integral ou cobertura de todos os estados possíveis.

Para as rotas privadas foi usada infraestrutura local descartável: Firebase Admin verificando cookie com o protocolo de emulador Auth e emulador Firestore real, sem bypass no código de produto. A fixture foi removida do ambiente de release. Isso valida o HTML autenticado e a navegação do leitor; não equivale a um login real no projeto Firebase de produção.

Typecheck APK: dependências do lockfile existente foram instaladas em área RAM isolada; `src/` usado na checagem foi comparado byte a byte ao atual. Não foram alterados o lockfile nem o SDK do aplicativo.

Traces Next: 111 manifests analisados; maior conjunto de arquivos com **47.166.303 bytes (44.98 MiB)**, abaixo de 250 MiB. Nenhum arquivo privado de `work/` ou `bibliografia-pdfs/` incluído. É medição local do conjunto rastreado, não medição de bundle final de uma implantação Vercel.

## Causas encontradas e corrigidas durante a validação

- Título da Home ultrapassava 60 caracteres com o sufixo: corrigida a montagem central de metadados e adicionada verificação do HTML efetivamente emitido.
- Regra de sidebar atingia também o aside interno de pegadinha: seletor limitado ao filho direto do layout.
- Header e URLs longas de citações extrapolavam 320px: ajustados encaixe do cabeçalho e quebra de referências, sem cortar o texto.
- Barra de progresso nativa ignorava a apresentação esperada de `accent-color` no Chromium: definidos fundos dos pseudo-elementos WebKit/Gecko, mantendo o elemento semântico `progress`.
- Tabela larga no leitor não era alcançável por teclado: wrapper virou região nomeada e focável; teste pressiona ArrowRight e confirma deslocamento.
- Ensaio de capas tentava substituir o body de uma página React: isolado em documento de teste independente, eliminando disputa com hidratação.
- Primeiro comando de regressão procurou navegador Playwright não instalado: execução corrigida para o Chromium existente em `/usr/bin/chromium`, sem instalar outro navegador nem repetir o erro.

## Evidência visual

- [Catálogo desktop](identidade-unificada-evidencias/catalogo-desktop-final.png)
- [Catálogo em 320px](identidade-unificada-evidencias/320-catalogo.png)
- [Leitor em 390px](identidade-unificada-evidencias/390-leitor.png)
- [Capas em 120px e escala de cinza](identidade-unificada-evidencias/capas-120px-pb.png)
- [Barra de progresso com cor renderizada conferida](identidade-unificada-evidencias/progresso-laranja-final.png)
- [Prova binária P&B](identidade-unificada-evidencias/capas-120px-impressao-1bit.png)

As miniaturas priorizam título e identidade. A prova de 120px não implica que texto editorial miúdo seja legível nessa escala; o SVG A4 mantém o texto integral e editável para leitura e impressão em tamanho apropriado.

Os logs versionados normalizam somente espaços finais e quebras de progresso do terminal, preservando todas as linhas de resultados. Os arquivos originais da execução permanecem em `work/identidade/`, fora do Git.

## Reprodução

```bash
node scripts/gerar-capas.mjs
npm run lint
npx tsc --noEmit
npm test
npx vitest run
npm run build
npx htmlhint '.next/server/app/**/*.html'
CHROMIUM_EXECUTABLE=/usr/bin/chromium npx playwright test tests/e2e/colecao-vestibulinho.spec.ts tests/e2e/esqueleto.spec.ts
node scripts/auditar-urls-linker.mjs
```

O teste de identidade usa `CHROMIUM_EXECUTABLE=/usr/bin/chromium npx playwright test tests/e2e/identidade.spec.ts --project=desktop`. Sem `IDENTIDADE_FIXTURE`, cobre as seis rotas públicas por largura e a prova de capas; a execução autenticada registrada usou uma fixture local em arquivo ignorado. Esse arquivo e suas credenciais sintéticas não fazem parte da entrega versionada.

## Rastreamento final da compilação entregue

`node scripts/auditar-urls-linker.mjs`: código 0. **6220 URLs/recursos internos**: 6188 respostas 200 e 32 redirecionamentos esperados (4 aliases 301 e 28 proteções 307: painel + 27 leitores). Zero links quebrados e zero falhas de contrato.

As **3.372 URLs** de sitemap responderam 200, sem duplicatas e com lastmod ISO válido em todas. O HTML emitido por todas as 3.372 páginas foi conferido: **zero titles/descriptions fora das faixas 30–60/120–160**. Três amostras de Tier 0 preservaram `noindex, follow` e continuam fora dos XMLs.

- [Placar e falhas (listas vazias)](identidade-unificada-evidencias/urls.json)
- [Log integral do rastreamento](identidade-unificada-evidencias/urls.log)
- [Metadados literais das 3.372 respostas locais](identidade-unificada-evidencias/metadados-3372.json)
- [Tabela completa de URLs, HTTP e páginas de origem](v3/relatorio-urls-linker.md)
- [Comparação de conjuntos e validação SVG](identidade-unificada-evidencias/preservacao.json)
- [Registro dos comandos de tipagem, lint e testes](identidade-unificada-evidencias/comandos.json)

As requisições foram feitas ao servidor Next compilado local; os links canônicos nas tabelas não representam uma auditoria de produção. Após a última correção visual, os 14 E2E foram reexecutados e o rastreamento integral repetido. Os cinco contratos específicos de identidade também foram reexecutados, todos aprovados. Não houve repetição de erro sem correção da causa raiz.

## Arquivos SVG gerados

Fonte de verdade de dimensões e SHA-256: `src/data/capas-manifesto.json`. Cada caminho está listado abaixo; os outros arquivos de fonte e dados acompanham o commit.


| Arquivo | Dimensões |
| --- | --- |
| `public/capas/livro-matematica.svg` | 1240 × 1754 |
| `public/capas/social-livro-matematica.svg` | 1200 × 1200 |
| `public/capas/mini-livro-matematica.svg` | 320 × 452 |
| `public/capas/livro-fisica.svg` | 1240 × 1754 |
| `public/capas/social-livro-fisica.svg` | 1200 × 1200 |
| `public/capas/mini-livro-fisica.svg` | 320 × 452 |
| `public/capas/livro-portugues.svg` | 1240 × 1754 |
| `public/capas/social-livro-portugues.svg` | 1200 × 1200 |
| `public/capas/mini-livro-portugues.svg` | 320 × 452 |
| `public/capas/livro-biologia.svg` | 1240 × 1754 |
| `public/capas/social-livro-biologia.svg` | 1200 × 1200 |
| `public/capas/mini-livro-biologia.svg` | 320 × 452 |
| `public/capas/livro-quimica.svg` | 1240 × 1754 |
| `public/capas/social-livro-quimica.svg` | 1200 × 1200 |
| `public/capas/mini-livro-quimica.svg` | 320 × 452 |
| `public/capas/livro-historia.svg` | 1240 × 1754 |
| `public/capas/social-livro-historia.svg` | 1200 × 1200 |
| `public/capas/mini-livro-historia.svg` | 320 × 452 |
| `public/capas/livro-geografia.svg` | 1240 × 1754 |
| `public/capas/social-livro-geografia.svg` | 1200 × 1200 |
| `public/capas/mini-livro-geografia.svg` | 320 × 452 |
| `public/capas/livro-literatura.svg` | 1240 × 1754 |
| `public/capas/social-livro-literatura.svg` | 1200 × 1200 |
| `public/capas/mini-livro-literatura.svg` | 320 × 452 |
| `public/capas/livro-ingles.svg` | 1240 × 1754 |
| `public/capas/social-livro-ingles.svg` | 1200 × 1200 |
| `public/capas/mini-livro-ingles.svg` | 320 × 452 |
| `public/capas/livro-espanhol.svg` | 1240 × 1754 |
| `public/capas/social-livro-espanhol.svg` | 1200 × 1200 |
| `public/capas/mini-livro-espanhol.svg` | 320 × 452 |
| `public/capas/livro-filosofia.svg` | 1240 × 1754 |
| `public/capas/social-livro-filosofia.svg` | 1200 × 1200 |
| `public/capas/mini-livro-filosofia.svg` | 320 × 452 |
| `public/capas/livro-sociologia.svg` | 1240 × 1754 |
| `public/capas/social-livro-sociologia.svg` | 1200 × 1200 |
| `public/capas/mini-livro-sociologia.svg` | 320 × 452 |
| `public/capas/livro-artes.svg` | 1240 × 1754 |
| `public/capas/social-livro-artes.svg` | 1200 × 1200 |
| `public/capas/mini-livro-artes.svg` | 320 × 452 |
| `public/capas/livro-interdisciplinar.svg` | 1240 × 1754 |
| `public/capas/social-livro-interdisciplinar.svg` | 1200 × 1200 |
| `public/capas/mini-livro-interdisciplinar.svg` | 320 × 452 |
| `public/capas/capa-etec.svg` | 1240 × 1754 |
| `public/capas/social-etec.svg` | 1200 × 1200 |
| `public/capas/mini-capa-etec.svg` | 320 × 452 |
| `public/capas/capa-enem.svg` | 1240 × 1754 |
| `public/capas/social-enem.svg` | 1200 × 1200 |
| `public/capas/mini-capa-enem.svg` | 320 × 452 |
| `public/capas/capa-coluni.svg` | 1240 × 1754 |
| `public/capas/social-coluni.svg` | 1200 × 1200 |
| `public/capas/mini-capa-coluni.svg` | 320 × 452 |
| `public/capas/capa-fuvest.svg` | 1240 × 1754 |
| `public/capas/social-fuvest.svg` | 1200 × 1200 |
| `public/capas/mini-capa-fuvest.svg` | 320 × 452 |
| `public/capas/capa-unicamp.svg` | 1240 × 1754 |
| `public/capas/social-unicamp.svg` | 1200 × 1200 |
| `public/capas/mini-capa-unicamp.svg` | 320 × 452 |
| `public/capas/capa-unesp.svg` | 1240 × 1754 |
| `public/capas/social-unesp.svg` | 1200 × 1200 |
| `public/capas/mini-capa-unesp.svg` | 320 × 452 |
| `public/capas/capa-ifsp.svg` | 1240 × 1754 |
| `public/capas/social-ifsp.svg` | 1200 × 1200 |
| `public/capas/mini-capa-ifsp.svg` | 320 × 452 |
| `public/capas/capa-ifsc.svg` | 1240 × 1754 |
| `public/capas/social-ifsc.svg` | 1200 × 1200 |
| `public/capas/mini-capa-ifsc.svg` | 320 × 452 |
| `public/capas/capa-ifrn.svg` | 1240 × 1754 |
| `public/capas/social-ifrn.svg` | 1200 × 1200 |
| `public/capas/mini-capa-ifrn.svg` | 320 × 452 |
| `public/capas/capa-ifmg.svg` | 1240 × 1754 |
| `public/capas/social-ifmg.svg` | 1200 × 1200 |
| `public/capas/mini-capa-ifmg.svg` | 320 × 452 |
| `public/capas/livro-portugues-interpretacao-ifs-etec.svg` | 1240 × 1754 |
| `public/capas/social-livro-portugues-interpretacao-ifs-etec.svg` | 1200 × 1200 |
| `public/capas/mini-livro-portugues-interpretacao-ifs-etec.svg` | 320 × 452 |
| `public/capas/livro-matematica-essencial-ifs-etec.svg` | 1240 × 1754 |
| `public/capas/social-livro-matematica-essencial-ifs-etec.svg` | 1200 × 1200 |
| `public/capas/mini-livro-matematica-essencial-ifs-etec.svg` | 320 × 452 |
| `public/capas/livro-ciencias-natureza-ifs-etec.svg` | 1240 × 1754 |
| `public/capas/social-livro-ciencias-natureza-ifs-etec.svg` | 1200 × 1200 |
| `public/capas/mini-livro-ciencias-natureza-ifs-etec.svg` | 320 × 452 |
| `public/capas/livro-ciencias-humanas-atualidades-etec.svg` | 1240 × 1754 |
| `public/capas/social-livro-ciencias-humanas-atualidades-etec.svg` | 1200 × 1200 |
| `public/capas/mini-livro-ciencias-humanas-atualidades-etec.svg` | 320 × 452 |
| `public/capas/livro-vestibulinho-etec.svg` | 1240 × 1754 |
| `public/capas/social-livro-vestibulinho-etec.svg` | 1200 × 1200 |
| `public/capas/mini-livro-vestibulinho-etec.svg` | 320 × 452 |
| `public/capas/livro-enem-exatas-e-linguagens.svg` | 1240 × 1754 |
| `public/capas/social-livro-enem-exatas-e-linguagens.svg` | 1200 × 1200 |
| `public/capas/mini-livro-enem-exatas-e-linguagens.svg` | 320 × 452 |
