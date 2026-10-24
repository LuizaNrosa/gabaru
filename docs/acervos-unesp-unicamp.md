# Acervos de UNESP e Unicamp

Conferência: 24/10/2026. Rotas: `/provas/unesp` e `/provas/unicamp`,
ambas dentro de Vestibulares. Os anos têm páginas próprias, seleção de
documentos e leitura do PDF na mesma origem.

## Conteúdo e cobertura

- UNESP: 56 documentos oficiais, com fontes em todos os anos de 2004 a 2026.
  São 23 cadernos avulsos, 11 gabaritos, 5 relatórios com cadernos nos anexos
  e 17 relatórios com reprodução de questões no capítulo de desempenho.
  Os relatórios antigos têm diagramação própria e estão identificados dessa forma.
  Regular e meio de ano aparecem separados quando há arquivos avulsos disponíveis.
- Unicamp: 580 documentos de 1987 a 2026, incluindo cadernos, gabaritos,
  respostas esperadas, comunicados e provas comentadas oficiais.
  A seleção de documentos distingue as fases e as habilidades específicas.
  O segundo vestibular de 1988 tem identificação própria.
- Cada documento publicado foi baixado, validado como PDF e conferido com
  Poppler. O manifesto registra URL, página oficial de origem, ano, tamanho,
  número de páginas, página de entrada e SHA-256. Arquivos com o mesmo hash
  são consolidados. Versões reordenadas continuam identificadas como documentos;
  não são contabilizadas como novas questões.

Não é uma declaração de acervo histórico integral. Não foram localizados no
levantamento os cadernos da UNESP anteriores a 2004, e os relatórios anuais
não comprovam cobertura integral de todas as seleções de meio de ano.
As páginas comunicam a cobertura e as pendências.

Na Comvest, permanecem indisponíveis os links oficiais para o arquivo
complementar “solução do enigma” (2002), `Acenicas.pdf` (2003) e `Musica.zip`
(2004). O manifesto conserva as URLs e os erros. As demais provas de cada
um desses anos estão acessíveis.

## Coleta reproduzível

Requisitos: Python 3 da biblioteca padrão e `pdftotext` do Poppler.

```bash
python scripts/collect-vestibulares.py unesp
python scripts/collect-vestibulares.py unicamp
```

O cache intermediário fica em `tmp/vestibulares`; os manifestos ficam em
`src/data/unesp-archive.json` e `src/data/unicamp-archive.json`.
A coleta consulta somente páginas e documentos públicos das instituições.
Links herdados de outras edições são atribuídos usando o ano do caminho
oficial ou da capa; quando o mesmo link aparece em vários anos, a página
anual mais antiga tem precedência. Gabaritos também são identificados pelo
cabeçalho do PDF, além dos nomes dos arquivos.

## Entrega dos PDFs

`/api/v1/vestibulares/[institution]/[document]` resolve somente documentos
presentes no manifesto. Verifica domínio, protocolo HTTPS, redirecionamentos,
tamanho e SHA-256 antes de responder. Não aceita URL arbitrária nem realiza
downloads durante o build. Os PDFs permanecem dependentes da disponibilidade
da fonte pública; o leitor oferece acesso direto à origem como alternativa.

Não foi ativada correção automática nem inserção de questões individuais
no banco de treino para essas duas instituições. Discursivas e redações
permanecem disponíveis no PDF original, com arquivos oficiais de respostas
quando encontrados.

## Validação

```bash
node --test tests/official-pdf.test.mjs tests/vestibular-archives.test.mjs
npm run typecheck
npx next build
```

Os testes exigem Node 24 ou uma versão com suporte à execução de TypeScript
por remoção de tipos. Verificam integridade, restrição dos downloads aos
domínios oficiais, duplicação de arquivos, presença de fontes de questões
em cada ano declarado e regressões de classificação.
