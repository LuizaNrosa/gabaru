# Identidade e revisão da interface

Modo: evolução preservando a marca. Público: estudantes brasileiros resolvendo provas no celular e computador. Ação principal: escolher e responder uma questão; simulado e revisão como caminhos secundários. Densidade média, movimento mínimo e sem animação em atalhos.

Ativo real: `public/marca/gabaru-carimbo.webp`, com o wordmark existente em LogoDefs. Paleta do projeto: papel `#f7f3ea`, tinta `#232323`, carimbo `#c8501e`, texto de ação `#b0430f`, revisão `#9c2b12`. Fontes preservadas: Atkinson Hyperlegible Next e Mono, agora locais; não foram substituídas por outra família. Espaçamento, bordas e botões seguem os tokens existentes. Corpo 1.6, medida até 75ch, números tabulares e inputs 16px no celular.

| Antes | Depois | Por quê |
|---|---|---|
| OCR em disclosure e idiomas concatenados | Texto canônico semântico; variantes distintas; OCR incerto retido | Leitura e indexação não dependem de abrir um controle ou adivinhar o idioma |
| Status “completa” confundia gabarito e comentário | Badge e contagem separados para N1/N2 | Informar exatamente o que foi conferido |
| Erros apenas no estado do caderno | Histórico de revisão separado e escopo por conta | Recomeçar não apaga o caderno de erros nem mistura alunos |
| Apenas filtros editoriais | Habilidade e status, preservando query string | Encontrar itens não resolvidos e revisar erros |
| Contagens sem representatividade explícita | Incidência com amostra, cobertura e deduplicação | Não apresentar a amostra como previsão oficial da banca |
| Fonte consultada no build com métricas de fallback ausentes | Mesmos binários locais e licenças | Compilação determinística sem alterar a identidade |

Revisão das mudanças desta ordem desde `25c301a1`. Excluídos da revisão visual: lockfiles, binários, snapshots de dados e arquivos gerados. Cinco superfícies principais expandidas: busca, workspace, prova ETEC, hub de banca e página de disciplina; início também passou na checagem executável. Responsividade verificada em desktop, 390px, 320px e ampliação de 200%. Foco, nomes acessíveis, feedback e leitura sem JS foram verificados nos fluxos registrados. Não se extrapola a auditoria axe para todos os templates ou para o aplicativo nativo.
