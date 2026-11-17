# Lote B — resgate documental

Baseline: 24 Tier 2, 310 Tier 1, 15.965 Tier 0, 1 caderno indexável.

Resultado: {"tier-0-quarentena":13091,"tier-1-gabarito-oficial":3184,"tier-2-completa":24}. 28 cadernos aptos (limite inclusivo de 90%). Total preservado: 16.299.

## Causa raiz e correção

A ordem dos objetos textuais do PDF ETEC não é a ordem visual. Em 2019/1, página 7, o título Questão 13 vinha depois das alternativas e deslocava o vínculo com o gabarito. A leitura geométrica restaura a ordem vertical; blocos com duas sequências de alternativas são recusados. A FUVEST 2025 usa números entre chaves: os 90 blocos são reconhecidos. Fórmulas com glifos não mapeados continuam em quarentena.

Gabaritos ETEC: cabeçalho repetido não é linha de resposta. COLUNI: coluna vinculada à versão da capa e anuladas adjacentes. Imagens reais vinculadas com metadados; anotação alternativa não substitui transcrição nem a autoridade visual. Notas de cálculo pertencem ao enunciado, não à alternativa E.

## Evidências e limites

TypeScript: exit 0, work/massivo/tsc-b-final.log. Testes dirigidos: 11 pass, 0 fail, work/massivo/testes-b.log. Auditoria por ID, fonte e SHA: ../auditoria-gabaritos.json; tentativas históricas separadas dos registros atuais. Build e navegador serão repetidos no Lote D.

ENEM: cruzamento factual independente com detalhes públicos yunger7/enem-api, sem incorporar código GPL, conservando textos e imagens do acervo original. 425 correspondências independentes; as demais usam gabaritos documentais cadastrados. API oficial INEP retornou 503; ENEM API retornou 429: sem insistência, usado espelho Git de dados para comparação. FUVEST 2001/2018 continuam suspensas; não há troca silenciosa de caderno. Fontes com hash divergente ou leitura ambígua são recusadas.

O conflito PDF.js 5.4.296/worker 6.5.438 foi corrigido usando a mesma versão do parser e worker. Erros de runtime e ENOSPC interrompem o lote. Questões anuladas aceitam qualquer escolha e são excluídas do diagnóstico de erros.
