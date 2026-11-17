# Lote 8 — entrega e auditoria final da plataforma v3

Branch: `codex/gabaru-plataforma-v3`. Baseline: `1ae44ebe`. Execução local com Node 24; sem push, deploy ou cobrança real. Evidências textuais versionadas em [evidencias-lote8](./evidencias-lote8/). Os relatórios dos Lotes 1–7 registram decisões e diagnóstico anteriores.

## Resultado do acervo

São **16.299 itens totais**, não 16.299 itens originalmente em quarentena.

| Tier | Antes da v3 | Final | Variação |
| --- | ---: | ---: | ---: |
| `tier-2-completa` | 24 | 24 | 0 |
| `tier-1-gabarito-oficial` | 146 | 262 | +116 |
| `tier-0-quarentena` | 16.129 | 16.013 | −116 |
| Total | 16.299 | 16.299 | 0 |

As 116 promoções exigiram hashes dos PDFs locais, identificação da versão do gabarito e correspondência textual ordenada de enunciado e alternativas no bloco da questão. Não se fabricaram resoluções, transcrições ou vídeos. O [placar detalhado](./lote-3-placar.json) contém motivos sobrepostos e recusas; `promovidasNestaExecucao = 0` registra a reaplicação idempotente, enquanto `promovidasDesdeBaseline` registra as 116 promoções reais. FUVEST 2001 V/T permanece suspensa.

Das 1.109 candidatas originais retidas apenas pelo motivo legado de conferência, já foram resgatadas 116; restam **993**: ETEC 608, COLUNI 191, IFSC 169, IFSP 25. A classificação antiga não garantia integridade textual: o novo cruzamento encontrou divergências e dependência de contexto/figuras. O [plano das próximas frentes](./proximas-frentes.md) define conferência por ID e versão, sem promoção em massa pelo simples preenchimento da letra.

## Comandos e resultados reais

Todos os comandos finais abaixo terminaram com código 0. Log de TypeScript Web vazio significa ausência de diagnóstico; o código de saída foi conferido no terminal.

| Verificação | Resultado | Log |
| --- | --- | --- |
| `npx tsc --noEmit` | 0 erros Web, incluindo schemas | [Web](./evidencias-lote8/lote8-tsc-web.log) |
| `npm --prefix APK run typecheck` (`tsc --noEmit`) | 0 erros APK | [APK](./evidencias-lote8/lote8-tsc-apk.log) |
| `npx eslint --plugin security src APK` | **0 erros, 100 avisos** | [ESLint](./evidencias-lote8/lote8-eslint.log) |
| `npm run build` | compilação, tipagem e geração concluídas | [Build](./evidencias-lote8/lote8-build.log) |
| `npx htmlhint '.next/server/app/**/*.html'` | **701 HTMLs, 0 erros** | [HTMLHint](./evidencias-lote8/lote8-htmlhint.log) |
| `node scripts/auditar-funcoes-vercel.mjs` | nenhuma função acima de 250.000.000 bytes; nenhum arquivo ausente | [Vercel](./evidencias-lote8/lote8-vercel.log) |
| `npm test` | **245 aprovados, 0 falhas, 0 skips** | [Unitários/integração](./evidencias-lote8/lote8-unitarios.log) |
| `npm run test:firestore` | isolamento por UID, plano somente Admin e replay concorrente aprovados | [Firestore](./evidencias-lote8/lote8-firestore.log) |
| Playwright E2E desktop/mobile, com fixture autenticada | **34 casos distintos aprovados**, nenhum pendente | [E2E consolidado](./evidencias-lote8/lote8-e2e.log) |
| `node scripts/auditar-interface-v3.mjs`, com sessão autenticada emulada | **20 combinações, 0 erros HTML, 0 violações críticas/sérias, 0 overflow** | [axe autenticado](./evidencias-lote8/lote8-axe-autenticado.log) |

ESLint não é um laudo de ausência de vulnerabilidades. Os 100 avisos continuam explícitos; incluem acesso dinâmico a objetos, imagens, variáveis não usadas e acesso a filesystem. Não foram ocultados ou convertidos em aprovação de segurança. Testes exercitam assinatura Stripe, idempotência, IDOR, corpo excessivo, XSS e isolamento Firestore. Pagamento real e integração de produção dependem de credenciais e homologação da conta.

### Causa concreta da trava E2E e correção

A execução recebida estava interrompida antes do resumo final. Na retomada, o disco chegou a 100% e o Playwright falhou ao gravar um trace:

```text
Error: apiRequestContext.dispose: ENOSPC: no space left on device
...test-results/.playwright-artifacts-0/traces/...recording26.trace
16 passed; 1 failed; 17 did not run
```

