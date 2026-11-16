> Registro histórico da primeira passagem. O estado atual está em [arquitetura-v2.md](arquitetura-v2.md).

# Gabaru — Lote 0 e inventário inicial

Base: LuizaNrosa/gabaru, main, commit 37d5fe6. Alterações locais; sem push ou deploy.

## Lote 0

Instalações solicitadas executadas sequencialmente com logs individuais. 69 SKILL.md instalados. schema-markup foi renomeada pelo mantenedor para schema; a instalação corrigida teve sucesso. impeccable instalado em escopo de projeto. schema-dts já existia; adicionados htmlhint e @axe-core/cli. Não foi encontrado KaTeX ou renderizador MathML nas dependências declaradas.

Lidas as instruções de interface-review, better-layout, better-typography, landing-page-design, seo-audit e schema (nome atual de schema-markup); também consultada emil-design-eng. As regras de marcação e conteúdo do pedido prevalecem sobre preferências visuais conflitantes das skills.

O script de lint usava next lint, removido no Next 16. Corrigido para eslint src, criada configuração flat e alinhado eslint-config-next ao Next 16.4.1. O lint agora executa e revela 13 erros e 13 avisos preexistentes no código de aplicação. Não foram desabilitadas regras para produzir aprovação artificial.

## Inventário — Lote 1 (somente leitura da aplicação)

