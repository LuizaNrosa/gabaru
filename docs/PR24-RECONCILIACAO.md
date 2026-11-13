# Reconciliação do PR 24

Os conflitos com a versão atual foram resolvidos preservando a página inicial e o leitor ETEC atuais. O checkout legado foi desativado e o webhook não confirma uma compra sem liberar acesso; não configura nem habilita pagamentos. A futura integração precisa usar provedor adequado ao Brasil e implementar liberação, repetição e conciliação de forma transacional.

Em 13/11/2026 passaram a checagem TypeScript, 20 testes de validação, histórico, acesso e superfície pública e a compilação Next.js. Estes testes não comprovam sincronização real de progresso entre dispositivos, entrega de acesso pago ou funcionamento com serviços externos. O código legado de entitlements Stripe permanece para revisão, sem ativação pelo webhook. Manter o PR em rascunho até revisão de segurança e de produto das alterações restantes e testes integrados com infraestrutura configurada.
