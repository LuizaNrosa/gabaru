# Gabaru

Site para vestibulinhos, vestibulares e concursos — https://gabaru.com.br

Stack: Next.js (App Router) · TypeScript · Tailwind CSS v4 · Firebase Auth · Stripe.

> **Projeto independente do Linvuu.** Use projeto Firebase, conta Stripe e serviços
> exclusivos do Gabaru. Nada aqui deve apontar para credenciais do Linvuu.

## Começando

```bash
npm install
cp .env.example .env.local   # preencha com credenciais NOVAS do Gabaru
npm run dev
```

## Firebase

1. Crie um projeto Firebase novo para o Gabaru.
2. Authentication > Método de login > ative **E-mail/senha**.
3. Authentication > Configurações > Domínios autorizados: adicione `gabaru.com.br`.
4. Copie a config Web para `NEXT_PUBLIC_FIREBASE_*` e gere uma chave de conta de
   serviço para `FIREBASE_ADMIN_*`.

## Stripe

1. Use a conta/modo Stripe do Gabaru; crie um produto e preço e coloque o id em `STRIPE_PRICE_ID`.
2. Local: `stripe listen --forward-to localhost:3000/api/stripe/webhook` e copie o `whsec_...`
   para `STRIPE_WEBHOOK_SECRET`.
3. Produção: crie o endpoint `https://gabaru.com.br/api/stripe/webhook` com o evento
   `checkout.session.completed`.

## Estrutura

```
src/
  app/
    layout.tsx, page.tsx, globals.css
    login/ cadastro/ painel/
    api/stripe/checkout/route.ts   # cria sessão de checkout (exige login)
    api/stripe/webhook/route.ts    # recebe eventos do Stripe
  context/auth-context.tsx         # AuthProvider + useAuth
  lib/
    firebase/client.ts             # SDK web
    firebase/admin.ts              # SDK admin + verificação de token
    stripe.ts                      # cliente Stripe (server-only)
```

## Autoria e direitos

© 2026 Luiza Nascimento Rosa — todos os direitos reservados. Consulte [LICENSE](LICENSE).