O [log original](./evidencias-lote8/lote8-e2e-enospc.log) foi preservado. Tratava-se de infraestrutura, sem falha de asserção da aplicação. Remover caches e traces corrigiu a causa antes de repetir o comando. O spec afetado foi executado isoladamente no desktop: **4 passed (2.1s)**, incluindo idempotência e UID do token. Os 17 casos mobile ainda não executados foram concluídos com trace desativado: **17 passed (26.1s)**. Somados aos 13 casos desktop aprovados do primeiro spec, são 34 casos distintos cobertos. O log consolidado identifica essas execuções separadas; não declara uma execução monolítica inexistente. Nenhum teste foi ignorado para obter aprovação.

### Rotas autenticadas e acessibilidade

Auditoria Chromium com viewport 390×900 e 1280×900, tags WCAG 2 A/AA, 2.1 AA e 2.2 AA. Cada rota retornou HTTP 200 sem redirecionar para login. Incluiu:

- Home, ENEM, Vestibulinho, questão Tier 2, questões, livros e videoaulas;
- `/livros/enem-exatas-e-linguagens/funcoes-e-modelagem`;
- `/livros/enem-exatas-e-linguagens/moleculas-e-leitura-cientifica`;
- `/painel`.

As três rotas privadas foram verificadas em ambas as larguras. O [JSON da auditoria](./evidencias-lote8/auditoria-interface.json) comprova os 20 resultados. Sessões usaram exclusivamente projeto `demo-gabaru`, emulador Firestore e provider local de Auth via mecanismos padrão do Firebase Admin. Não há bypass de autenticação no produto. E2E verifica também usuário gratuito bloqueado, cookie forjado, conteúdo de capítulo em SSR/MathML sem JavaScript, ausência de download de livro e separação das respostas entre contas. Essa cobertura automatizada não substitui auditoria manual completa por leitor de tela.

### Vercel, licenças e SEO

A maior função rastreada tem **40.078.638 bytes**, em `livros/[livroSlug]/[capituloSlug]/page.js.nft.json`, frente aos 249.337.639 bytes medidos no diagnóstico inicial. O manifesto de páginas elimina consulta de imagens no filesystem da função; WebPs continuam como arquivos estáticos. Canvas opcional do jsdom foi excluído do tracing, preservando testes de sanitização e o build. [Inventário completo de funções](./evidencias-lote8/vercel-funcoes.json).

Licenças: **828/828 aprovadas, 0 bloqueadas** pela política autorizada. LGPL é exceção somente para artefatos herdados Sharp/libvips com versão e integridade fixadas. GPL/AGPL/SSPL sem alternativa permissiva continuam bloqueadas. Animate usa a fonte MIT de emilkowalski; fonte delphi sem licença não foi incorporada. Tastemaker MIT + CC BY 4.0 foi autorizado, reinstalado e teve inventário/atribuição atualizados. Relatórios da política inicial foram renomeados para não se confundirem com a situação ativa.

Canonical não-www, robots, sitemaps modulares de 2.000 URLs, aliases Next com `generateSitemaps`, JSON-LD e llms foram preservados ou ampliados. A colisão do metadata sitemap com a rota antiga foi corrigida antes da repetição do build: rewrite `/sitemap.xml` → `/sitemap-index.xml`. O E2E confirma índice XML, alias nativo, exclusão da quarentena e presença de questão válida. Capítulos pagos não entram em sitemap/llms; cadernos exigem todos os itens completos.

## Limpeza e estado de entrega

Foram removidos traces, screenshots, backups de assets, pacotes/cache de instalação, emulador baixável, arquivos de sessão de teste e cache Turbopack. Após o typecheck APK, seu `node_modules` local também foi removido. Fontes de conteúdo, PDFs necessários à comprovação local e evidências textuais essenciais foram preservados. O uso do disco caiu de 100% para aproximadamente 88%; o valor final está no terminal após o commit (87% na última medição anterior ao commit).

`/work/`, `/test-results/` e `/playwright-report/` já estavam no `.gitignore`; `git check-ignore` confirmou a proteção e nenhum desses diretórios foi incluído no commit. Logs essenciais foram copiados para `docs/engenharia/v3/evidencias-lote8/` para sobreviver à limpeza local. Nos logs versionados, somente retornos de progresso e espaços finais foram normalizados; resultados e diagnósticos foram preservados.

O commit local consolida implementação, testes e documentação na branch dedicada. `git log -n 3 --stat` e `git diff --stat 1ae44ebe HEAD` permitem revisar a entrega completa. Não houve push ou deploy. A migração para gateway brasileiro é apenas o plano em [próximas frentes](./proximas-frentes.md); Stripe permanece implementado nesta entrega.
