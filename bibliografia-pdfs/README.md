# Bibliografia privada

A pasta aceita PDFs com prefixos declarados no [MAPA-FONTES.json](MAPA-FONTES.json), por exemplo `bncc-anos-finais.pdf`, `ibge-atlas.pdf`, `etec-2026.pdf`, `ifsp-2026.pdf`. O mapa liga cada fonte aos 23 capítulos da coleção Gabaru Vestibulinho IFs & ETEC. O formato anterior `<livro>/<capitulo>.pdf` continua aceito quando o nome não corresponde a um prefixo.

Fontes mapeadas podem ter até 64 MiB e 1.500 páginas; o formato legado continua limitado a 32 MiB e 30 páginas por capítulo. A ingestão não faz OCR: páginas com texto insuficiente/corrompido ficam registradas como omitidas. Gráficos e figuras precisam de conferência humana; não são reconstruídos por adivinhação.

## Os dois comandos

```bash
node scripts/ingerir-bibliografia.mjs
node scripts/gerar-capitulo-livro.mjs --livro=matematica-essencial-ifs-etec --capitulo=razao-proporcao-escalas-e-regra-de-tres
```

Antes de adaptar uma fonte, crie o arquivo privado `AUTORIZACOES.json` usando [AUTORIZACOES.exemplo.json](AUTORIZACOES.exemplo.json). Identifique arquivo, SHA-256, edição/título, autores, URL, licença, prova da licença e páginas autorizadas. `usoComercialAutorizado` deve refletir a licença ou autorização real, não a simples disponibilidade do PDF. O exemplo não autoriza nenhuma obra.

O gerador confere os hashes da fonte e do mapa, seleciona trechos pertinentes, registra páginas/atribuições, inclui exemplo resolvido e seleciona **seis candidatas reais e distintas de ETEC/IFs** em Tier 1/2. A pertinência é ranqueada por termos e precisa de revisão editorial: não é uma nova classificação pedagógica validada do acervo. Sem seis candidatas, fonte íntegra, licença compatível e trechos pertinentes, não grava o capítulo. Não sobrescreve capítulo publicado.

A saída é um **rascunho privado** em `content/livros/<livro>/<capitulo>.json`. Ele não é servido como capítulo completo. Complete a exposição, confira texto/fórmulas/figuras e exercícios, e registre `revisaoEditorial: {"responsavel":"Nome da pessoa revisora","data":"AAAA-MM-DD"}` antes de marcar `status: "publicado"`. A leitura exige autenticação no servidor. Não há download de PDF/EPUB autoral.

## Licenças e anexos recebidos

Não presuma que todo material governamental seja de domínio público: atos normativos e conteúdo didático, mapas, fotos e textos de terceiros têm situações diferentes. Confira os créditos da edição. O OpenStax Prealgebra 2e atual informa **CC BY-NC-SA**, incompatível com adaptação comercial automática; uma edição anterior só pode ser usada se a licença daquela cópia estiver comprovada. Fontes CC BY-SA exigem manter a licença da adaptação e a atribuição.

Os arquivos enviados pelo usuário ficam em `referencias/`, com o inventário privado `REFERENCIAS-RECEBIDAS.json`. Prefixos `referencia-matematica-` e `referencia-fisica-` os associam aos assuntos correspondentes, mas **não autorizam reprodução**. Aulas de inglês AFA ficam separadas do núcleo de Língua Portuguesa. TXT não é convertido em livro e nenhum link/instrução contido nele é executado. RAR não é extraído automaticamente. Arquivos que excedem o limite de transferência do ambiente permanecem identificados no inventário para posterior disponibilização em partes menores.

PDFs, autorizações, amostras extraídas e inventário privado não entram no Git, no navegador ou nas funções Vercel. Somente README, mapa e modelo vazio/de exemplo são versionáveis nesta pasta. Consulte também [OPERACAO-GABARU.md](../OPERACAO-GABARU.md).
