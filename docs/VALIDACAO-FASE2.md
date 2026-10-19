# Validação desta etapa

- Next.js: compilação de produção bem-sucedida, 45 páginas geradas.
- Smoke HTTP: 37 páginas HTML públicas responderam 200 no servidor compilado local; catálogo com 2.127 itens. Login foi verificado apenas como página pública, sem autenticação real.
- API: filtros de Matemática/2020, limite de itens, rejeição de filtros inválidos e ausência de respostas no payload verificados. Instituição ETEC ainda retorna zero itens, sem inventar conteúdo.
- Importação: quatro testes do validador passaram (aprovação, duplicação, gabarito preliminar, alternativa inexistente e revisão incompleta).
- Android: TypeScript e exportação de bundle Android passaram. Não houve build APK/AAB, emulador nem aparelho real. Permissões, SQLite, downloads, Firebase e notificações ainda precisam de teste no dispositivo.
- Revisão visual no navegador pendente. Não atribuir nota Lighthouse, certificação WCAG ou taxa de conversão sem medição.
- Nenhum banco PostgreSQL ou R2 provisionado nesta etapa; SQL é migração proposta. Nenhuma questão nova ou gabarito publicado.
