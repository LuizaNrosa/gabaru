# Gabaru Android — base nativa em desenvolvimento

## 1. Arquitetura recomendada
React Native + Expo SDK 58 + TypeScript. O aplicativo usa componentes nativos, sem WebView. O site continua Next.js 16. Ambos usam `/api/v1/catalog` e `/api/v1/questions`; Firebase mantém a identidade, PostgreSQL será o repositório central e R2 guardará arquivos quando essas integrações forem provisionadas.

O diretório chama-se APK por solicitação da proprietária. Ele contém código-fonte e configuração, **não um APK assinado pronto**. Não há garantia de aprovação de loja: conteúdo, política de privacidade, exclusão de conta, testes em aparelho e conformidade precisam ser concluídos.

## 2. Estrutura
- `App.tsx`: telas nativas e navegação inicial por abas, retorno Android e sessão de questões.
- `src/components/Button.tsx`: alvos de toque de pelo menos 52dp e feedback tátil.
- `src/theme.ts`: paleta e nomes de disciplinas compartilhados conceitualmente com o site.
- `src/services/api.ts`: cliente HTTPS com timeout, contrato de questões e catálogo.
- `src/services/storage.ts`: SQLite para perfil local, pacotes e respostas; imagens no diretório privado do aplicativo.
- `src/services/auth.ts`: login Firebase por e-mail e refresh token no SecureStore. Senha não persistida.
- `src/services/reminders.ts`: lembretes locais, permissão solicitada quando a pessoa ativa, e opção de cancelar.
- `app.json`: identidade Android, permissões mínimas e target/compile SDK 36.
- `eas.json`: perfis de desenvolvimento, APK interno e AAB para loja.

## 3. Telas e fluxos
Início → Questões → Disciplina/Ano → Estudo ou sessão cronometrada → Questão → Confirmação → Próxima → Conclusão.
Questões → Baixar pacote de 10 → Offline → Estudar sem conexão.
Perfil → Nome/Meta → Salvar no aparelho; login por e-mail separado do perfil local.
Perfil → Ativar/cancelar lembrete; apagar dados locais.
Início → resumo de respostas e tempo ativo por disciplina. Sem nota de acertos enquanto não houver gabaritos.

## 4. Estado real do escopo
| Módulo | Nesta base | Ainda necessário |
|---|---|---|
| Autenticação | E-mail/senha e restauração com refresh token; requer API key pública de build | Cadastro, redefinição, Google/Apple, logout validado em dispositivo, revogação e exclusão de conta |
| Perfil | Nome e meta locais | Foto, perfil no servidor e separação de dados por UID |
| Dashboard | Respostas e tempo no aparelho por matéria | Acertos/erros oficiais, sincronização e deduplicação |
| Conteúdo | Catálogo de disciplinas do banco atual | Matéria > tópico > videoaula/PDF, catálogo editorial e player |
| Questões | API real ENEM, filtros disciplina/ano, sessão de 10 | Outras instituições, dificuldade calibrada, conteúdo acessível em texto |
| Estudo | Seleção de alternativas e registro local | Feedback de acerto e resolução revisada |
| Simulado | Sessão de prática com relógio de 30 minutos | Composição fiel ao edital, correção final, retomada e nota |
| Offline | Questões e imagens baixadas em pacote | Downloads gerenciados de vídeos/PDFs, quota e expiração de conteúdo |
| Notificações | Lembrete local para amanhã, cancelável | Push FCM, token por instalação, servidor de envio e preferências |
| Compartilhamento | Folha nativa de compartilhamento de dúvida | Conquista baseada em desempenho validado |
| Gestos | Pull-to-refresh e retorno Android | Pilha de telas com swipe-back e retomada após encerramento |

Os dados de treino atuais não têm gabaritos integrados. Não inferir letras corretas com IA e mostrar como oficial. Esta base não satisfaz ainda o escopo completo de distribuição pública.

## 5. Executar e validar
1. `cd APK && npm ci` (ambiente Node compatível com Expo SDK 58).
2. Criar `.env` a partir de `.env.example`. `EXPO_PUBLIC_FIREBASE_API_KEY` é configuração pública do cliente, nunca uma chave Admin. API padrão: https://gabaru.com.br.
3. `npm run typecheck` e `npm run export:android` verificam TypeScript e bundle JS/assets. Isso **não** compila Java/Kotlin nem gera binário Android.
4. Instalar/usar EAS CLI oficial; entrar na conta Expo exclusiva do Gabaru e associar o projeto antes de builds remotos. Não registrar projeto de outra marca.
5. `npm run android` exige Android SDK/JDK/emulador configurados; `npm run apk` usa EAS e gera APK de distribuição interna, depois de credenciais/projeto autorizados. EAS pode exigir plano/créditos próprios.
6. Validar em aparelho real intermediário: sem rede, rede intermitente, pouco espaço, fonte ampliada, TalkBack, rotação, retorno por gesto e processo encerrado.
7. Concluir privacidade, exclusão de conta, classificação de conteúdo e tratamento de menores; Google Play Data safety deve corresponder ao comportamento real.
8. Configurar ícones/splash definitivos, assinatura sob controle da proprietária, Play App Signing, versionCode e testes internos. `npm run aab` gera pacote para submissão; APK é destinado ao teste interno.

## 6. Riscos e regras antes da loja
- Nenhuma chave de serviço, segredo Stripe, assinatura ou credencial R2 em `EXPO_PUBLIC_*` ou Git.
- Dados locais são de visitante/aparelho, não do usuário Firebase. Não rotular como sincronizados nem migrá-los automaticamente ao trocar de conta.
- Google login exige OAuth Android e fingerprints SHA-1/SHA-256 corretos; Apple exige configuração do provedor/serviço e fluxo de callback. Não usar login social dentro de WebView.
- Compra digital no app exige avaliação das regras vigentes de pagamentos da loja; esta base não tem checkout ou link de compra.
- Notificações remotas Android exigem FCM e development build; não prometer push testado em Expo Go.
- Conteúdo baixado exige base de uso e autorização offline; PDFs/vídeos de terceiros não serão empacotados automaticamente.
- Downloads são sequenciais; falha não substitui o pacote anterior. Implementar quota, limpeza de órfãos, integridade por hash, cancelamento e expiração antes de escalar. Não baixar o acervo inteiro.
- O relógio não reinicia entre questões, mas a sessão ainda não retoma após matar o processo. Não chamar de simulado homologado.
- Não usar APIs de localização, contatos, câmera ou microfone sem necessidade. Upload de foto futuro deve preferir seletor do sistema.
- Revisar requisitos vigentes de API, acessibilidade, edge-to-edge e Android predictive back no momento do envio. Alvo inicial desta base: API 36, conforme documentação consultada em 19/10/2026.

## Fontes técnicas consultadas
- https://docs.expo.dev/versions/latest/sdk/sqlite/
- https://docs.expo.dev/versions/latest/sdk/filesystem/
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://docs.expo.dev/versions/latest/sdk/notifications/
- https://docs.expo.dev/push-notifications/push-notifications-setup/
- https://developer.android.com/google/play/requirements/target-sdk
