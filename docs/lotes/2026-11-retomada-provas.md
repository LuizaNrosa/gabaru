# Retomada das provas

ETEC, COLUNI, IFSC, IFSP e ENEM salvam posição e respostas por exame no armazenamento local deste navegador. O ENEM também guarda o idioma e o resultado quando disponível. Não exige conta. Limpar os dados do navegador, trocar de aparelho ou usar navegação privada pode remover o progresso; quando o armazenamento falha, uma mensagem avisa que a sessão é temporária.

A correção do ENEM só é exibida para os cadernos marcados como conferidos no catálogo; acertos não são nota TRI. Os demais leitores mostram contagens separadas de acertos, erros, brancos e anuladas. Gabaritos e formatos diferem conforme a prova.

## Sincronização futura — ainda não implementada

Na entrada voluntária na conta, oferecer importação explícita dos progressos locais. Associar cada tentativa ao usuário autenticado, exame, edição, versão, idioma e identificador único; validar respostas no servidor. Em caso de divergência entre aparelhos, preservar ambas as tentativas e pedir escolha, sem apagar automaticamente; em modo offline, manter fila local com identificadores idempotentes e reenviar quando houver conexão. Informar duração de retenção, possibilidade de exclusão e riscos de dispositivo compartilhado; não enviar dados a terceiros para esse fim. Considerar alunos menores de idade e testar privacidade e autorização por conta. Nunca prometer sincronização antes de estar pronta.

FUVEST abre os PDFs pelo leitor integrado, quando a fonte está disponível. Unesp, Unicamp e FUVEST oferecem folha de marcação em documentos identificados como provas objetivas de primeira fase; a conferência é manual. Os gabaritos estruturados, correção automática, análises por assunto e notas de corte históricas desses exames ainda dependem de coleta e validação.

## Piloto FUVEST 2025

O caderno oficial V1 da primeira fase e o documento oficial das notas mínimas de convocação para a segunda fase estão disponíveis no próprio Gabaru. O gabarito V1 foi estruturado a partir do documento oficial das quatro versões, com 90 respostas. Fontes e hashes do caderno e do gabarito constam em `src/data/fuvest-2025-v1.json`. Os cortes são específicos de carreira e modalidade e referem-se à convocação para a segunda fase, não à aprovação final. As demais versões e edições ainda precisam de importação e conferência.

Fontes fornecidas: FUVEST (primária), Brasil Escola e Foco Medicina (catálogos auxiliares); materiais e resoluções próprias de terceiros não são apresentados como conteúdo do Gabaru. A coletânea do Foco Medicina ainda requer inventário das provas efetivamente acessíveis, sem presumir cobertura integral.

## Ampliação das versões FUVEST 2025

As versões V1 a V4 da primeira fase agora têm gabaritos separados. Cada caderno foi obtido da página oficial e teve capa, ano, versão e 34 páginas conferidos; o documento oficial do gabarito contém 90 respostas para cada versão. Os arquivos de proveniência e hashes ficam em `src/data/fuvest-2025-versoes.json`. A V1 continua servida pelo próprio Gabaru; as demais usam o leitor interno com PDF carregado da fonte oficial.

A extração é reproduzível com `scripts/importar-fuvest-2025.py`, mas é específica para o formato do gabarito de 2025: outros anos podem ter tabelas ou versões diferentes e não devem ser publicados sem adaptação e revisão. `scripts/inventariar-fuvest.py` lista candidatos em páginas oficiais e os marca como pendentes; inventário não equivale a prova conferida nem permite anunciar correção.

## Caderno visível e resposta no site

As quatro versões de 2025 têm páginas renderizadas em imagens WebP a partir dos PDFs oficiais conferidos. O aluno lê a página e marca uma questão por vez; no desktop, as alternativas ficam ao lado do caderno e, no celular, há atalhos entre o caderno e a folha. O número da questão precisa ser escolhido pelo aluno: a troca de página do caderno não identifica automaticamente a questão. As imagens preservam figuras e textos compartilhados, mas ainda não substituem transcrição acessível nem páginas de questões indexáveis por enunciado.

O script `scripts/renderizar-fuvest-2025.py` reproduz os arquivos, após validar os hashes oficiais. Esta abordagem adiciona aproximadamente 24 MiB para uma edição com quatro versões; para muitos anos será necessário armazenamento de objetos/CDN e processamento por fila, com catálogo de integridade, para evitar crescimento indefinido do repositório.

## FUVEST 2024 — cinco versões

Os cadernos V, K, Q, X e Z da primeira fase foram obtidos na fonte oficial; cada capa e hash foram conferidos. O gabarito oficial retificado em 24/11/2023 aceita duas alternativas, D ou E, para uma questão em cada versão (V: 48; K: 9; Q: 43; X: 82; Z: 57). A correção aceita qualquer uma das duas e não a trata como anulada. Proveniência em `src/data/fuvest-2024-versoes.json`; extração e imagens são reproduzíveis pelos scripts `importar-fuvest-2024.py` e `renderizar-fuvest-2024.py`.

## FUVEST 2023 — cinco versões

Os cadernos V, K, Q, X e Z da primeira fase têm 28 páginas cada e gabaritos próprios de 90 questões. As capas, o gabarito oficial e os hashes foram conferidos. Proveniência em `src/data/fuvest-2023-versoes.json`; os scripts `importar-fuvest-2023.py` e `renderizar-fuvest-2023.py` reproduzem o lote. As páginas são servidas em imagens dentro do Gabaru, com correção automática e progresso local.

## FUVEST 2022 — cadernos V e K

As versões V e K da primeira fase foram conferidas com o gabarito oficial retificado em 15/12/2021. Cada caderno contém 26 páginas e 90 questões; a 54 da versão V e a 90 da versão K são anuladas. Essas questões aparecem separadamente no resultado e não são contadas como acerto, erro ou resposta em branco. Fontes e hashes estão em `src/data/fuvest-2022-versoes.json`. Os scripts `importar-fuvest-2022-vk.py` e `renderizar-fuvest-2022-vk.py` permitem reproduzir o lote.

## FUVEST 2021 V e 2022 Q, X e Z

O caderno V de 2021 tem 28 páginas e 90 questões com gabarito oficial. Em 2022, os cadernos Q, X e Z completam as cinco versões. As questões anuladas do gabarito retificado são: Q 7, X 38 e Z 88. As cinco versões de 2022 usam o mesmo documento de origem com colunas distintas e mantêm respostas separadas por versão.

As extrações são reproduzíveis pelos scripts `importar-fuvest-2021-v.py` e `importar-fuvest-2022-todas.py`; as imagens por `renderizar-fuvest-2021-v.py` e `renderizar-fuvest-2022-todas.py`. Fontes e hashes acompanham cada caderno em `src/data/`.
