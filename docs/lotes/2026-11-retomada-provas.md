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

## FUVEST 2020 V

O caderno V da primeira fase, com 26 páginas e gabarito oficial de 90 questões, está disponível para leitura e correção. Os endereços oficiais e hashes constam de `src/data/fuvest-2020-versoes.json`. A extração foi verificada a partir da tabela do gabarito e deve ser novamente conferida antes de reproduzir em outros anos.

## FUVEST 2018 e 2019 — cadernos V

Os cadernos V da primeira fase de 2018 e 2019 possuem, respectivamente, 28 e 25 páginas e 90 questões cada. As respostas foram extraídas dos gabaritos oficiais correspondentes. Fontes e hashes estão em `src/data/fuvest-2018-2019-versoes.json`; `importar-fuvest-2018-2019-v.py` e `renderizar-fuvest-2018-2019-v.py` reproduzem o lote. Cada caderno permite resposta no site, correção e retomada no navegador.

## FUVEST 2016 e 2017 — cadernos V

Os cadernos V da primeira fase de 2016 e 2017 possuem 30 e 28 páginas, respectivamente, e 90 questões cada. Gabaritos, fontes e hashes estão em `src/data/fuvest-2016-2017-versoes.json`; a importação e a renderização são reproduzíveis pelos scripts homônimos. Pendências de acessibilidade e escala estão registradas em `PENDENCIAS.md`.

## FUVEST 2012–2015 — cadernos V

As primeiras fases V de 2012, 2013, 2014 e 2015 têm 90 questões por caderno. Na FUVEST 2014, questão 51 foi anulada; o leitor a identifica com carimbo e a separa do resultado. Fontes e hashes estão em `src/data/fuvest-2012-2015-versoes.json`; os scripts de importação e renderização permitem reproduzir o lote.

## FUVEST 2008–2011 — cadernos V

As primeiras fases V de 2008, 2009, 2010 e 2011 têm 90 questões cada. Em 2010 o gabarito lista, para cada alternativa, o número da questão de cada versão; a importação converte essa tabela para número → resposta. Fontes e hashes estão em `src/data/fuvest-2008-2011-versoes.json`, com scripts de importação e renderização reproduzíveis.

## FUVEST 2004–2007 — cadernos V

As primeiras fases V de 2004, 2005 e 2006 têm 100 questões; a de 2007 tem 90. O gabarito de 2004 está na página 17 do PDF oficial, por isso a navegação do leitor mostra as 16 páginas da prova e não exibe o gabarito antes da correção. Os PDFs oficiais completos, acessíveis pelos links de fonte, podem conter o gabarito. Fontes e hashes estão em `src/data/fuvest-2004-2007-versoes.json`; scripts de importação e renderização reproduzem o lote.

## FUVEST 2000–2003

Estão preparados os dois exames de 2000, o primeiro exame de 2001, os dois exames de 2002 e a prova de 2003: 80 questões por exame em 2000–2002 e 100 questões em 2003. Nos PDFs com gabarito anexo, as páginas de respostas ficam fora da navegação normal. O segundo exame de 2001 permanece em conferência por divergência entre a capa e o restante do PDF, registrada em `PENDENCIAS.md`. Fontes e hashes constam de `src/data/fuvest-2000-2003-versoes.json`; os scripts de importação e renderização reproduzem o lote.

## UNESP 2025 — vestibular regular

A prova de conhecimentos gerais da primeira fase possui 90 questões e 32 páginas. O caderno e o gabarito de versão 1 foram obtidos na Vunesp, identificados pelo código VNSP2404 e comparados aos hashes do acervo. A questão 1 do caderno e o gabarito B foram confrontados com fonte independente; a extração automática completa mantém proveniência e não significa revisão humana de cada uma das 90 questões. Imagens, respostas e posição são disponibilizadas no leitor interno, com correção automática. Fontes e hashes constam de `src/data/unesp-2025-regular.json`; os scripts de importação e renderização permitem reproduzir o lote. Demais edições da UNESP ainda exigem conferência de versão e gabarito.

### Lote UNESP: quatro cadernos adicionais

Integração da primeira fase da UNESP 2026 regular e meio de ano, 2025 meio de ano e 2022 regular (Biológicas), sempre versão 1: 360 questões em quatro cadernos, com imagens no leitor e correção automática na folha. `scripts/importar-unesp-lote.py` confere os hashes contra o catálogo oficial, a aplicação, o ano, o código, o cabeçalho do gabarito, os 90 itens e o número de páginas antes de gerar as imagens e os dados. Os PDFs oficiais utilizados e respectivos hashes constam em `src/data/unesp-lote-quatro.json`. A extração dos gabaritos é automática; ela não constitui conferência humana de cada questão. A verificação de eventual retificação posterior dos gabaritos permanece necessária antes de apresentá-los como definitivos. A folha informa acertos, não calcula a nota classificatória.

### Lote UNESP: 2024, 2023 e 2022

Incluídas as primeiras fases 2024 regular e meio de ano, 2023 regular e 2022 Exatas e Humanidades (versão 1): quatro cadernos e 360 questões. `scripts/importar-unesp-lote-2.py` valida documentos e gabaritos pelos hashes do catálogo oficial, ano, aplicação, código, versão, 90 respostas e páginas. O gabarito regular 2024 não apresenta o ano no texto extraído; a identificação foi confirmada pelo código VNSP2303, data e página oficial. Foram consultadas as listas públicas dos quatro processos na Vunesp, que apresentam os gabaritos usados sem outro gabarito retificado identificado; não há garantia de que essas listas esgotem decisões individuais. As 90 respostas de 2024 (ambas as aplicações), 2023 e 2022 Exatas/Humanidades também foram comparadas visualmente com fontes independentes publicadas (ue.com.br, Poliedro e G1). Em 2022, questão 30 de Exatas/Humanidades recebeu sugestão de recurso do Estratégia; a proposta não comprova anulação, então mantém-se a alternativa B do gabarito Vunesp. Fontes: https://ue.com.br/banco-de-questoes/questoes-da-unesp/2024 ; https://poliedroresolve.sistemapoliedro.com.br/vestibulares/unesp/2023/1-fase-18/questao-71-1-fase-unesp-2023 ; https://g1.globo.com/sp/sao-carlos-regiao/noticia/2021/11/15/unesp-2022-veja-gabarito-e-correcao-comentada-da-prova-do-segundo-dia.ghtml ; https://vestibulares.estrategia.com/portal/enem-e-vestibulares/vestibulares/gabarito-unesp/ . A comparação das listas não é uma revisão pedagógica de cada questão.
