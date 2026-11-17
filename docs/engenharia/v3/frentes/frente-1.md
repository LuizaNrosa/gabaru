# Frente 1 — conferência e triagem auditável

Baseline 657885bc: 24 Tier 2, 262 Tier 1, 16.013 Tier 0. A seleção original dos 1.109 IDs foi congelada a partir de 1ae44ebe com SHA-256. Dos 993 ainda retidos, 48 foram reconstruídos a partir de blocos completos dos PDFs com hashes e gabarito integral conferidos. Resultado: **24 Tier 2, 310 Tier 1 e 15.965 Tier 0**. Não se contaram novamente os 116 resgates anteriores.

Execução: `node scripts/conferir-gabaritos-1109.mjs --aplicar`; sem a flag, apenas dry-run. `triagem-quarentena-16k.mjs` congela os 16.013 IDs originais e classifica todos, incluindo referência a WebP de página oficial quando houver mapeamento seguro. A descrição estruturada registra apenas dados existentes: não inventa conteúdo visual. Alternativas em imagem sem transcrição semântica continuam retidas mesmo com gabarito conhecido. COLUNI mantém A–D conforme documento oficial; não se inventa E.

Os resultados por ID estão em `conferencia-1109.json`, `triagem-16013.json` e `triagem-conferencia.json`. A nova passagem de triagem não encontrou outras promoções seguras. Bucket C inclui também conteúdo ausente e prova documental insuficiente; esses casos não se tornam publicáveis só por não conterem ruído de OCR. FUVEST 2001/2018 não foi promovida por estes scripts.

Os sitemaps são derivados do catálogo regenerado; questões novas são elegíveis imediatamente, cadernos somente quando todos os itens satisfazem a régua. O build e a auditoria final da Frente 3 validam os XMLs servidos e uma questão recém-promovida.
