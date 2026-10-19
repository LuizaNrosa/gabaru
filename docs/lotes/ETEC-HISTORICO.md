# Acervo histórico ETEC

Auditoria em 19/10/2026: 41 provas, 1.990 questões (37 regulares, quatro processos adicionais), seis anuladas. Inventário oficial por ano consultado de 2000 a 2026; documentos localizados de 2006 a 2026. Detalhes dos lotes de até três provas e limitações em etec-audit.json.

Não inclui cursos de especialização ou vagas remanescentes de módulos avançados. A referência oficial de 2025/2 fora do índice histórico aponta para um caderno que retornou HTTP 404; essa edição não foi contada nem teve respostas inventadas. Fontes: https://vestibulinho.etec.sp.gov.br/provas-gabaritos/ e páginas detalhe.asp?q=ANO; referência pendente: https://vestibulinho.etec.sp.gov.br/wp-content/uploads/2025/07/VESTIBULINHO-1o-MODULO.pdf

PDFs originais preservados, não reconstruídos por OCR. Gabaritos extraídos dos arquivos oficiais, inclusive retificações. Anuladas recebem tratamento próprio e são somadas apenas como pontos atribuídos na soma bruta; a interface não calcula classificação, critérios de desempate ou acréscimos.

O script scripts/prepare-etec.mjs prepara public/acervo/etec durante prebuild, baixando apenas fontes oficiais da lista e verificando SHA-256 antes de publicar. Interrompe o build se algum original divergir ou ficar indisponível; não publica PDFs vazios ou gabaritos incompletos. Os três lotes originais permanecem com PDFs/imagens versionados. Os demais PDFs são materializados no build, sem acrescentar dezenas de megabytes de binários ao histórico Git.

Leitor usa imagens previamente renderizadas nas três edições iniciais e PDF integral nas históricas, com abertura em nova aba como alternativa no celular. Apenas PDFs públicos do acervo admitem incorporação pela mesma origem; demais páginas mantêm bloqueio de frames. O cliente recebe somente a edição selecionada e um catálogo resumido.

Quando a página exata não foi mapeada com segurança, a interface informa a limitação e conserva a navegação manual. Texto extraído é auxiliar, não transcrição revisada. Não há resoluções comentadas, salvamento de tentativas ou nova interface Android neste lote. A API /api/v1/etec lista o catálogo e aceita ?edition=ID.

Validação: integridade dos 82 PDFs, sequência das 1.990 questões, seis anuladas, existência das imagens originais, ordenação das páginas mapeadas, TypeScript e build Next.js. Manter flags de construção e noindex. Projeto completamente separado de Linvuu.
