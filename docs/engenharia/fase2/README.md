# Fase 2 — ingestão local e promoção editorial

Branch: `codex/gabaru-arquitetura-v2`. Esta fase não autoriza push nem deploy.

## Antes e depois

| Indicador | Arquitetura v2 anterior | Fase 2 |
|---|---:|---:|
| Cadernos catalogados | 667 | 667 |
| Itens, incluindo versões | 15.268 | 15.268 |
| Cadernos elegíveis ao sitemap | 0 | 1 |
| Questões com resolução elegíveis ao sitemap | 4 | 24 |
| Cadernos retidos | 667 | 666 |

Distribuição final: cadernos N0 **666**, N1 **1**, N2 **0**; questões N0 **14.224**, N1 **1.020**, N2 **24**. A única prova promovida é **ETEC 2026/2**, com 50 questões e gabarito confrontado com o PDF correspondente. Não há caderno integralmente comentado.

Os 666 cadernos retidos têm estes motivos, discriminados por ID em `auditoria-qualidade.json`: 434 sem itens transcritos e 232 com questões incompletas ou em quarentena. As contagens documentais antigas (432) não equivalem à primeira categoria: há dois registros de outros catálogos sem itens.

## Ferramentas e reprodução

Instalados `sitemap`, `pdf-parse`, `function-plot` e PyMuPDF em ambiente virtual. O lockfile Node e `scripts/requirements-pdf.txt` registram as dependências. O build público continua offline; nenhuma extração ou rede é executada implicitamente pelo build.

```bash
python -m venv work/pdf-env
work/pdf-env/bin/python -m pip install -r scripts/requirements-pdf.txt
npm run pdf:inventario
PDF_PYTHON=work/pdf-env/bin/python npm run pdf:extrair -- --banca=etec --edicao=2026-2
PDF_PYTHON=work/pdf-env/bin/python npm run pdf:lote -- --banca=etec --lote=5
npm run catalogo:gerar
npm run resolucoes:lote -- --banca=enem,etec --ano=2025,2026 --lote=20
npm run catalogo:gerar
```

O inventário final contém **398 caminhos PDF**, **231 conteúdos SHA-256 distintos**, 231 caminhos públicos e 167 em cache. Inclui os hashes e os caminhos individuais; caches não entram no Git. A extração já foi exercitada em **14 pares locais**, abrangendo ETEC, COLUNI, IFSC e IFSP: 612 itens esperados, 156 aceitos e **456 retidos**. Uma 15ª tentativa, ETEC 2025/2, não encontrou PDF íntegro local. Os outros cadernos não foram convertidos neste piloto: a classificação dos 667 é completa, a transcrição do acervo inteiro ainda exige novos lotes e revisão. `progresso-extracao-local.json` distingue tentativa retida de processamento concluído; “processado” não significa aprovado.

O extrator usa blocos e coordenadas para ordenar colunas, confronta dois PDFs com hashes esperados, preserva contexto compartilhado e extrai recortes com página/bounds. Os assets publicados incluem banca, ano **e edição**, evitando colisões de número entre provas. Fórmulas desordenadas, tabelas e textos raster exigem correções editoriais explícitas. As transcrições e descrições revisadas do piloto estão em `src/data/editorial/{contextos,correcoes,imagens}-pdf.json`. Não há alt genérico promovido automaticamente. Na tabela Tanalith, a soma impressa é 100,41%; os valores do original foram preservados.

Ausência de PyMuPDF permite salvar texto pelo `pdf-parse`, mas bloqueia promoção: texto simples não comprova ordem de leitura nem equivalência de figuras. ENEM pode entrar por `--banca=enem --edicao=2025-d2 --manifest=work/manifest.json`; o manifesto deve ter `id`, `questions` (`number`, `answer`), `examSha256`, `answerSha256`, `examUrl`, `answerUrl`, `source`. Os PDFs são localizados por SHA, inclusive fora da convenção de nomes. Numeração como 91–180 é independente da quantidade de itens. Layouts não reconhecidos permanecem em quarentena; o extrator não promete OCR universal.

## Bloqueio ENEM identificado

O erro anterior era `ECONNREFUSED 200.196.224.134` ao acessar o **espelho Objetivo**, não uma recusa comprovada do INEP:

