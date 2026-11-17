# Coleção Gabaru Vestibulinho IFs & ETEC

**Goal:** cadastrar quatro livros/23 capítulos e tornar a ingestão por prefixos reproduzível, com referências, seis exercícios de ETEC/IFs e publicação editorial controlada.

**Architecture:** manifesto público de metadados e planos editoriais; mapa bibliográfico versionado; PDFs/índice/autorizações privados; geração local de rascunhos por trechos relevantes e hashes; leitor protegido, com estado de preparação para capítulos ainda não publicados. Preservar amostras e contratos anteriores de cinco exercícios.

**Tech Stack:** Node, pdf-parse, Next, TypeScript, Zod, KaTeX, function-plot.

- [x] Testes de catálogo 4/23, fontes mapeadas, licença, hash, seis questões e rascunho protegido.
- [x] Catálogo com capítulos e status; leitor com exemplos, referências e navegação.
- [x] Ingestão de livros longos por prefixos, seleção por página e geração determinística com revisão.
- [x] TypeScript, testes, build, HTMLHint/axe e auditor integral; evidências e commit.

Não baixar nem publicar fontes sem identificação de licença. Pesquisa oficial confirma IFSP 2027 integrado (15 Português/15 Matemática) e ETEC regular (50). OpenStax atual informa CC BY-NC-SA; não presumir CC BY. Aplicar proveniência/páginas e fallback local do protocolo pdf-parser, sem serviços externos. Execução direta, sem delegação, conforme autorização do usuário.
