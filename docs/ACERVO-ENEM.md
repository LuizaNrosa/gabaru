# Acervo ENEM — organização e conferência

© 2026 Luiza Nascimento Rosa — todos os direitos reservados.

O Inep é a fonte das provas e dos gabaritos oficiais. O Gabaru é um projeto independente; os direitos dos documentos de terceiros pertencem aos respectivos titulares. A transcrição e as classificações de estudo são auxiliares: o caderno oficial prevalece.

## Arquivos

- `src/data/enem-exams.json`: catálogo dos cadernos incorporados, com ID, ano, dia, descrição, quantidade e disciplinas.
- `content/enem/<id>/dados.json`: questões e classificações de cada caderno. Preserve os números e a identificação da aplicação.
- `public/questoes/<id>-qNNN.webp`: recortes exibidos no site; a numeração usa pelo menos três dígitos.
- `content/questoes/`: conteúdo organizado por disciplina e tema para o banco de questões.
- `ferramentas/enem/`: ferramentas existentes de extração, organização e conferência; revise suas saídas antes de incorporá-las.
- `src/app/provas/enem/`: catálogo e páginas por caderno; `src/lib/enem-acervo.ts` reúne acesso aos dados.
- `tests/enem-acervo.test.mjs`: confere os IDs, quantidades, dados e arquivos WebP de todos os cadernos do catálogo.

## Ao acrescentar um caderno

1. Identifique ano, aplicação, dia, cor e versão na fonte oficial do Inep; registre e confira a correspondência entre prova e gabarito. Não trate versões de cor como provas diferentes sem verificar seu conteúdo.
2. Preserve o conteúdo existente e use um ID único. Para itens de língua estrangeira, preserve a distinção das versões e informe a escolha de apenas um idioma.
3. Acrescente os dados e os recortes, atualize o catálogo e revise manualmente recortes, gráficos, questões anuladas, transcrição e numeração contra a fonte oficial.
4. Execute `node --test tests/enem-acervo.test.mjs`, a suíte completa, `npm run typecheck` e `npm run build`. A verificação de arquivos e contagens não prova que uma transcrição ou gabarito está correto.
5. Não publique gabaritos ou explicações em `GET /api/v1/questions`. Não anuncie correção automática ou notas como disponíveis antes de sua implementação e validação.

Fonte: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos
