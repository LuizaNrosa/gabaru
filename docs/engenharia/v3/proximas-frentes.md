# Próximas frentes — plano técnico

Plano de implementação posterior ao fechamento da v3. Nenhuma migração de cobrança ou promoção adicional foi executada neste fechamento.

## A. Conferência das 1.109 candidatas originais

A seleção original não contém INEP ou FUVEST. São 617 ETEC, 264 COLUNI, 200 IFSC e 28 IFSP. O pipeline v3 já promoveu 116 dessas questões; restam **993**, e não outras 1.109 novas.

| Banca | Candidatas originais | Já promovidas | Ainda retidas |
| --- | ---: | ---: | ---: |
| ETEC | 617 | 9 | 608 |
| COLUNI | 264 | 73 | 191 |
| IFSC | 200 | 31 | 169 |
| IFSP | 28 | 3 | 25 |
| Total | 1.109 | 116 | 993 |

1. Criar `scripts/conferir-gabaritos-1109.mjs` como CLI de auditoria, reutilizando `scripts/lib/resgate-v3.mjs`, `scripts/lib/fontes-enem-offline.mjs` e o overlay `src/data/editorial/resgate-v3.json`. Congelar os 1.109 IDs a partir de `src/data/catalogo-v2.json` no baseline `1ae44ebe`, selecionando exclusivamente `motivos == ['gabarito-sem-conferencia-documentada']`. Gravar SHA-256 da seleção; não selecionar novamente uma população diferente a cada execução.
2. Agrupar por banca/ano/edição/versão e idioma quando aplicável. Usar os cadastros `src/data/{etec,coluni,ifsc,ifsp}-exams.json`. Para cada edição, conferir SHA-256 dos bytes locais de prova e gabarito contra `examSha256` e `answerSha256`. Fonte ausente ou hash divergente produz recusa explícita; nunca troca silenciosamente o documento. Fontes novas entram primeiro em manifesto com URL institucional, licença, hash e identificação do caderno.
3. Melhorar os parsers das versões recusadas: ETEC (códigos/colunas), COLUNI (quatro versões, somente coluna correspondente à capa) e IFSP (tipo 1 versus 2). Verificar numeração integral, anuladas, versões de gabarito definitivo/retificado e consistência com as respostas já cadastradas. Gravar parser/versão, página e origem da letra por questão.
4. **Não basta conferir a letra.** O resgate atual recusou 209 candidatas com enunciado divergente e 31 com alternativas sem correspondência ordenada no PDF; outras 370 dependem de contexto/figuras, 377 falharam na leitura/versão do gabarito e 6 não tiveram marcador localizado. Esses 993 casos explicam por que um motivo legado único não prova qualidade textual. Reconstruir blocos de texto e anexar contexto/figuras com transcrição e descrição verificadas; quando a extração determinística não provar integridade, gerar fila de revisão humana por ID e página.
5. Modo padrão `--dry-run`; aplicação explícita em lote curto com fingerprint original, hash da fonte e trilha antes/depois. Não alterar gabarito já definido que diverge da fonte: abrir pendência editorial. Reaplicação idempotente deve produzir zero promoções novas. FUVEST 2001 V/T permanece bloqueada; fontes INEP 2000–2008 constituem lote separado, sem misturá-las aos 1.109 IDs.
6. Regenerar `scripts/gerar-catalogo.mjs` e `scripts/gerar-llms.mjs`. Questões aprovadas entram em `sitemap-questoes.xml`. **Caderno só entra em `sitemap-provas.xml` quando todos os seus itens satisfizerem a régua**, preservando `examQuality`; promover uma questão isolada não torna o caderno inteiro publicável. Conferir HTTP 200, canonical, HTML SSR, noindex dos recusados e ausência de Tier 0 nos XMLs.
7. Saída auditável: ID, status anterior/novo, motivo, caderno/versão, SHA-256 de prova/gabarito/dataset, página, resposta anterior/oficial e método de conferência. Testes de hash adulterado, versão trocada, anulada, contexto faltante e execução repetida; TypeScript, build, HTMLHint e axe antes de integrar cada lote.

Critério: nenhuma promoção sem texto, alternativas e fonte oficial comprovados. A meta de 993 restantes não é garantia de publicação automática.

## B. Gateway brasileiro com Pix e assinatura

Recomendação inicial: avaliar Mercado Pago, aproveitando a integração de sandbox já presente; comparar com Pagar.me antes de fixar o provedor. O checkout existente em `src/app/api/mercado-pago/checkout-teste/route.ts` cria apenas preferência de teste, restrita a preview e operador. Seu valor fixo e seu fluxo não devem ser promovidos a produção como assinatura.

**Pix avulso, recorrência por cartão e Pix Automático são capacidades distintas.** O contrato precisa confirmar Pix Automático, consentimento/mandato, eventos e disponibilidade para a conta antes de prometer débito recorrente por Pix. Se não houver habilitação, oferecer Pix por ciclo, renovado pelo aluno, com nome e prazo explícitos; não apresentá-lo como débito automático.

