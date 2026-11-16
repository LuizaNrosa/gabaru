# Erros intermediários e correções

Os verificadores foram corrigidos ou a aplicação foi ajustada antes de repetir a execução. Playwright está com `retries: 0` e `maxFailures: 1`.

| Erro observado | Correção |
|---|---|
| Executável Chromium headless revisão 1255 ausente após atualização | Instalada a revisão exigida pelo Playwright; não se repetiu o lançamento com o mesmo navegador ausente |
| Conexão inicial localhost recusada | Servidor iniciado e disponibilidade conferida antes de repetir |
| HTMLHint: sete ocorrências de `autoComplete`/`minLength` em dois HTMLs | Exceções exatas de capitalização para atributos React válidos em HTML5; regras de sintaxe/IDs mantidas |
| Node: `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` no parâmetro-property do RateBucket | Campo declarado e inicialização no construtor compatíveis com o strip-types do Node |
| Playwright: `Cannot read properties of undefined (reading HTMLHint)` | Import nomeado do módulo e pacote de tipos; falha não foi tratada como problema de acessibilidade |
| Canonical inicial esperado com barra final, recebido sem barra na raiz | Comparação por URL normalizada; domínio e caminho continuam verificados |
| `tests/e2e/gabaru.spec.ts:1` TS7016, tipos HTMLHint; linha 8 TS2322, união de headers | Tipos instalados e coleção de headers explicitamente tipada |
| `src/proxy.ts:17:47`, `17:93`, `19:32`, `20:44`: TS18048, documentos opcionais | Normalização de contadores e prazos com defaults antes de comparar; sem reexecutar build sobre os mesmos acessos inseguros |
| APK/App.tsx:57–58 `react-hooks/purity`; 82/121 `set-state-in-effect` | Refs iniciadas sem relógio no render; leitura inicial assíncrona; resets em eventos de mudança de questão |
| painel/premium/page.tsx:2 `Date.now` dentro de render | Validação de expiração movida ao serviço do servidor, com teste puro de assinatura ativa/expirada |
| Duas heurísticas de regex de paths | Segmentos e extensão validados separadamente, limite de tamanho, sem quantificadores aninhados |
| Métricas de fallback Atkinson ausentes, mesmo com fallback automático desativado | Quatro WOFF2 existentes preservados localmente, com licenças e CSS equivalentes |
| npm audit APK: deepmerge e @expo/config, baixa severidade | `npm audit fix` compatível; nova auditoria sem vulnerabilidades e APK tipado novamente |

A régua anterior também tinha um erro de conteúdo: reconhecia a estrutura das alternativas de um item que citava texto-base ausente. A publicação foi restringida à ingestão com prova de layout ou revisão editorial registrada; não se afrouxou a régua para conservar contagens.
