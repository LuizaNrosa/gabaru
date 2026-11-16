# Integração dos PRs pendentes — 16/11/2026

Integração autorizada dos PRs #24, #35, #74, #78, #79, #87 e #99. Base `main`: `37d5fe60`. Os históricos completos foram incorporados à branch `codex/gabaru-arquitetura-v2`, sem squash, preservando a autoria e permitindo ao GitHub reconhecer os PRs integrados.

## Resolução dos conflitos

- #24: mantidas as versões atuais de dependências, ESLint e autenticação com verificação de revogação. Incorporados TanStack Query, histórico paginado de tentativas e validação Zod. O provider do painel fica dentro da proteção de sessão no servidor. A leitura de entitlement usa `subscriptions`, a mesma fonte do painel premium. O antigo aplicador Stripe, que registrava eventos antes do efeito, foi substituído pelo processamento transacional já existente.
- #35: mantida a transcrição externa do ENEM 2024/D2, com atribuição, licença e figuras em revisão fixa. Ela usa o HTML de transcrição e suas próprias figuras; não aponta para recortes locais inexistentes. Conteúdo permanece em conferência.
- #78/#79: unificados os catálogos IF sem perder IFMT/IFRS mais recentes. IFRN 2026 tinha o mesmo gabarito, início, total e paginação em duas origens; a listagem usa um único registro, preservando imagens existentes e acrescentando PDFs com hashes. IFBA passa a ter seu leitor real. A base do #79 foi alinhada a `main` para concluir a cadeia de integração.
- #74: preservados todos os lotes UERJ dependentes, incluindo 2015/2016.
- #87: incorporadas as quatro fontes oficiais em materiais gratuitos.
- #99: enviados também os cinco commits locais ainda não publicados, preservando as proteções recentes e o saneamento do acervo.

## Correções encontradas na validação

O teste de estudo usava remoção incompleta de tags por regex. Agora verifica o texto no DOM. O importador ENEM usa manifesto de URLs, IDs e hashes aprovados em código, além da validação de protocolo, domínio, redirecionamento e integridade. Os quatro alertas do CodeQL do head anterior desapareceram: o check passou em `74022347`.

O comando `npm test` executa todos os testes unitários/de acervo; Firestore continua em comando próprio, pois exige emulador. CI prepara imagens antes de testar. O runner também cria o diretório temporário `work/`, evitando a falha de checkpoint observada no runner limpo do GitHub. O teste ENEM distingue pares inglês/espanhol e fontes externas de recortes locais. A primeira suíte integral encontrou quatro falhas; a preparação e os testes foram corrigidos na causa, sem suprimir registros ou criar arquivos fictícios.

## Catálogo após integração

687 cadernos; 16.299 itens. N0: 16.129; N1: 146; N2: 24. A integração não promove OCR novo automaticamente. As contagens de `total/README.md` e `total/placar.json` são a fotografia anterior à integração; a auditoria de qualidade gerada reflete o catálogo atual.

## Limites

A integração não ativa checkout, não configura credenciais Stripe/Firebase e não publica regras Firestore. Testes do APK cobrem tipagem, não uma execução Android. Os avisos heurísticos do ESLint permanecem documentados; zero erros não significa ausência absoluta de vulnerabilidades.

## Resultado das verificações locais

- 229 testes unitários e de acervo aprovados; zero falhas e zero skips.
- 26 E2E aprovados em desktop/celular; mais 22 rotas novas auditadas em viewport móvel, com imagens locais disponíveis, sem overflow e sem violações axe sérias/críticas.
- 583 HTMLs sem erro no HTMLHint; 548 alvos de links internos sem falhas.
- TypeScript do site e APK aprovados; lint sem erros (98 avisos heurísticos/legados).
- Emulador Firestore: isolamento por usuário, escrita de plano negada e replay transacional aprovados.
- Build de produção aprovado; npm audit de produção sem vulnerabilidades conhecidas.

As imagens paginadas ETEC e ENEM foram geradas e versionadas para que o HTML não dependa de downloads posteriores. A paginação ETEC move os PDFs verificados para cache privado, conforme o pipeline existente; os hashes e fontes permanecem no catálogo. A primeira execução interrompida de paginação foi retomada e a integridade foi confirmada pela suíte completa.

Logs e o verificador das novas rotas estão em `integracao-prs-evidencias/`. Os testes de navegador completos mantêm suas regras de contraste habilitadas. Os logs contêm avisos Node sobre detecção de módulos TypeScript; não são falhas de teste.

## Correção do CI em ambiente limpo — PR #107

Os dois jobs do primeiro head do #107 falharam na mesma causa: `scripts/prepare-etec.mjs:70`, `2013-1/prova: HTTP 403`, devolvido pelo servidor legado ao runner hospedado. Nenhum desses jobs foi simplesmente reexecutado. Os 82 PDFs ETEC já conferidos pelo SHA-256 foram divididos em partes de até 1 MiB e adicionados ao manifesto de restauração existente. Somados ao PDF COLUNI já registrado, o manifesto possui 83 entradas. O CI restaura essas cópias antes de preparar os leitores.

Verificação local: 82 PDFs reconstruídos e 1 já íntegro; preparação dos 82 PDFs ETEC com `fetch` explicitamente proibido aprovada. Os testes de download agora comprovam erro 403 sem retry, erro 503 com no máximo duas tentativas e rejeição de hash divergente. A suíte integral passou novamente: **231 testes, zero falhas e zero skips**. A alteração afeta ingestão, cópias verificadas e fixtures, sem mudança no código das páginas já auditadas.