- Stack declarada: Next ^16.4.1, App Router, React ^19, TypeScript ^5.7, Tailwind ^4. PostgreSQL (pg), Firebase/Firebase Admin; conteúdo em src/data/*.json, content/, PDFs e imagens em public/acervo, partes em acervo-parts. Os scripts prebuild verificam, recompõem e paginam PDFs.
- 62 arquivos page.tsx. Hubs existentes: /enem, /etec, /institutos-federais, /vestibulares-paulistas, /provas. Edições: /provas/enem/[id], /provas/etec/[edition] e rotas específicas por instituição/ano. Não pressupor que /vestibulinho/etec, /vestibulinho/fatec ou /questoes/[slug] já existam.
- robots.ts: depende de NEXT_PUBLIC_INDEXAR=1; caso contrário bloqueia tudo. Quando liberado bloqueia /api/ e /painel; falta política de filtros. Base padrão usa domínio sem www.
- sitemap.ts: arquivo único, fontes dos catálogos, deduplicação via Set. Não inventa lastmod, pois os dados não guardam datas confiáveis. Sem índice modular. Base padrão sem www. Precisará conferir completude do conteúdo, não só presença no catálogo.
- public/llms.txt já existe. llms-full.txt não foi encontrado.
- src/app/layout.tsx já usa lang=pt-BR e skip link para #conteudo. O destino é div e o main precisa ser verificado por rota antes de alterar o shell.
- Cards: exam-collection.tsx já usa article, headings, listas e links; acervo-busca.tsx contém Link de cartão e div de layout. Nem todo div é erro semântico.
- Filtros: acervo-busca.tsx usa input search com label associado e anúncio aria-live; busca local, sem parâmetros infinitos neste componente.
- Questões: enem-exam-reader.tsx usa estado de índice e imagem do caderno; apenas a questão selecionada aparece. A transcrição fica em details e não fornece texto completo das alternativas. A correção vem de API após finalizar. A diretiva use client, isoladamente, não prova ausência de SSR; o problema concreto é o recorte condicionado ao estado e o gabarito tardio.
- Alternativas: leitores ENEM/ETEC já têm fieldset, legend, inputs radio e labels envolventes. Falta publicar texto integral das alternativas no ENEM, comando completo no legend e type=button em vários controles. Não foi comprovado div clicável como alternativa nestes leitores.
- Imagens: alt genérico de página/recorte, sem descrição pedagógica do gráfico/charge. Descrição real requer revisar cada figura; não gerar alt fictício a partir do número.
- Placar: ENEM apresenta resultado condicionado a finished/score, com role=status. Não foi identificado cronômetro dedicado nos componentes examinados.
- src/lib/exam-public.ts remove deliberadamente answer e texto das páginas. Essa política atual conflita com a publicação editorial solicitada e precisa ser tratada junto com os consumidores/API/testes, sem expor dados de conta.
- Autoria atual: Luiza Nascimento Rosa em layout/seo e copyright. A instrução de adicionar Felipe como educador não autoriza apagar autoria técnica/copyright de Luiza nem inventar credenciais.
- O leitor ETEC declara que resoluções comentadas ainda não estão disponíveis. Não é possível emitir explicações inexistentes em acceptedAnswer; conteúdo incompleto deve ficar fora do sitemap de questões.

## Plano de arquivos por lote

| Lote | Arquivos e escopo | Gate |
| --- | --- | --- |
| 0 | .agents/skills, .codex, skills-lock.json, package*.json, eslint.config.mjs | instalações e baseline documentados |
| 1 | relatório e plano, sem alterar aplicação | inventário revisável |
| 2 | src/app/robots.ts, src/app/sitemap.ts, handlers de índice/subsitemaps, src/lib/seo (origem e elegibilidade), public/llms*.txt | build e XML parseado |
| 3 | src/lib/seo/schema-graph.ts, json-ld.tsx e páginas elegíveis | tsc e coerência com conteúdo visível |
| 4 | layout, header/footer, ui, leitores por instituição, treino-app, globals.css | HTMLHint e interação acessível |
| 5 | hubs existentes e componentes editoriais compartilhados, autoria pedagógica e fontes oficiais | build e conteúdo no HTML inicial |
| 6 | scripts verificadores e evidências Home/Hub/Questão | tsc, build, XML/robots, HTMLHint e axe |

Atenção de arquitetura: generateSitemaps cria endpoints de partes, mas não substitui automaticamente um sitemap index na URL e nomes personalizados solicitados. Definir um índice explícito se forem mantidos sitemap-institucional.xml, sitemap-provas.xml e sitemap-questoes.xml.

## Validações

TypeScript inicial: exit 0, zero erros. Lint configurado: exit 1, 13 erros e 13 avisos. Os caminhos/linhas completos estão em lint-configured.log. Exemplos: folha-de-respostas.tsx:55, nota-corte-coluni-tool.tsx:131, nota-corte-ifsc-tool.tsx:182, nota-corte-tool.tsx:328, seletor-nota-de-corte.tsx:55, treino-app.tsx:78, use-saved-progress.ts:11/12/14/32, auth-context.tsx:67.

Primeira execução de npm run build: ENOENT no acervo omitido pelo clone parcial (restore-acervo-parts.mjs:33). Corrigido recuperando assets do clone completo. Segunda execução: ENOSPC na paginação (paginar-etec.mjs:67). Clones redundantes removidos e 3,4 GB recuperados; nova execução registrada separadamente. Nenhum erro foi repetido duas vezes pela mesma causa.

Nenhuma certificação de HTML/WCAG ou de build aprovado é declarada sem evidência. Lotes 2–6 não implementados nesta entrega inicial.

## Skills instaladas

- `.agents/skills/afk/SKILL.md`
- `.agents/skills/animate-expo/SKILL.md`
- `.agents/skills/animate/SKILL.md`
- `.agents/skills/animation-performance/SKILL.md`
- `.agents/skills/animation-vocabulary/SKILL.md`
- `.agents/skills/apple-design/SKILL.md`
- `.agents/skills/ask-emil/SKILL.md`
- `.agents/skills/ask-sonner/SKILL.md`
- `.agents/skills/better-accessibility/SKILL.md`
- `.agents/skills/better-colors/SKILL.md`
- `.agents/skills/better-interface/SKILL.md`
- `.agents/skills/better-layout/SKILL.md`
- `.agents/skills/better-typography/SKILL.md`
- `.agents/skills/better-ui/SKILL.md`
- `.agents/skills/better-writing/SKILL.md`
- `.agents/skills/break-ui/SKILL.md`
- `.agents/skills/break/SKILL.md`
- `.agents/skills/build-design/SKILL.md`
- `.agents/skills/choreograph/SKILL.md`
- `.agents/skills/emil-design-eng/SKILL.md`
- `.agents/skills/explain-interface/SKILL.md`
- `.agents/skills/find-animation-opportunities/SKILL.md`
- `.agents/skills/gestures/SKILL.md`
- `.agents/skills/impeccable/SKILL.md`
- `.agents/skills/improve-animations/SKILL.md`
- `.agents/skills/interface-review/SKILL.md`
- `.agents/skills/landing-page-design/SKILL.md`
- `.agents/skills/learn-taste/SKILL.md`
- `.agents/skills/make-interfaces-feel-better/SKILL.md`
- `.agents/skills/mobile-native/SKILL.md`
- `.agents/skills/pick-ui-library/SKILL.md`
- `.agents/skills/prototype/SKILL.md`
- `.agents/skills/remove-animations/SKILL.md`
- `.agents/skills/review-animations/SKILL.md`
- `.agents/skills/schema/SKILL.md`
- `.agents/skills/seo-agentic/SKILL.md`
- `.agents/skills/seo-audit/SKILL.md`
- `.agents/skills/seo-backlinks/SKILL.md`
- `.agents/skills/seo-bing/SKILL.md`
- `.agents/skills/seo-cluster/SKILL.md`
- `.agents/skills/seo-competitor-pages/SKILL.md`
- `.agents/skills/seo-content-brief/SKILL.md`
- `.agents/skills/seo-content/SKILL.md`
- `.agents/skills/seo-dataforseo/SKILL.md`
- `.agents/skills/seo-drift/SKILL.md`
- `.agents/skills/seo-ecommerce/SKILL.md`
- `.agents/skills/seo-flow/SKILL.md`
- `.agents/skills/seo-geo/SKILL.md`
- `.agents/skills/seo-google/SKILL.md`
- `.agents/skills/seo-hreflang/SKILL.md`
- `.agents/skills/seo-image-gen/SKILL.md`
- `.agents/skills/seo-images/SKILL.md`
- `.agents/skills/seo-local/SKILL.md`
- `.agents/skills/seo-maps/SKILL.md`
- `.agents/skills/seo-page/SKILL.md`
- `.agents/skills/seo-plan/SKILL.md`
- `.agents/skills/seo-posthog/SKILL.md`
- `.agents/skills/seo-programmatic/SKILL.md`
- `.agents/skills/seo-schema/SKILL.md`
- `.agents/skills/seo-shopify/SKILL.md`
- `.agents/skills/seo-sitemap/SKILL.md`
- `.agents/skills/seo-sxo/SKILL.md`
- `.agents/skills/seo-technical/SKILL.md`
- `.agents/skills/seo/SKILL.md`
- `.agents/skills/state-machine/SKILL.md`
- `.agents/skills/tastemaker/SKILL.md`
- `.agents/skills/variant/SKILL.md`
- `.agents/skills/web-design-engineer/SKILL.md`
- `.agents/skills/write-swift/SKILL.md`