- Espelho: https://www.curso-objetivo.br/vestibular/resolucao-comentada/enem/2024/2dia/enem2024_2dia_prova_azul.pdf
- Fonte oficial alternativa: https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_impresso_D2_CD7.pdf
- Nesta execução: HEAD oficial retornou 503; o espelho retornou 200 via proxy do ambiente. O download do espelho foi verificado contra SHA-256 `01c869e9e2760e73341fbbc8adb40e23d9fa5d1e8dbf729f2e95c09444cd69da` e salvo no cache local. Isso não promove o caderno automaticamente.

`acervo:prepare` agora executa o downloader ENEM com o proxy nativo do Node 24 (`--use-env-proxy`) e informa edição, URL e causa exata nos erros. O domínio Guia do Estudante, já presente no catálogo, foi acrescentado à lista permitida. Continuam obrigatórios HTTPS, fonte permitida e SHA conhecido; não existe fallback silencioso para PDF arbitrário.

O portal oficial de provas e gabaritos do INEP permanece a referência de autoridade. `yunger7/enem-api`/enem.dev foi consultado como referência estrutural (código GPL-2.0); nenhum código ou dataset foi copiado. Cor, aplicação, idioma e numeração precisam de correspondência explícita antes de qualquer importação. Não se atribui a esse projeto caráter de espelho oficial.

## Régua e resoluções

N0 fica fora dos sitemaps, sem indexação das páginas de prova/questão. N1 exige quantidade completa, alternativas, resposta oficial conferida, integridade dos assets e descrições. Só o caderno completo N1 entra no sitemap de provas; a questão individual N1 permanece noindex. N2 acrescenta conceito, passos e análise de cada distrator; só N2 entra no sitemap individual e na lista detalhada de itens de `llms-full.txt`.

O piloto contém 10 questões ENEM 2025/D2 e 10 ETEC 2026/2, com textos pedagógicos específicos em `piloto-fase2.json`. O CLI materializa essas propostas locais; não faz chamadas a modelos, não cria comentários genéricos para preencher lacunas nem exige credenciais. Para outro lote, forneça propostas com `--entrada=...`. O validador confere a letra, a estrutura dos três blocos e todos os distratores, **não demonstra automaticamente a correção matemática ou pedagógica de cada argumento**. O checkpoint guarda hash da proposta e fingerprint da base; mudança no enunciado, alternativas ou gabarito impede reaproveitamento automático. Só campos editoriais permitidos são aplicados. A segunda execução do piloto retomou 20, sem duplicar ou gerar novamente.

Os sitemaps usam streams, limite de 2.000 URLs e índice plano; partes adicionais são geradas por rota. `/sitemaps/questoes/1.xml.gz` oferece gzip e parte inexistente retorna 404. O teste com 4.501 URLs verifica 2.000/2.000/501 e round-trip gzip. Não há lastmod artificial.

## Interface e validação

Badges distinguem as três situações. A busca combina categoria, banca, ano, disciplina, assunto, resolução comentada e erros locais. O caderno de erros persiste fora do estado reiniciável de uma prova e não envia respostas ao servidor. Os gráficos são aprimoramento cliente; conceito, passos, distratores, equações KaTeX/MathML e tabela de pontos permanecem no HTML sem JS.

Evidências em `evidencias/`, `fluxos-verificados.json` e `links-internos.json`. TypeScript, build de produção, nove testes Node e PDF sintético de duas colunas passaram. HTMLHint e axe-core verificam início, banca, prova N1, questão N2 e busca; sem erros sintáticos ou violações axe nessas rotas. O verificador HTTP percorre os quatro sitemaps, robots, llms e links internos. O 404 `/provas/ifmg/2023` encontrado foi corrigido para o índice existente da instituição. Lint não apresenta erros; permanecem 12 avisos preexistentes de leitores de imagem/variáveis.

As falhas intermediárias foram corrigidas pela causa: opção inválida do serializador, inferência `never[]` na lista inicialmente vazia de provas, ordenação de contexto/figuras no PDF, teste que supunha lastmod apenas como data curta e asserção que procurava número em um título editorial. Não houve repetição indefinida de instalação, build ou teste com o mesmo erro.

## Entrega

Commits de implementação: `36f99892` (ferramentas e ingestão local) e `60c7c8cb` (régua, sitemaps, piloto e interface). As evidências e este relatório ficam no commit documental seguinte. Nenhum push ou deploy foi executado nesta fase.