| Arquivo atual | Mudança planejada |
| --- | --- |
| `src/lib/stripe.ts` | Extrair contrato `src/server/billing/provider.ts` e adapter `mercado-pago.ts` ou `pagarme.ts`: criar cobrança/assinatura, consultar estado e cancelar. Credenciais apenas no servidor; timeouts e validação Zod das respostas. |
| `src/app/api/stripe/checkout/route.ts` | Criar `/api/pagamentos/checkout`: autenticação revogada, origem permitida, corpo estrito `{plan,requestId,method}` e plano/preço BRL exclusivamente do servidor. Associar `external_reference`/metadata ao UID; idempotência por UID e requestId. Tokenizar cartão com recurso oficial do gateway, sem PAN/CVV no backend do Gabaru. |
| `src/app/api/stripe/webhook/route.ts` | Criar `/api/pagamentos/webhook/[provider]`: limitar corpo, autenticar notificação conforme contrato oficial do provedor e consultar o recurso pela API autenticada. Conferir beneficiário/conta, UID, plano, moeda, valor, recurso e estado; não confiar em status/UID do payload isolado. |
| `src/server/stripe-events.ts` | Generalizar para `src/server/billing/events.ts`. Transação Firestore lê `processed_events/{provider_eventId}`, vínculo do recurso e assinatura antes de qualquer escrita. Aplica estado, perfil e ledger de forma atômica. Namespacing impede colisão entre gateways; guardar ID original/hash/tipo/data, sem dados de cartão. Eventos repetidos não repetem efeitos; eventos atrasados não revogam assinatura mais recente. |
| `src/app/api/stripe/portal/route.ts` | Substituir pelo endpoint autenticado `/api/pagamentos/assinatura` (consulta) e ação `/cancelar`. Construir autogestão própria quando o provedor não oferecer portal hospedado equivalente; customer/subscription e URLs sempre resolvidos no servidor pelo UID. |
| `src/app/painel/premium/page.tsx`, `src/components/stripe-portal-button.tsx` | Exibir método, ciclo pago, próxima renovação, estado de Pix, cancelamento e confirmação. Substituir o botão específico por componente do contrato genérico, sem redirecionamento arbitrário. |
| `src/components/Paywall.tsx`, `src/server/subscriptions.ts`, `src/lib/security/subscription.ts` | Manter verificação server-side e falha fechada; o paywall depende de direito ativo e prazo pago, não do nome do gateway. Pix pendente ou mera autorização de recorrência não libera acesso. |
| `users/{uid}` e `subscriptions/{uid}` no Firestore | Acrescentar `paymentProvider`, `providerCustomerId`, `providerSubscriptionId`, estado normalizado, plano e `paidUntil`; manter `planExpiresAt` durante compatibilidade. Escritas somente Admin, isolamento por UID e migração versionada. Manter identificadores Stripe para assinaturas legadas enquanto existirem. |
| `firestore.rules`, `.env.example`, `src/app/planos/page.tsx` | Bloquear escrita/leitura pública de ledger e vínculo de gateway; documentar credenciais, plano e webhook; apresentar somente meios realmente habilitados. Remover SDK e variáveis Stripe apenas quando não houver assinatura legada dependente. |
| `tests/security-total.test.mjs`, `tests/firestore-rules.test.mjs`, `tests/e2e/plataforma-v3.spec.ts` | Cobrir preço/UID adulterados, webhook falso/repetido/fora de ordem, Pix pendente→pago→estornado, falha de renovação, cancelamento e isolamento. Homologar sandbox e replay concorrente no emulador antes da troca de tráfego. |

### Sequência de migração

1. Confirmar capacidades e habilitação da conta; escolher um gateway e o contrato de cancelamento/expiração. Credenciais e exemplos somente sandbox.
2. Criar adapter e ledger genérico, preservando Stripe para assinaturas existentes. Não migrar token de cartão ou autorização do aluno sem suporte contratual; quando necessário, pedir nova adesão e evitar cobrança dupla.
3. Homologar Pix avulso e ciclo recorrente suportado separadamente. Liberar acesso somente após estado de pagamento confirmado; expiração, estorno e chargeback seguem política server-side documentada. Agendar reconciliação autenticada para notificações perdidas, sem conceder acesso pelo retorno do navegador.
4. Ativar por configuração no servidor após testes; acompanhar divergências e manter rollback. Retirar a implementação Stripe somente ao encerrar a transição das assinaturas legadas.

Fontes oficiais para a homologação: [Mercado Pago — Assinaturas](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview), [Mercado Pago — Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks) e [Pagar.me — Assinaturas](https://docs.pagar.me/docs/vis%C3%A3o-geral-assinaturas). A consulta automatizada dessas páginas retornou HTTP 403 neste ambiente; a disponibilidade de Pix Automático na conta não foi confirmada. O plano não assume equivalência entre os fluxos dos provedores.
