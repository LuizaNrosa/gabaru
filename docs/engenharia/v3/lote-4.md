# Lote 4 — biblioteca e resoluções

Catálogo `/livros` com duas apostilas e quatro capítulos iniciais originais, sem apresentar o catálogo como obra completa. Conteúdo em módulo `server-only`, carregado apenas após cookie de sessão verificado (com revogação) e assinatura ativa no servidor. Capítulos são dinâmicos, não entram no prerender, não há endpoint PDF/EPUB ou JSON de livro completo. Links não antecipam capítulos por prefetch. Marca de sessão usa hash, sem expor UID ou cookie. Não se promete impedir cópia por um leitor autorizado.

Capítulos incluem teoria, KaTeX SSR, questões públicas validadas para fixação, tabela acessível para o gráfico e descrição textual para o diagrama molecular. A largura editorial será consolidada no Lote 6.

`ResolucaoQuestao` centraliza conceito, passos e distratores. Vídeo opcional exige ID YouTube com 11 caracteres e início inteiro limitado. A fachada só cria iframe nocookie ao clicar; não há vídeo bruto ou vídeo fictício cadastrado. CSP permite somente os hosts de thumbnail e player necessários.
