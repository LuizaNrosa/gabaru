# ENEM — proveniência e métricas do acervo

© 2026 Luiza Nascimento Rosa — todos os direitos reservados.

O inventário pode ser reproduzido com `node scripts/inventariar-enem.mjs`. Ele lê o catálogo e os arquivos locais e produz JSON, sem alterar o acervo. Não inclui dados pessoais, não baixa arquivos e não certifica a precisão das transcrições.

Na conferência de 9 de novembro de 2026, havia 26 cadernos com 2.127 itens, sem pastas de cadernos fora do catálogo e sem imagens faltantes. Nenhum dos registros do catálogo possuía campo identificado de URL específica da prova ou hash do PDF original. Isso não prova a inexistência das fontes ou dos originais em outro local e não constitui conferência da correspondência com o Inep. O endereço geral oficial de provas e gabaritos está registrado no inventário.

Para completar a rastreabilidade de cada edição, registrar após conferência: ano, aplicação, dia, cor e versão, URL da prova, URL do gabarito definitivo e retificações, hash do original, data de acesso, status de revisão e procedência de cada conteúdo reproduzido. Não preencher campos desconhecidos por suposição. A política existente em `docs/BANCO-QUESTOES.md` exige verificar a base de uso dos materiais de terceiros.

## Notas de corte e demanda

As bases existentes `src/data/etec-demanda-cortes.json`, `src/data/coluni-demanda-cortes.json` e `src/data/ifsc-demanda-cortes.json` correspondem aos respectivos vestibulinhos e preservam métodos e fontes próprios. Elas não devem ser reutilizadas como notas do ENEM ou do Sisu. Não foi identificada nesta análise uma base de notas de corte do Sisu no repositório; não exibir números sem fonte, ano, edição, instituição, curso, turno, modalidade e método de apuração.

Quantidade de acertos não é nota TRI. Não apresentar uma estimativa de TRI ou de aprovação como resultado oficial sem método adequado e dados verificáveis.
