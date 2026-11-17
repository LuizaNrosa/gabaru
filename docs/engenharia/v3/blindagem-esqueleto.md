# Blindagem do esqueleto técnico — Gabaru

Data: 17/11/2026. Execução direta, sem delegação. Branch `codex/linker-e-superpowers`, descendente da main `bb8c16d3` (PR #110).

## Resultado implementado

- next-sitemap 4.2.3 substitui os geradores XML paralelos. `npm run build` gera catálogo no prebuild e XML/robots no postbuild; `vercel.json` fixa esse comando. O pacote `sitemap` antigo foi removido.
- Cinco famílias, partes de até 2.000 URLs, índice único e uma única declaração de sitemap no robots. Hubs 28, provas 28, disciplinas/assuntos 107, questões 3.208, livros 1: **3.372 URLs únicas em seis partes de conteúdo e um índice**. A segunda parte de questões usa `/sitemap-questoes-1.xml`.
- Aliases antigos retornam 301, incluindo `/sitemaps/questoes/1.xml` → `/sitemap-questoes.xml`, `/sitemaps/questoes/2.xml` → `/sitemap-questoes-1.xml` e `/sitemap-index.xml` → `/sitemap.xml`. Não entregam XML duplicado.
- Manifesto `src/data/seo-publico.json` compartilha a mesma elegibilidade com `/llms.txt` e `/llms-full.txt`. Tier 0 e capítulos privados ficam fora de todos esses índices. `lastmod` usa fingerprint de conteúdo e fonte, preserva datas em builds sem alteração, inclusive sem `.git`; primeiro conteúdo alterado sem histórico recebe data de observação, sem alegação de revisão editorial anterior.
- `src/env.mjs` com t3-env/zod centraliza ambiente, valida valores presentes e oculta valores nas mensagens de erro. Configuração pública não pode acessar segredos nem no SSR. Serviços usam getter privado. Nenhum segredo é obrigatório para compilar o catálogo público; ausência não ativa serviços nem cobrança.
- nuqs 2.10.3 mantém filtros tipados em `/questoes` e `/provas`, com SSR, navegação voltar/avançar, remoção de parâmetros inválidos e canonical sem filtros. As listas de bancas do cliente não carregam o catálogo inteiro.
- `/termos` e `/reembolso` foram criadas com contato explicitamente autorizado **meugabaru@gmail.com**. Sobre, privacidade, catálogo, painel e leitor receberam metadados/JSON-LD coerentes. Painel e capítulos continuam autenticados e noindex. A biblioteca e as quatro amostras existentes foram preservadas, sem download autoral.
- Identidade visual preservada. Mercado Pago permanece compilado e testado, com cobrança desabilitada no build de lançamento. Arquivos privados e fontes bibliográficas não entram no Git nem nos traces das funções.

## Validação local

Os logs integrais selecionados estão em `blindagem-evidencias/`.

| Verificação | Resultado real |
| --- | --- |
| Licenças | 919/919 aprovadas; 0 bloqueadas |
| `npx tsc --noEmit` | código 0 |
| `npm run lint` (inclui eslint-plugin-security) | código 0; 0 erros, 118 avisos |
| `npm test` | 284 aprovados, 0 falhas |
| `npx vitest run` | 23 aprovados, 0 falhas |
| `npm run build` | código 0, incluindo prebuild/postbuild |
| `npx htmlhint '.next/server/app/**/*.html'` | 700 arquivos, 0 erros |
| Playwright no build final de lançamento | 10 aprovados, 0 falhas, desktop/mobile |
| HTML/metadados/JSON-LD/axe no build final | 24 visitas a 12 rotas, 0 erros HTMLHint e 0 violações críticas/sérias |
| `lastmod` sem `.git` | manifesto idêntico byte a byte após regenerar |
| Traces serverless locais | 110 traces; maior 44,97 MiB; nenhum caminho privado de bibliografia/work |

Perfis isolados de QA: 56 E2E aprovados no lançamento gratuito; dois cenários exclusivos de cobrança foram pulados nesse perfil. O perfil separado de cobrança aprovou seis cenários, incluindo Pix, recorrência, confirmação por webhook, replay idempotente, cancelamento e proteção de capítulos. Ele validou HTML, metadados, JSON-LD e axe em 30 visitas desktop/mobile, incluindo painel e leitores autenticados. Não houve transações reais; fixtures/emuladores foram removidos antes do build final.

O lint mantém 118 avisos, majoritariamente heurísticas `security/detect-object-injection` e avisos de imagem; seu código de saída é 0. Eles não são uma classificação automática de vulnerabilidades por criticidade. Nenhuma regra foi desativada nesta entrega.

Os únicos ajustes nos novos specs foram normalizar a barra final do canonical raiz usando URL e usar a exportação nomeada HTMLHint no runner Playwright. Nenhum teste foi suprimido para ocultar uma falha. Valores malformados de flags agora falham explicitamente; teste antigo foi ajustado a esse contrato estrito.

Auditoria integral Linkinator: **6,240 URLs internas**, 6,208 respostas 200, 32 redirecionamentos esperados (4 aliases 301 e 28 proteções 307), **0 quebradas e 0 falhas de contrato**. Foram lidos sete XMLs, com 3.372 ocorrências únicas, zero duplicatas e 3.372 lastmod válidos. Três amostras Tier 0 confirmaram noindex/follow e 27 leitores exigiram sessão. A tabela completa, com origem de cada link, está em `relatorio-urls-linker.md`.

## Limites da evidência

HTMLHint verifica as regras da configuração versionada; não representa certificação integral de HTML. Axe comprova ausência de violações críticas/sérias nos estados testados, não conformidade manual de toda a plataforma. O auditor percorre todas as URLs de sitemap e links internos alcançáveis; fontes externas e fragmentos não são rastreados diretamente. Autenticação e pagamentos são testados separadamente nos E2E isolados. Tamanho de trace é uma estimativa local dos arquivos rastreados; o empacotamento final pertence à Vercel.

## Publicação

Push e atualização de produção autorizados pelo usuário. A produção anterior apontava para main `bb8c16d3`; publicar somente a branch criaria preview. A entrega exige PR para main e confirmação do novo deployment. Nenhum deploy será declarado concluído antes de verificar seu estado e o domínio público.

Disco ao concluir a validação: **74%**. Foram removidos downloads antigos de navegadores de teste; fontes oficiais, PDFs bibliográficos e índice privado foram preservados. O cache temporário de compilação em RAM foi removido e `.next/cache` voltou a diretório local. Nenhum PDF bibliográfico, work, test-results ou arquivo de segredo é rastreado.
