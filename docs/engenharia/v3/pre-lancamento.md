# Pré-lançamento gratuito e operação editorial

Branch: `codex/gabaru-plataforma-v3`. Padrão publicado: `NEXT_PUBLIC_BILLING_ENABLED=false`. Kill switch adicional: `BILLING_ENABLED=0`.

## Entregas

- Painel e planos exibem Acesso Gratuito de Lançamento. Não há oferta de Pix/cartão com a flag desligada. O checkout Mercado Pago e o legado Stripe também recusam novas cobranças no servidor, mesmo com kill switch privado ligado. Webhook, consulta e cancelamento permanecem implementados; assinaturas e direitos pagos não são falsificados para liberar o lançamento.
- Conta Firebase autenticada acessa questões, métricas, caderno de erros e amostras de leitura. Flag ligada restaura exigência de assinatura nos livros. A sessão continua verificada no servidor nos dois modos.
- Lista opcional com consentimento explícito, UID/e-mail derivados do token e revogação efetiva; sem escrita direta do cliente no Firestore. O formulário também permanece na página de privacidade. Não há envio automático de campanhas nesta entrega.
- Scripts reais `ingerir-bibliografia.mjs` e `gerar-capitulo-livro.mjs`: extração por página, hash, rejeição de PDFs ilegíveis/links simbólicos, limite por capítulo, projeção matemática explícita, cinco questões reais deduplicadas e rascunho privado. Publicação depende de revisão do JSON; não é uma reescrita automática de teoria ou leitura de figuras. Rascunhos não são publicados. Capítulos publicados não são sobrescritos automaticamente.
- `OPERACAO-GABARU.md` documenta os dois comandos, revisão e publicação e as variáveis Vercel, incluindo aliases `MP_ACCESS_TOKEN`/`MP_WEBHOOK_SECRET`, preços, conta recebedora e necessidade de novo deploy após alterar a flag pública.

## Validação local real

Logs completos (normalização apenas de whitespace do console) em `pre-lancamento-evidencias/`:

| Verificação | Resultado |
| --- | --- |
| TypeScript Web | exit 0 |
| Build final sem ambiente demo | exit 0; 738 páginas geradas |
| HTMLHint | 699 HTMLs; 0 erros |
| Node | 260 testes passaram; 0 falhas; 0 ignorados |
| Vitest | 21 testes passaram; três arquivos |
| E2E cobrança ativada, transporte local | 12 passaram em desktop/mobile |
| E2E lançamento gratuito | 46 passaram em desktop/mobile |
| Pipeline de PDF e projeção | 3 testes dirigidos passaram; incluídos nos 260 Node |
| Axe autenticado no modo gratuito | 30 auditorias, 0 violações críticas/sérias e 0 overflow |
| Axe/HTMLHint do release público | 6 auditorias novas, 0 violações críticas/sérias, 0 erros HTML e 0 overflow |
| Formulário autenticado de consentimento | axe incluído no E2E em desktop/mobile; sem violações críticas/sérias |
| Regras Firestore | teste de integração passou; escritas proibidas recusadas |
| Funções Vercel (NFT) | maior: 47.166.565 bytes; 0 acima de 250 MB; 0 arquivos ausentes |
| ESLint security | 0 erros; 112 warnings |

O teste de consentimento inicialmente aguardava `networkidle`; foi substituído pela resposta GET específica e pelas confirmações visíveis, sem aumentar timeout. Os problemas de execução do auditor auxiliar (interop CommonJS e contexto Playwright) foram corrigidos antes da auditoria final aprovada.

A autenticação demo e o gateway emulado só foram usados nos testes locais. `.env.production.local` foi removido antes do build final. Nenhuma cobrança real foi criada nem foram inseridas chaves de produção.

## Disco e revisão de arquivos

Foram removidos 268,55 MiB de `tmp_pack_*` abandonados pelo Git e 92.037.670 bytes de cópias de cache idênticas a PDFs oficiais preservados em `public/`. Uso observado durante esta entrega: 71–78%, abaixo de 80%. O snapshot final está nas evidências.

Nenhum PDF privado ou temporário novo entra no commit. `bibliografia-pdfs/**` é ignorado, exceto seu README; também está excluído das funções da Vercel. Não há arquivos rastreados de `work/` ou `test-results/`. Os 181 PDFs oficiais herdados do acervo foram preservados (o maior tem 15.110.541 bytes); não foram confundidos com fontes privadas dos livros.

O push da branch foi expressamente autorizado nesta entrega. O estado remoto e o link do PR serão informados após o envio; nenhum merge em main foi autorizado.

## Integração com main e alertas remotos

O push inicial criou o PR draft #110 e um Preview Vercel READY. O GitHub revelou divergência com sete commits de main, todos de dependências. A integração foi feita nesta branch, sem alterar main: foram preservados os scripts, os pacotes e a restrição Node 24 da v3, incorporando as dez atualizações de versões aprovadas na main, incluindo Next 16.4.6, React 19.3.1 e Firebase 13.3.0.

CodeQL apontou dois alertas na comparação da branch: checagem de existência seguida de gravação e regex permissiva sobre URL em um teste. O resgate agora lê com tratamento direto de ENOENT e grava por staging privado exclusivo com rename atômico. O teste de symlink comprova que o destino externo não é alterado. O E2E valida protocolo, hostname e caminho da URL, em vez de substring.

Após integração: **894/894 licenças aprovadas**, TypeScript e build final sem ambiente demo aprovados, **699 HTMLs válidos**, **261 testes Node**, **21 Vitest**, **12 E2E de cobrança** e **46 E2E gratuitos** aprovados. Axe: **32 auditorias autenticadas** e **6 públicas** sem violações críticas/sérias, erros HTML ou overflow. Maior função: **46.986.986 bytes**, sem arquivos ausentes. Logs pós-integração têm `merge` no nome.

A instalação das atualizações chegou temporariamente a 82% de disco. O cache de downloads npm e os artefatos antigos foram removidos imediatamente, reduzindo o uso para 68%; as validações seguintes ficaram em 72–77%. O snapshot final após limpeza está em `disco-merge.log`. Nenhum PDF oficial foi removido do Git e nenhuma fonte privada foi adicionada.
