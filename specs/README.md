# Contrato vivo de rotas e indexação

Base sincronizada: main `bb8c16d3` (PR #110). Mudanças de rota devem atualizar este contrato e passar pelo auditor `node scripts/auditar-urls-linker.mjs` após o build.

## Rotas públicas

Origem canônica: `https://gabaru.com.br`. `/`, `/sobre`, `/enem`, `/vestibulinho`, `/vestibulares`, `/provas`, `/questoes`, `/livros`, `/videoaulas` e os hubs `/banca/[slug]`, `/disciplina/[disciplina]`, `/assunto/[slug]` são públicos. Edições oficiais ficam em `/provas/[instituicao]/[edicao]`; questões em `/questoes/[slug]`. Parâmetros devem existir no catálogo; identificadores inexistentes retornam 404.

O índice `/sitemap.xml` aponta para `sitemap-hubs.xml`, `sitemap-provas.xml`, `sitemap-disciplinas.xml` e `sitemap-questoes.xml`. Cada parte admite até 2.000 URLs; partes seguintes usam `/sitemaps/[tipo]/[parte].xml`. A auditoria percorre recursivamente todo o índice, sem limitar a primeira parte. Toda URL declarada deve retornar 200, sem redirecionamento, e nunca pertencer ao Tier 0.

## Promoção editorial

- Tier 0: quarentena, consulta visual pública, `noindex, follow`, excluída de todos os sitemaps.
- Tier 1: enunciado íntegro, alternativas completas no formato oficial, gabarito conferido com proveniência e hash do caderno/cor/versão. Não inferir gabaritos nem inventar alternativa E em provas de quatro opções. Anuladas oficiais preservam essa condição.
- Tier 2: requisitos do Tier 1 mais resolução estruturada e/ou vídeo validado.

Questões Tier 1/2 entram no sitemap de questões. Cadernos entram quando atingem a régua de qualidade do catálogo (90% de questões validadas). Conteúdo pedagógico indexável permanece no HTML do servidor.

## Leitor e autenticação

`/painel` e `/livros/[livroSlug]/[capituloSlug]` exigem sessão Firebase verificada no servidor. Visitantes recebem redirecionamento 307 para `/login`; isso é proteção esperada, não link quebrado. Com billing desabilitado, contas gratuitas acessam as amostras editoriais; billing habilitado exige assinatura para conteúdo protegido. Nunca expor o livro inteiro em JSON público nem disponibilizar PDF/EPUB autoral para download. Mutadores `/api/` têm contratos próprios de autenticação e método; o rastreador de páginas não substitui testes de API.

## Ferramentas e workflow

Superpowers instalado por `npx skills add obra/superpowers -a codex -y` (MIT, revisão fixada em `skills-lock.json`). Spec-Kit instalado por `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git` (MIT; CLI 1.4.2.dev0, commit `e210504aa09c9273a38bba665b12b8088468c96f`). Linkinator 8.1.0 (MIT) é dependência de desenvolvimento fixada pelo lockfile.

Fluxo: contrato → teste de regressão → implementação → diagnóstico da causa de qualquer falha → build e auditoria completa → revisão do diff → commit. Execução direta, sem subagentes, conforme instrução do usuário. Links externos não são rastreados diretamente; endpoints locais de PDFs podem consultar fontes oficiais pelo proxy de rede do ambiente; URLs canônicas internas são remapeadas ao servidor compilado. Artefatos intermediários ficam em `work/`, ignorado pelo Git.
