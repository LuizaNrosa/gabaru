# Próximo lote: IFSP integrado

2026/1 Tipo 1, 2025/1 Prova A e 2024/1 Prova A: 90 questões, 46 páginas e seis PDFs oficiais conferidos. Dados preparados e revisados por agentes distintos; ainda não fazem parte do catálogo público.

`manifest.json` registra fontes, hashes, anulações e revisão. `loteifsp2026-2024.json` preserva as respostas e o mapeamento revisados. Os PDFs podem ser recuperados das fontes oficiais listadas, sempre comparando SHA256 com o manifesto aprovado antes de integrar.

Para reproduzir uma extração em pasta separada, use Python com PyMuPDF, execute `prepare.py` e `extract.py`. Uma nova extração deve passar por nova revisão; não sobrescreva o manifesto aprovado sem comparar hashes e respostas.

Antes de publicar:

- Adaptar leitor e validador para alternativas por edição: A–E em 2026 e A–D em 2025/2024.
- Usar só Tipo 1/Prova A; não somar Tipo 2/Prova B como novas questões.
- Preservar anulações: 2026 Q27; 2025 Q5; 2024 Q20 e Q25.
- Criar catálogo, rotas, API e links exclusivamente em Vestibulinhos; incluir PDFs verificados na publicação.
- Executar testes, build, PR, merge e confirmar o deploy real.
