# Gabaru: arquitetura e decisões

## Onde fica cada coisa

| Dado | Onde | Por quê |
|---|---|---|
| Identidade (login) | Firebase Auth (e-mail/senha) | Já integrado; o servidor valida o ID token. |
| **Banco de questões** | **PostgreSQL gerenciado no Render** | Questões são relacionais e consultadas por habilidade, disciplina, prova, dificuldade e ano. Postgres faz isso com índices e SQL. |
| Progresso do aluno (tentativas, domínio por habilidade) | Mesmo PostgreSQL | Precisa juntar tentativa × questão × habilidade para calcular métricas. |
| Imagens e PDFs de questões | Cloudflare R2 (bucket privado + URL assinada) | Barato, sem custo de saída, mesma conta do Cloudflare do Gabaru. |
| Pagamento | Stripe Checkout + webhook | O webhook grava o direito de acesso (tabela `assinatura`). |
| Site | Render (web service Node) atrás do Cloudflare | |

Regra: o navegador nunca fala direto com o Postgres. Tudo passa por rotas `/api/*` que validam o ID token do Firebase.

## Modelo de dados (rascunho)

- `habilidade(id, area, numero, competencia, texto)`: as 120 habilidades da Matriz do ENEM (`src/data/enem-matriz.ts` já traz o conteúdo).
- `questao(id, enunciado, disciplina, prova, ano, dificuldade, gabarito, explicacao, status)`
- `alternativa(id, questao_id, letra, texto, explicacao_do_erro)`: alimenta o painel "o erro também ensina".
- `questao_habilidade(questao_id, habilidade_id)`: cada questão aponta para uma ou mais habilidades.
- `tentativa(id, usuario_uid, questao_id, alternativa_id, correta, tempo_ms, criado_em)`
- `dominio(usuario_uid, habilidade_id, alpha, beta, atualizado_em)`: estimativa de domínio por habilidade.
- `plano_item(usuario_uid, habilidade_id, prioridade, proxima_revisao)`
- `assinatura(usuario_uid, stripe_customer, status, ate)`

## Métricas por habilidade

Domínio = média da distribuição Beta(alpha, beta). Cada acerto soma 1 em `alpha`, cada erro soma 1 em `beta`, com peso pela dificuldade da questão. Começa em Beta(1,1) (sem informação). O mapa do aluno mostra a média e a confiança (quantas tentativas). Quando houver volume, dá para evoluir para um modelo de TRI calibrado com os dados reais.

## Plano de estudo

Fila de habilidades ordenada por `peso_na_prova × lacuna`, onde lacuna = alvo − domínio. O peso vem da prova escolhida (ENEM: 30 habilidades por área; FUVEST/UNICAMP: peso por disciplina). Itens errados voltam por revisão espaçada (1, 3, 7, 14 dias). O que está acima do alvo sai da fila.

## Segurança mínima (já no código)

- Cabeçalhos HTTP: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy (`next.config.ts`).
- API do Stripe: exige ID token do Firebase, confere a origem da requisição e limita 5 tentativas por minuto por usuário (`src/lib/seguranca.ts`).
- Webhook: confere a assinatura do Stripe sobre o corpo bruto.
- Segredos só em variáveis de ambiente do Render; `.env*` está no `.gitignore`.

## Segurança: próximos passos

1. Ativar proteção de branch no GitHub (PR obrigatório) e revogar tokens antigos.
2. No Firebase Console: restringir a chave de API ao domínio `gabaru.com.br`, ativar proteção contra enumeração de e-mails e App Check.
3. Cloudflare: SSL Full (strict), WAF gerenciado e Bot Fight Mode.
4. CSP com nonce (middleware) para remover `'unsafe-inline'` dos scripts.
5. Limite de requisições global (Render Key Value) em vez de em memória.
6. Backups automáticos do Postgres e teste de restauração.
7. Política de privacidade e termos (LGPD) antes de coletar dados de alunos; muitos serão menores de idade.
