# Auditoria de cobertura de Português · Apostila ETEC

A matriz registra 2.090 questões em 43 cadernos, incluindo os quatro adicionais. Foram classificadas 610 questões de Português, das quais 609 são válidas. Questões anuladas foram revisadas e ficaram fora dos numeradores.

A classificação usa a operação principal. Uma questão interdisciplinar entra em Português quando a solução depende principalmente da leitura ou da análise da linguagem. Conhecimento externo de outra disciplina, quando decisivo, determina a classificação nessa disciplina.

A cobertura reversa, por habilidade principal, cruza cada questão válida com seu código no edital verticalizado e com o capítulo que ensina essa habilidade. A revisão qualitativa abaixo confronta conceitos e técnicas específicos com o enunciado e as alternativas. A bateria publicada tem seleção própria do banco, com gabaritos e comentários autorais.

| Tópico | Cadernos | Incidência | Itens com capítulo | Capítulo |
| --- | ---: | ---: | ---: | --- |
| LP01 · Compreensão literal, ideia central e inferência | 41/43 | 95,35% | 208 | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/compreensao-e-inferencia) |
| LP02 · Gêneros, finalidade, público e multimodalidade | 33/43 | 76,74% | 93 | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/generos-e-leitura-multimodal) |
| LP03 · Argumentação, fato, opinião e fontes | 18/43 | 41,86% | 30 | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/argumentacao-e-revisao) |
| LP04 · Sentido contextual e figuras de linguagem | 39/43 | 90,7% | 73 | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/sentido-e-leitura-literaria) |
| LP05 · Coesão, coerência e intertextualidade | 32/43 | 74,42% | 67 | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/coesao-e-intertextualidade) |
| LP06 · Morfossintaxe, pontuação, ortografia e acentuação | 35/43 | 81,4% | 87 | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/gramatica-e-variacao) |
| LP07 · Variação linguística, registros e adequação | 8/43 | 18,6% | 8 | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/gramatica-e-variacao) |
| LP08 · Leitura literária e recursos narrativos e poéticos | 23/43 | 53,49% | 42 | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/sentido-e-leitura-literaria) |
| LP09 · Produção, edição, oralidade e práticas de linguagem | 1/43 | 2,33% | 1 | [Leitura](https://gabaru.com.br/livros/vestibulinho-etec/argumentacao-e-revisao) |

Resultado da checagem por habilidade principal: **609/609 (100%)**. A lista integral de identificadores, páginas e cadernos está na [matriz](matriz-incidencia-etec.json).

## Casos de verificação qualitativa

| Questão oficial | Técnica ou conceito conferido | Seção da teoria |
| --- | --- | --- |
| `etec-2026-1-q001` | Relação expressa e limite da paráfrase | Informação literal e paráfrase |
| `etec-2023-1-q021` | Leitura de uma consequência de saúde explicitada no suporte | Textos técnicos e enunciados compostos |
| `etec-2014-2-q029` | Leitura do símbolo de uma campanha eleitoral | Charge, tirinha, foto e anúncio |
| `etec-2026-2-q031` | Finalidade de um cartaz sustentada por dados e imperativos | Gênero, suporte e finalidade |
| `etec-2019-2-q002` | Reconhecimento de zeugma | Som, repetição e sequência |
| `etec-2009-1-extra1-q009` | Sinonímia contextual | Sentido em contexto e relações de palavras |
| `etec-2026-1-q021` | Intenção do eu lírico inferida pelos versos | Construção literária |
| `etec-2026-1-q012` | Retomada de referente em texto com vários atores | Coesão referencial |
| `etec-2026-2-q030` | Restrição e contraste sinalizado por e | Coesão sequencial e relações lógicas |
| `etec-2026-2-q029` | Dados como justificativa de uma tese de campanha | Tese, argumento, exemplo e evidência |
| `etec-2007-2-q001` | Transposição da leitura de quadros para uma frase discursiva | Planejamento, edição e oralidade |
| `etec-2020-1-q032` | Transposição para discurso indireto | Tempos, modos, vozes e pronomes de tratamento |
| `etec-2019-1-q038` | Formação de palavras e neologismo | Grafia, acentuação e reescrita |
| `etec-2018-1-q045` | Colocação pronominal | Regência, crase e pronomes |
| `etec-2008-2-q032` | Impessoalidade verbal e grafia de porque | Grafia, acentuação e reescrita |
| `etec-2026-1-q024` | Vocativo e interlocução | Sintaxe, pontuação e sentido |
| `etec-2022-2-q007` | Reconhecimento do registro coloquial em canção | Variedades, registro e preconceito |

A revisão acrescentou zeugma, distinção entre exposição e injunção, formação de palavras, colocação pronominal, impessoalidade verbal e transposição de discurso. Os itens `etec-2008-2-q032` e `etec-2009-1-extra1-q009` foram recodificados após a releitura do comando.

Os 12 itens da bateria foram conferidos contra o banco, com justificativa da alternativa correta e comentário dos quatro distratores. A auditoria de vínculo integral não produz uma resolução inédita de cada item histórico.

Reprodução da checagem estruturada com `node scripts/auditar-cobertura-portugues-etec.mjs`.
