# Unicamp e validação de design

## Primeira leva

As provas de primeira fase com correção automática são 2026 Q/X, 2025 Q/Z, 2024 Q/Y e 2023 Q/Z. Cada uma tem 72 questões e alternativas A–D, como consta nas capas. O importador `scripts/importar-unicamp-lote1.py` valida hashes, ano, caderno, correspondência dos pares de versões, quantidade de questões e de alternativas. Os gabaritos vêm da Comvest, registrados em `src/data/unicamp-lote1.json`. O asterisco é usado apenas onde a Comvest declara anulação: 2023 questão 23 e 2025 questão 53. A folha exibe o carimbo; o resultado separa anuladas, sem calcular a pontuação oficial de classificação.

A visualização usa o leitor de PDF já existente, sem adicionar cópias de provas ao repositório. A Comvest informa que a autorização de reprodução de questões anteriores é apenas parcial e não abrange a prova inteira: https://www.comvest.unicamp.br/vestibulares-anteriores/1a-fase-2a-fase-comentadas/ . O cabeçalho do PDF da Comvest tem `X-Frame-Options: SAMEORIGIN`, logo não é possível incorporá-lo diretamente por iframe de outro domínio. O leitor atual obtém o PDF pela rota já existente do Gabaru; seu uso e armazenamento devem ser avaliados conforme as condições da Comvest. No celular, o suporte a PDF incorporado depende do navegador e pode exigir abertura em outra aba; não equivale ao leitor por imagens do vestibulinho.

A folha oferece A–D nas edições conferidas de 2022–2026 e mantém alternativas anteriores nas demais edições. Marcações E já salvas não são apagadas: o aluno recebe aviso e precisa ajustá-las antes de corrigir. Verificados navegação, marcação, resultado, carimbo e retomada em 390 e 1440 px. O PDF foi bloqueado no teste automatizado da folha; a disponibilidade dos quatro endpoints do leitor em produção foi checada separadamente.

## Design e ferramentas

- `pbakaus/impeccable` é a ferramenta principal; `DevvGwardo/impeccable` adapta o mesmo projeto para Hermes. `github.com/Impeccable` é um perfil, cujos repositórios públicos não são essa ferramenta. Detector upstream `impeccable detect` executado no componente de folha: sem achados nos padrões analisados. Não confundir detecção automatizada com auditoria completa de UX ou acessibilidade.
- `npm run validar:design` verifica a folha da Unicamp 2025 em 390 e 1440 px, idioma `pt-BR`, transbordamento, quatro alvos de pelo menos 44 px e regras WCAG automatizadas do axe-core. Requer servidor iniciado e navegador Playwright instalado; `DESIGN_BASE_URL` define a origem. É um teste focado, não uma certificação de conformidade nem uma análise de todas as páginas.
- Os dados estruturados existentes foram tipados com `schema-dts`; `public/llms.txt` descreve recursos reais. Nenhum deles garante rich results, indexação ou citação por IA.
- Clarity não foi ativado: falta ID do projeto e definição de consentimento e privacidade adequada ao público, inclusive menores. Unlighthouse é uma auditoria complementar ainda não integrada. Os componentes propostos para áudio, troca de idiomas e checkout mencionavam outra plataforma e não foram aplicados sem uso concreto no Gabaru.
