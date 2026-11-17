# Dependabot, contratos e auditoria de URLs

Branch: `codex/linker-e-superpowers`, baseada em `main` atualizada em `bb8c16d3` (PR #110). Execução direta, sem delegação. Nenhuma alteração de cobrança, promoção editorial ou publicação de PDFs integra este lote.

## Alterações entregues

- Dependabot ignora TypeScript >=7, ESLint >=10 e majors de Stripe; mantém atualizações minor/patch do legado.
- PRs obsoletos **#106, #108 e #105** fechados com comentário técnico. A consulta de PRs abertos retornou lista vazia após o fechamento.
- **15 skills Superpowers** instaladas em `.agents/skills/`, com revisão em `skills-lock.json` e licença MIT original preservada em `.agents/skills/SUPERPOWERS-LICENSE.txt`.
- **Spec-Kit CLI 1.4.2.dev0**, MIT, instalado via uv a partir do commit `e210504aa09c9273a38bba665b12b8088468c96f`. O executável `specify` é ferramenta do ambiente, não dependência do build. Os contratos e o inventário de arquivos proprietários de rotas ficam em `specs/`.
- **Linkinator 8.1.0**, MIT, instalado como dependência de desenvolvimento e fixado pelo lockfile.
- `node scripts/auditar-urls-linker.mjs` inicia Next compilado em `127.0.0.1:3100`, percorre o índice e todas as partes XML, rastreia links internos, conserva a origem de cada link e encerra o servidor. Porta ocupada é erro explícito. `URL_AUDIT_PORT` permite mudar a porta.

## Diagnóstico que destravou a auditoria

A primeira execução encontrou **dez 502**, todos em endpoints internos que servem PDFs oficiais: UNICAMP 2025, relatórios UNESP 2004–2010 e gabaritos FUVEST 1984/1987. Todas as URLs declaradas nos sitemaps já retornavam 200; não havia 404.

A reprodução isolada revelou **`TypeError: fetch failed`, causa `ECONNREFUSED`**. O Node não estava utilizando o proxy de rede obrigatório deste ambiente. Com `--use-env-proxy`, os PDFs testados de UNICAMP/UNESP passaram na validação de tamanho e SHA-256, e os dois gabaritos FUVEST retornaram `200 application/pdf`. O auditor passou a iniciar seu subprocesso Next com `NODE_USE_ENV_PROXY=1`, respeitando `HTTP_PROXY`, `HTTPS_PROXY` e `NO_PROXY`. Isso corrige a configuração da auditoria local; não relaxa a validação de integridade e não simula respostas de sucesso. A segunda varredura integral passou.

O cache ISR de rotas cresceu durante a primeira execução. O auditor agora remove somente arquivos antigos do cache descartável `.next/server/route-cache` quando o disco atinge 77%, e limpa esse cache ao encerrar. Arquivos compilados em `.next/server/app`, PDFs e fontes editoriais são preservados. Ao final, o disco está em **75%**, abaixo de 80%. `work/`, `test-results/` e PDFs privados permanecem ignorados; apenas `bibliografia-pdfs/README.md` está rastreado nessa pasta.

## Resultados reais

| Verificação | Resultado |
| --- | --- |
| `npx tsc --noEmit` | Exit 0; nenhuma saída de erro |
| `npm run build` | Exit 0; Next 16.4.6; 738 entradas estáticas geradas |
| Licenças do build | 915/915 aprovadas, 0 bloqueadas |
| `node --test tests/linker.test.mjs` | 5 testes, 0 falhas |
| `npm test` | 266 testes, 0 falhas |
| `npx vitest run` | 21 testes em 3 arquivos, 0 falhas |
| `npx htmlhint '.next/server/app/**/*.html'` | 699 HTMLs, 0 erros |
| axe-core + Playwright, 390/1280 px | 6 auditorias: `/planos`, `/livros`, `/privacidade`; 0 violações sérias/críticas, 0 overflow |
| `npm run lint` | Exit 0; 0 erros e 112 avisos na árvore existente de `src/` |
| ESLint do auditor/testes | Exit 0; 0 erros e 5 avisos por caminhos de arquivo não literais no cache/testes |
| Auditor integral | Exit 0; 6.167 URLs internas; 6.162 HTTP 200; 5 HTTP 307; 0 falhas |
| Cobertura XML | 3.368/3.368 URLs HTTP 200; índice + 5 partes lidas; 0 falhas de contrato |
| Proteção / indexação | 3 amostras Tier 0 com `noindex, follow`; 4 capítulos e `/painel` redirecionando 307 para `/login` |

Não houve redirecionamentos 301/308 nas URLs alcançadas. As cinco respostas 307 são a proteção esperada de autenticação. As verificações do leitor/painel nesta auditoria são feitas **como visitante**, sem alegar teste de sessão autenticada. Links externos e fragmentos não são rastreados diretamente; endpoints locais de PDF podem consultar suas fontes oficiais. Não há garantia sobre disponibilidade futura de servidores externos.

### Cobertura dos sitemaps

| Família | URLs |
| --- | ---: |
| Hubs | 25 |
| Provas | 28 |
| Disciplinas e assuntos | 107 |
| Questões: primeira parte / segunda parte | 2.000 / 1.208 |
| **Total** | **3.368** |

O acervo permanece em 170 Tier 2, 3.038 Tier 1 e 13.091 Tier 0. Nenhum Tier 0 foi encontrado no sitemap de questões.

A tabela completa de URLs, códigos HTTP, origens e destinos está em [relatorio-urls-linker.md](relatorio-urls-linker.md). Logs essenciais estão em [linker-evidencias](linker-evidencias/). O registro das falhas iniciais permite conferir os dez endpoints antes da correção. Evidências brutas e temporários permanecem em `work/linker/`, fora do Git.

## Revisão da entrega

Contrato, alterações do Dependabot, origens permitidas, expansão das partes XML, proteção do leitor, limpeza restrita ao cache e relatório foram revisados diretamente. Nenhum link foi excluído para esconder falhas; os dez endpoints passaram na segunda varredura. A branch está preparada para commit local, sem push ou deploy neste lote.
