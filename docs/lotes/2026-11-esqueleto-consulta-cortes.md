# Consulta de nota de corte por objetivo

A entrada segue a sequência prova → instituição/processo → objetivo. A seleção específica varia conforme as regras e os dados da edição: ETEC (unidade, curso, turno), IFSC (edição, campus, curso, turno e modalidade), COLUNI (edição e modalidade), FUVEST (edição, carreira e modalidade), Unicamp (curso, modalidade e PAAIS). As ferramentas existentes mantêm suas próprias escalas e definições.

Para ENEM/Sisu, UNESP, SENAI, COTUCA e demais instituições em coleta, a interface apresenta o estado e os próximos campos, sem simular opções ou resultados. No Sisu a futura consulta deve incluir edição, instituição, campus, curso, turno, modalidade e chamada, conforme os dados oficiais disponíveis. Não confundir corte parcial, último selecionado, segunda fase ou matrícula.

Ao adicionar uma fonte, registrar edição, instituição, local, curso/carreira, turno e modalidade quando aplicáveis; chamada ou fase, valor, escala, definição, URL e data de consulta; indicar se o dado é oficial publicado ou derivado. Valores ausentes permanecem ausentes. Validar os vínculos e comparar com documentos oficiais antes de disponibilizar uma ferramenta ou apresentar um resultado. Não divulgar dados pessoais dos candidatos.

A configuração de instituições está em `src/components/seletor-nota-de-corte.tsx`; a integração de uma nova ferramenta deve incluir seus campos específicos e sua origem, além de revisão de acessibilidade, estado vazio e testes da combinação de curso e modalidade.
