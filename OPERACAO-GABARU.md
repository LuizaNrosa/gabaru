# Operação Gabaru

## Agora: lançamento gratuito

Na Vercel, mantenha `NEXT_PUBLIC_BILLING_ENABLED=false` (também é o padrão se ausente) e `BILLING_ENABLED=0`. Configure Firebase Web, Firebase Admin e as regras Firestore. A criação de conta libera progresso sincronizado, caderno de erros, revisão espaçada e diagnóstico por disciplina. Os exemplos de leitura são amostras; apostilas completas e planos apoiadores continuam em preparação.

A lista de aviso salva consentimento e e-mail da conta no Firestore, sem cobrança. O aluno pode desmarcar a opção e salvar para retirar seu e-mail. Esta entrega armazena os opt-ins; não envia campanhas automaticamente.

Checkout Mercado Pago e o checkout legado Stripe recusam novas cobranças com a flag pública desligada, mesmo que existam chaves no ambiente. Webhooks e cancelamento continuam disponíveis para processar pagamentos existentes com segurança. Nunca concedemos assinatura paga fictícia para simular acesso gratuito.

## PDFs → capítulo: dois comandos

Na raiz do repositório, coloque fontes autorizadas em:

```text
bibliografia-pdfs/
  enem-exatas-e-linguagens/
    funcoes-e-modelagem.pdf
```

Cada PDF representa um capítulo, com texto selecionável, até 30 páginas e 32 MiB. Fontes escaneadas ou com glifos corrompidos precisam de OCR/conferência antes da ingestão. A pasta é privada, ignorada pelo Git e excluída das funções Vercel.

**1. Extraia as fontes e registre os hashes:**

```bash
node scripts/ingerir-bibliografia.mjs
```

Saída local: `work/bibliografia/indice.json`, com páginas, texto, caminho privado e SHA-256. A extração é estruturada por página; não interpreta automaticamente gráficos nem reescreve a teoria.

**2. Gere o capítulo e selecione cinco questões reais:**

```bash
node scripts/gerar-capitulo-livro.mjs --livro=enem-exatas-e-linguagens --capitulo=funcoes-e-modelagem
```

Troque os slugs pelos nomes da pasta e do PDF. O script confere novamente o hash, gera `content/livros/<livro>/<capitulo>.json` e atualiza somente metadados públicos em `src/data/livros-gerados.json`. Seleciona cinco questões Tier 1/2 não anuladas, sem repetir versões do mesmo enunciado, por correspondência textual documentada. Falha se não houver cinco correspondências; não fabrica exercícios nem gabaritos.

O resultado é um **rascunho**, com transcrição por página, fontes e exercícios. O leitor renderiza fórmulas explícitas `\(...\)` com KaTeX validado; texto e valores monetários ficam separados da matemática. Fórmulas desenhadas e figuras exigem revisão da fonte, não são inventadas pela extração.

Revise transcrição, fórmulas, figuras, direitos e pertinência dos cinco exercícios. Edite a introdução editorial, os títulos das seções e os títulos do catálogo em `src/data/livros-gerados.json`; depois mude `status` de `rascunho` para `publicado` no JSON do capítulo. Rascunhos não aparecem no catálogo nem são servidos pelo leitor; amostras existentes permanecem identificadas. O gerador não sobrescreve capítulos publicados.

Versione os JSONs revisados e faça novo build/deploy. A leitura é em `/livros/<livro>/<capitulo>`, com autenticação no servidor e mini-simulado de cinco questões; não há endpoint para baixar o PDF nem JSON público do livro inteiro.

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
