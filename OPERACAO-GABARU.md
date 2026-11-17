# Operação Gabaru

## Agora: lançamento gratuito

Na Vercel, mantenha `NEXT_PUBLIC_BILLING_ENABLED=false` (também é o padrão se ausente) e `BILLING_ENABLED=0`. Configure Firebase Web, Firebase Admin e as regras Firestore. A criação de conta libera progresso sincronizado, caderno de erros, revisão espaçada e diagnóstico por disciplina. Os exemplos de leitura são amostras; apostilas completas e planos apoiadores continuam em preparação.

A lista de aviso salva consentimento e e-mail da conta no Firestore, sem cobrança. O aluno pode desmarcar a opção e salvar para retirar seu e-mail. Esta entrega armazena os opt-ins; não envia campanhas automaticamente.

Checkout Mercado Pago e o checkout legado Stripe recusam novas cobranças com a flag pública desligada, mesmo que existam chaves no ambiente. Webhooks e cancelamento continuam disponíveis para processar pagamentos existentes com segurança. Nunca concedemos assinatura paga fictícia para simular acesso gratuito.

## PDFs → capítulo: dois comandos

A coleção Vestibulinho IFs & ETEC registra quatro livros e 23 capítulos. Capítulos planejados aparecem com o estado **Em preparação editorial**; as amostras anteriores continuam disponíveis. PDF disponível não significa conteúdo autorizado para adaptação.

Coloque PDFs com prefixos previstos em `bibliografia-pdfs/MAPA-FONTES.json` e registre sua edição, licença, páginas e SHA-256 no arquivo privado `bibliografia-pdfs/AUTORIZACOES.json` (há modelo na pasta). Confira a licença da cópia: o OpenStax Prealgebra 2e atual informa CC BY-NC-SA. Os anexos recebidos em `referencias/` são bibliografia privada e não têm autorização comercial presumida.

**1. Extraia e indexe as fontes por página:**

```bash
node scripts/ingerir-bibliografia.mjs
```

**2. Gere o rascunho do capítulo com seis candidatas reais de ETEC/IFs:**

```bash
node scripts/gerar-capitulo-livro.mjs --livro=matematica-essencial-ifs-etec --capitulo=razao-proporcao-escalas-e-regra-de-tres
```

Substitua os slugs pelos do sumário. A saída em `content/livros/<livro>/<capitulo>.json` reúne conceitos e exemplo autorais, trechos pertinentes das fontes autorizadas, fórmulas KaTeX, gráfico quando previsto e atribuições por página/hash. O gerador é determinístico; não usa um serviço externo para produzir texto nem interpreta figuras automaticamente. O ranking de exercícios por palavras é uma seleção inicial para revisão, não prova de alinhamento pedagógico.

Complete e revise a exposição, as figuras e as seis questões; identifique a pessoa revisora em `revisaoEditorial: {"responsavel":"Nome","data":"AAAA-MM-DD"}` e só então marque `status: "publicado"`. Rascunhos não são servidos como capítulos concluídos. CC BY-SA exige a mesma licença na adaptação. O gerador não sobrescreve publicados. Versione apenas JSONs revisados, faça novo build e valide antes do deploy.

O fluxo anterior `<livro>/<capitulo>.pdf` continua aceito para livros fora da coleção, com cinco exercícios e as amostras existentes. Fontes mapeadas aceitam 64 MiB/1.500 páginas; no legado, 32 MiB/30 páginas. Páginas que precisam de OCR permanecem sinalizadas. Consulte `bibliografia-pdfs/README.md` para o contrato completo. Não existe endpoint de download dos livros autorais.

## Quando os livros estiverem prontos para venda

Nas variáveis da Vercel, para o ambiente desejado:

```dotenv
NEXT_PUBLIC_BILLING_ENABLED=true
BILLING_ENABLED=1
BILLING_PROVIDER=mercadopago
MP_ACCESS_TOKEN=<credencial da conta>
MP_WEBHOOK_SECRET=<segredo da assinatura de notificacao>
MERCADO_PAGO_COLLECTOR_ID=<id da conta recebedora>
BILLING_PIX_30_CENTS=<preco em centavos>
BILLING_PIX_90_CENTS=<preco em centavos>
BILLING_PIX_365_CENTS=<preco em centavos>
BILLING_CARD_MONTHLY_CENTS=<preco em centavos>
BILLING_CARD_YEARLY_CENTS=<preco em centavos>
```

`MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` são aliases aceitos no servidor; os nomes anteriores `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_WEBHOOK_SECRET` também funcionam. Se ambos estiverem preenchidos, os aliases `MP_*` prevalecem. Nunca use prefixo `NEXT_PUBLIC_` para segredos.

Configure no Mercado Pago o webhook HTTPS `https://gabaru.com.br/api/billing/webhook`, com eventos `payment`, `subscription_preapproval` e `subscription_authorized_payment`. Confirme conta recebedora, assinatura HMAC, Pix e recorrência em sandbox antes de usar credenciais de produção. O script `node --use-env-proxy scripts/homologar-mercadopago-sandbox.mjs` só faz chamadas externas com token `TEST-...`.

Faça **novo deploy** após mudar a flag pública: o Next.js incorpora `NEXT_PUBLIC_*` no build. `BILLING_ENABLED=0` é o bloqueio privado adicional para novas cobranças. Pix é pré-pago; cartão é recorrente. O webhook confirma o recurso na API e aplica direitos com idempotência no Firestore. Cancelamento preserva o período já pago.

## Conferência antes de publicar

```bash
npx tsc --noEmit
npm run build
npx htmlhint '.next/server/app/**/*.html'
npx vitest run
```

Mantenha PDFs privados, `.env*`, `work/`, traces e screenshots fora do commit. Não inclua credenciais nem PDFs pesados no push. Os cenários E2E cobrem os modos lançamento e cobrança; as evidências desta entrega ficam em `docs/engenharia/v3/pre-lancamento.md`.

## Esqueleto de SEO e ambiente

Execute sempre `npm run build`: o prebuild atualiza o catálogo público e o postbuild obrigatório gera `sitemap.xml`, as cinco famílias (hubs, provas, disciplinas, questões e livros) e `robots.txt` com next-sitemap. A configuração `vercel.json` fixa esse comando na Vercel. Não crie XML paralelo em rotas ou `public/`. Partes têm até 2.000 URLs; aliases antigos redirecionam com 301. Cada URL indexada tem lastmod estável quando seu conteúdo não mudou.

Auditoria integral após build: `node scripts/auditar-urls-linker.mjs`. O relatório versionado fica em `docs/engenharia/v3/relatorio-urls-linker.md`. Tier 0 e capítulos privados nunca entram nos sitemaps.

`src/env.mjs` valida ambiente no build e nos serviços. Deixe segredos opcionais vazios até configurar o serviço; não use valores fictícios. `NEXT_PUBLIC_BILLING_ENABLED` aceita somente `true` ou `false` e permanece `false` no lançamento. O contato público autorizado é `NEXT_PUBLIC_SUPPORT_EMAIL=meugabaru@gmail.com`. Variáveis públicas exigem novo build para atualizar o site. Não exponha segredos com prefixo público.
