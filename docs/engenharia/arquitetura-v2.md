# Gabaru — arquitetura v2

Branch: `codex/gabaru-arquitetura-v2`. Base: `37d5fe60`. Alterações locais, sem push ou deploy.

## Resultado

Catálogo normalizado de provas e questões, busca MiniSearch com filtros combinados e URL compartilhável, rotas por banca/ano/disciplina/assunto, páginas individuais SSR, caderno de estudo com eliminação de alternativas, simulado persistente e caderno de erros, KaTeX em HTML/MathML, schemas tipados, domínio canônico www, sitemaps por tipo e índices editoriais llms.txt.

Não foram inventados enunciados, alternativas, dificuldades, datas de atualização de provas antigas, revisões humanas nem resoluções para preencher lacunas. As quatro resoluções novas são textos editoriais sobre questões existentes do ENEM 2011, com as alternativas corretas compatíveis com o gabarito já cadastrado.

## Stack e inventário real

Next.js App Router / Turbopack; React; TypeScript; Tailwind. PostgreSQL via pg e Firebase/Firebase Admin permanecem nos serviços existentes. Catálogos originais em `src/data/*.json`, transcrições ENEM em `content/enem`, Markdown em `content/questoes`, PDFs e imagens em `public`. Fontes documentais adicionais em arquivos archive e if-document-sources.

Versões efetivamente instaladas:

- next: `16.4.1`
- react: `19.3.0`
- react-dom: `19.3.0`
- typescript: `5.9.3`
- tailwindcss: `4.3.3`
- katex: `0.19.1`
- minisearch: `7.2.0`
- lucide-react: `1.73.0`
- schema-dts: `2.1.0`
- htmlhint: `1.9.2`
- @axe-core/cli: `4.14.0`
- @axe-core/playwright: `4.14.0`

- 21 instituições no cadastro; 16 com acervo e as demais explicitamente sem cadernos.
- 667 registros de cadernos/versões/documentos de prova: 432 apenas documentais, sem contagem de questões inventada; 235 com metadados de itens.
- 15268 registros de itens. O total inclui versões; não significa questões pedagógicas inéditas ou todas transcritas.
- 3503 registros com enunciado; 3022 com enunciado e ao menos quatro alternativas, disponíveis na busca com situação editorial visível.
- 14588 registros com alternativa correta cadastrada e sem resolução; 4 com resolução nova publicada; 104 anulados identificados como tais.
- Somente 4 questões têm `statusPublicacao = completa`. Os demais itens são rascunhos e ficam fora do sitemap de questões.
- Anos catalogados: 1978–2026. A relação por arquivo e suas contagens é gerada pelo comando de catálogo.

O inventário não soma novamente o índice Markdown com o JSON de treino do mesmo ENEM. Documentos adicionais são deduplicados por URL de origem; versões de prova continuam identificadas separadamente. Não há deduplicação semântica que permita anunciar um total de questões inéditas.

## Revisão de interface: antes e depois

| Antes | Depois | Motivo |
| --- | --- | --- |
| Questão selecionada por estado; correção obtida apenas após envio à API | Arquivo de enunciados/alternativas/gabaritos disponíveis no HTML inicial, com ferramentas de estudo | Leitura pública e indexação não dependem da interação |
| Busca por instituição e listas de edições | Palavra-chave + banca + ano + disciplina + assunto simultâneos, MiniSearch, GET como fallback SSR | Recortes úteis de estudo e links compartilháveis |
| Alternativas sem ferramenta de descarte | Radios nativos com labels associados e botão próprio de eliminar/restaurar | Navegação por teclado, sem div clicável |
| Placar simples por caderno | Prazo real persistido, boletim por disciplina, erros revisáveis | Continuidade e revisão do estudo |
| Layout dependente apenas da largura da viewport | Navegação também usa container queries; verificada a 320 px e 200% | Corrigir transbordamento em ampliação |
| Skip link apontando a um div | Destino em main com id e foco por página | Acesso direto ao conteúdo principal |
| Domínio sem www e redirecionamento saindo de www | Origem única https://www.gabaru.com.br, redirecionamento 301 verificado | Unificar canonical, JSON-LD e sitemaps |

As transcrições antigas que ainda precisam de revisão são identificadas. O leitor original permanece em um details próprio, para consulta da reprodução da prova. Textos-base estruturados aceitam idioma apenas no trecho correspondente. Campos de imagens e dificuldade existem no modelo; faltas de descrição ou classificação não são preenchidas por suposição.

## Arquitetura

