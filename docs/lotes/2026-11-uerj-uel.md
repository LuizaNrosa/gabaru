# UERJ e UEL: primeiro lote

Dois exames de qualificação UERJ 2026 e dois cadernos da UEL 2026 (inglês tipo 1 e espanhol tipo 1). Os dois idiomas da UEL são variantes da mesma aplicação, não vestibulares independentes. Os quatro PDFs apresentados ao aluno são cadernos sem resolução; na UEL a prova original foi combinada com o gabarito oficial definitivo. As redações e questões discursivas não são corrigidas automaticamente.

Cada exame tem 60 questões objetivas; UERJ usa A–D, e as questões 23–27 dependem da língua estrangeira. UEL usa A–E. Os gabaritos da UEL foram extraídos automaticamente das tabelas definitivas. A UEL declarou expressamente a anulação na prova comentada de referência: questão 41 no inglês tipo 1 e questão 43 no espanhol tipo 1. Os gabaritos da UERJ foram transcritos manualmente por seções e idiomas; a questão 38 do primeiro exame está expressamente anulada no gabarito. Na folha, anuladas são separadas de acertos, erros e branco; o resultado é de treino e não calcula nota oficial ou classificação. Arquivos e hashes estão em `src/data/uerj-uel-2026.json`.

Fontes: https://www.vestibular.uerj.br/?p=15701 ; https://www.vestibular.uerj.br/?page_id=15994 ; https://www.cops.uel.br/v2/ProvasGabaritos/DivulgacaoProvasGabaritos1DiaVestibularDefinitivo/Selecao/370/Atividade/20969 . O importador recebe arquivos previamente baixados dessas páginas. A transcrição UERJ foi conferida por seção, mas não constitui revisão pedagógica individual de cada questão. A prova comentada da UEL foi consultada só como evidência da anulação e não é exibida ao estudante.

## Próximos cadernos a verificar

- FUVEST 2026, primeira fase: a questão 3 do caderno V1 foi anulada segundo https://g1.globo.com/sp/sao-paulo/noticia/2025/11/25/fuvest-anula-questao-de-matematica-da-1a-fase-do-vestibular-2026.ghtml ; é necessário obter o gabarito retificado e conferir a versão antes de publicar.
- Unicamp 2022 Q/X: o acervo contém prova e gabarito; o documento da Comvest declara anulada a questão 42. A reprodução integral dos cadernos deve observar as condições da banca registradas em `2026-11-unicamp-design.md`.
- Unesp meio de ano 2018: buscar caderno e gabarito em https://www2.unesp.br/portal#!/vestibular/arquivo/meio-2018/ e conferir correspondência antes da importação.

## Mais quatro exames UERJ

Acrescentados 1º e 2º exames de qualificação de 2025 e de 2024, 60 questões e alternativas A–D em cada. O importador `scripts/importar-uerj-2024-2025.py` extrai cada seção e as três colunas de língua diretamente do gabarito, valida a numeração e registra hashes. Os gabaritos das seguintes provas informam expressamente anulação: 2025 2º exame questão 38; 2024 1º exame questão 29 e 2º exame questão 59. No 1º exame 2025 nenhuma anulação consta no gabarito consultado. Nos casos em que há gabarito retificado, ele foi usado. O PDF exibido é o caderno sem resolução. Fonte de cada prova e gabarito na página oficial indicada no registro `src/data/uerj-2024-2025.json`.

## PRs em rascunho anteriores

Na conferência de PRs abertos, #38 e #24 apresentavam conflitos com a main; #24 inclui integração de pagamentos e pendências descritas no próprio PR. #15 indicava recuperação de PDFs pendente, embora a main já contenha COLUNI 2013–2026. #35 indicava que a transcrição ENEM 2024 dia 2 ainda precisava de conferência contra o caderno oficial. Eles não foram incorporados automaticamente apenas pela solicitação de merge, pois dependem de conciliação, testes e conferência próprios. Esta observação não comprova que todas as alterações desses rascunhos já tenham sido incorporadas por outros caminhos.
