# Auditoria integral de URLs

**Goal:** sincronizar a árvore consolidada, documentar contratos e eliminar links internos quebrados com evidência reproduzível.

**Architecture:** auditor Node inicia seu próprio Next compilado, expande o índice XML, usa Linkinator para rastrear páginas e recursos internos e grava tabela por URL com origem. Proteção de sessão e noindex são verificações separadas. Nenhum acesso a servidores externos.

**Tech Stack:** Next.js, Node 24, Linkinator, node:test, Superpowers e Spec-Kit.

- [x] Sincronizar main e isolar branch; instalar ferramentas; fechar PRs obsoletos.
- [x] Registrar contrato vivo em specs/.
- [x] Testar expansão recursiva e isolamento de origem; implementar auditor.
- [x] Executar build e auditoria, corrigindo causas de links quebrados.
- [x] Validar resultados e revisar diff antes do commit.

Revisão direta: não delegar nem pausar para aprovação de plano, pois o usuário já autorizou explicitamente a execução completa. Não confundir redirects de login com falhas públicas. Não reduzir cobertura para obter resultado verde.