- `scripts/gerar-catalogo.mjs`: adaptadores das fontes originais, IDs, normalização, inventário e gate editorial.
- `src/lib/catalogo/types.ts`: banca, categoria, caderno, área/disciplina, assunto, dificuldade, texto-base, imagens, alternativas, correta, anulação e publicação.
- `src/data/editorial/resolucoes.json`: sobreposições editoriais explícitas. Somente estas podem tornar questões completas quando também satisfazem os requisitos de conteúdo.
- `src/lib/catalogo/search.ts`: índice e combinação de filtros; normaliza acentos.
- `src/components/question-workspace.tsx`: conteúdo textual e fórmulas renderizados no servidor.
- `src/components/study-session.tsx`: seleção, tesourinha, feedback, atalhos opcionais, prazo, localStorage, boletim e filtro de erros. O simulado fecha a resolução na interface até finalizar; o conteúdo público continua pré-renderizado.
- `/questoes/[slug]`: páginas individuais; rascunhos têm noindex. Quatro páginas completas são pré-renderizadas. Relacionadas do mesmo assunto fornecem três próximos exercícios.
- `/banca/[slug]`, `/enem`, `/vestibulinho`, `/vestibulares`: resposta direta, tabelas nativas, fontes e curadoria.
- `/disciplina/[disciplina]`, `/assunto/[slug]`: agrupamento e links internos; sem resolução publicada, não entram no sitemap e recebem noindex.
- `/provas/[banca]/[ano]`: rotas existentes preservadas, entradas por ano para leitores nativos e fallback para acervos documentais.
- `src/lib/seo/schema-graph.ts`: EducationalOrganization, Person, LearningResource, Quiz/Question/Answer, BreadcrumbList e FAQPage vinculados por @id; somente conteúdo visível e real. O markup não é promessa de rich result do Google.

## Crawling

`/sitemap.xml` é um sitemap index explícito. Não se presume que generateSitemaps crie sozinho um índice com nomes personalizados.

| Parte | URLs | Situação |
| --- | ---: | --- |
| sitemap-hubs.xml | 22 | No índice |
| sitemap-provas.xml | 0 | Fora do índice: nenhum caderno inteiro passou pelo gate editorial |
| sitemap-disciplinas.xml | 2 | No índice |
| sitemap-questoes.xml | 4 | No índice |

Questões completas têm lastmod da atualização editorial efetiva; datas desconhecidas são omitidas. Parâmetros de filtro não aparecem nos XMLs. Robots permite os agentes pedidos e bloqueia APIs, conta/painel e combinações de filtros. llms.txt e llms-full.txt são mapas informativos do catálogo, sem alegação de benefício garantido de ranking ou citação.

## Validação real

- `npx tsc --noEmit`: saída 0, zero erros.
- `npm run lint`: saída 0, zero erros, 12 avisos herdados (principalmente imagens originais).
- `npm run build`: saída 0; geração de catálogo é offline e determinística.
- `npm run validar:catalogo`: quatro testes passaram.
- `npm run validar:estudo`: seis cenários passaram: HTML sem JS/MathML; seleção, eliminação e persistência; prazo/finalização e erros; atalhos; filtros com SSR; 320 px e 200%.
- XML, URL canônica, gate editorial, robots e llms: verificações HTTP passaram.
- HTMLHint e axe-core: quatro páginas retornaram 200, zero erros no HTMLHint, zero violações no axe, um h1 e um main, sem transbordamento em 390 px.

Rotas verificadas: `/`, `/banca/enem`, `/provas/enem/enem-2011-d2`, `/questoes/enem-2011-d2-q138`. Também há verificações funcionais em `/questoes` e na questão 141 com MathML.

O HTMLHint mantém sintaxe, pares de tags, atributos e IDs verificados. Há quatro exceções de capitalização para atributos HTML válidos emitidos pelo serializador React/Next: charSet, fetchPriority, noModule e srcSet. Não houve remoção de regras do axe para ocultar violações.

Os logs reais e capturas ficam em `docs/engenharia/evidencias-v2`. A varredura automatizada cobre as rotas e estados registrados, sem certificar manualmente todas as páginas legadas.

## Reprodução

Use Node 24 (ambiente validado). Execute `npm ci`, `npm run build`, `npm run start`. Em outro terminal:

```sh
export PLAYWRIGHT_BROWSERS_PATH=./work/browsers
npx playwright install chromium
npm run validar:catalogo
npm run validar:interface
npm run validar:estudo
npm run validar:crawl
```

`npm run build:release` prepara os PDFs e depois compila; deve ser o comando da publicação que precisa das reproduções locais dos cadernos. `npm run acervo:prepare` preserva a preparação separada de PDFs. Esse comando consulta fontes externas e pode falhar quando um fornecedor está indisponível; não faz parte da compilação offline. O build anterior falhou em fetch externo do ENEM, razão dessa separação. Nenhuma falha foi repetida sem tratamento da causa.

## Próximos passos editoriais e publicação

1. Revisar transcrições, alternativas, anexos e idioma dos textos-base antes de promover registros a completa; expandir resoluções em lotes de revisão humana.
2. Completar disciplinas/assuntos/dificuldades ainda pendentes e descrições reais de imagens; não promover OCR apenas por ter texto.
3. Validar a alteração de domínio no ambiente de hospedagem, inclusive DNS/TLS e variáveis. Previews podem definir NEXT_PUBLIC_INDEXAR=0.
4. Após publicação, cadastrar https://www.gabaru.com.br/sitemap.xml no Google Search Console e no Bing Webmaster Tools. Não cadastrar o sitemap de provas vazio; ele será incluído automaticamente quando tiver conteúdo elegível.
5. Acompanhar canonicals, redirects e páginas excluídas no Search Console. A ampliação do conteúdo indexável depende da revisão editorial, não de quantidade de URLs geradas.

## Evolução posterior: Fase 2

O estado descrito acima é o encerramento da primeira passagem. A classificação em três níveis, a ingestão local e o piloto posterior de 20 resoluções estão documentados em [fase2/README.md](fase2/README.md), com números e evidências próprios. Os commits da primeira passagem foram enviados; a Fase 2 permanece sem push conforme sua ordem específica.
