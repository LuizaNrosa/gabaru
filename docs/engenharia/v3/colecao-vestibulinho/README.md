# Coleção Gabaru Vestibulinho IFs & ETEC e bibliografia privada

Entrega na branch `codex/linker-e-superpowers`, sobre `b8a578d2`. Quatro livros e **23 capítulos estruturados** (6 de Português, 7 de Matemática, 5 de Natureza e 5 de Humanas) estão no catálogo público `/livros`. Os capítulos novos aparecem como **Em preparação editorial**. As quatro amostras anteriores, organizadas em dois livros complementares, foram preservadas. Não se anuncia como pronto um livro ainda não revisado.

## Catálogo e leitor

`src/data/colecao-vestibulinho.json` contém sumários, tópicos, planos de exposição autorais, exemplos resolvidos em etapas e vocabulário de busca. Os slugs dos quatro livros são:

- `portugues-interpretacao-ifs-etec`;
- `matematica-essencial-ifs-etec`;
- `ciencias-natureza-ifs-etec`;
- `ciencias-humanas-atualidades-etec`.

A estante apresenta os 23 endereços `/livros/<livro>/<capitulo>`. O leitor verifica sessão no servidor; visitantes recebem 307 para `/login`. Com conta, capítulos ainda sem conteúdo publicado apresentam o planejamento e estado de preparação. Publicados podem apresentar KaTeX, exemplos em lista ordenada, gráfico/tabela, seis questões e referências por página/hash. Não há download de PDF/EPUB autoral nem endpoint JSON com o livro inteiro. As regras de cobrança e lançamento gratuito existentes não foram alteradas.

## Mapa e geração

O mapa versionado `bibliografia-pdfs/MAPA-FONTES.json` associa cada capítulo aos prefixos BNCC, INEP complementar, OpenStax, IBGE, obras de domínio público, provas oficiais e referências privadas recebidas. Os prefixos não comprovam licença. O único modelo de autorização versionado é ilustrativo, sem conceder direito a qualquer obra. `AUTORIZACOES.json`, os PDFs e o índice são privados.

```bash
node scripts/ingerir-bibliografia.mjs
node scripts/gerar-capitulo-livro.mjs --livro=matematica-essencial-ifs-etec --capitulo=razao-proporcao-escalas-e-regra-de-tres
```

A ingestão suporta fontes mapeadas de até 64 MiB/1.500 páginas e preserva números de página, hash e omissões de leitura. O formato legado `<livro>/<capitulo>.pdf` mantém 32 MiB/30 páginas e cinco exercícios. Uma fonte mapeada sem texto aproveitável entra em quarentena sem impedir as outras; nenhum OCR é inventado.

O gerador confere hash do PDF e do mapa, autorização da edição e páginas permitidas. Seleciona trechos por vocabulário do capítulo, acrescenta conceito e exemplo autorais, valida as fórmulas e escolhe **seis candidatas reais de ETEC/IFs**, distintas por texto, em Tier 1/2 e não anuladas. Os 23 capítulos têm seis candidatas na verificação atual; os IDs e termos estão na evidência `candidatas-exercicios.json`. **Coincidência textual não prova pertinência pedagógica:** a revisão deve confirmar o alinhamento antes da publicação. Não se recorre a ENEM/FUVEST, a questões em quarentena ou a alternativas inventadas para completar a lista.

A saída é sempre `rascunho`, não sobrescreve publicados e não é servida como capítulo completo. A nova coleção só aceita publicação com seis exercícios válidos, referências, exemplos e `revisaoEditorial` identificando responsável/data. Adaptações CC BY-SA preservam essa licença. Códigos curriculares são extraídos dos trechos de matriz, sem inventar habilidades; INEP não substitui BNCC nem edital. O processo não utiliza serviços externos para transformar os PDFs nem gera uma apostila completa por simples concatenação de OCR: a exposição deve ser completada e revisada editorialmente.

## Anexos do usuário

Foram registrados **44 anexos**, dos quais **39 foram armazenados privadamente**: 37 PDFs com 9.378 páginas e dois TXT auxiliares. Cinco excederam o limite de transferência de 32 MiB e permanecem identificados para recebimento em partes menores. Os RARs fazem parte desses cinco; não foram extraídos. As aulas AFA de Inglês ficam separadas do livro de Língua Portuguesa.

A ingestão real concluiu com **8.439 páginas de texto aproveitável**, **939 omitidas** e **três fontes integralmente em quarentena OCR**. As 37 fontes não têm autorização comercial comprovada nesta entrega: foram indexadas para consulta privada, não publicadas ou transcritas em livros disponíveis. Nenhum capítulo completo da nova coleção foi gerado/publicado a partir dessas obras sem autorização. O inventário completo e hashes estão em `bibliografia-pdfs/REFERENCIAS-RECEBIDAS.json`, ignorado pelo Git; veja o [inventário resumido](bibliografia-recebida.md).

## Fontes de referência verificadas

Consulta em 17/11/2026:

- [IFSP integrado 2027](https://www.ifsp.edu.br/ps2027i), Edital 166/2026: cursos técnicos integrados, 30 questões, 15 de Português e 15 de Matemática, referência do 6º ao 9º ano. Confirmado também na [notícia institucional](https://www.ifsp.edu.br/index.php/component/content/article/17-ultimas-noticias/6110-ifsp-publica-edital-com-4-504-vagas-em-cursos-tecnicos-integrados-ao-ensino-medio). Não se generaliza a todos os IFs ou modalidades.
- [ETEC — dúvidas oficiais](https://vestibulinho.etec.sp.gov.br/duvidas-frequentes/): 50 questões para Ensino Médio/Ensino Técnico regular. Modalidades de especialização têm regras próprias.
- [OpenStax Prealgebra 2e — prefácio](https://openstax.org/books/prealgebra-2e/pages/preface): a edição atual informa **CC BY-NC-SA**, divergindo da indicação CC BY do texto inicial. A edição efetivamente usada deve ter sua licença comprovada; nenhuma edição foi automaticamente autorizada.

Não se presume que todo texto, mapa ou imagem governamental seja de domínio público. A verificação da licença é por edição/arquivo, com atribuição e páginas delimitadas.

## Verificações reais

| Verificador | Resultado |
| --- | --- |
| `npx tsc --noEmit` | Exit 0; sem erros, inclusive após limpeza do ambiente |
| `npm run build` | Exit 0; Next 16.4.6; 738 entradas estáticas |
| Licenças Node | 915/915 aprovadas, nenhuma bloqueada |
| Pipeline de bibliografia/coleção | 10 testes, 0 falhas |
| `npm test` | 273 testes, 0 falhas |
| `npx vitest run` | 23 testes em 3 arquivos, 0 falhas |
| E2E Playwright novo | 4 cenários aprovados, desktop/mobile; estante SSR sem JS e 23 leitores protegidos |
| HTMLHint | 699 HTMLs, 0 erros |
| axe-core | 6 auditorias, 390/1280 px, `/planos`, `/livros`, `/privacidade`; 0 violações sérias/críticas e 0 overflow |
| Auditor integral Linkinator | 6.190 URLs internas: 6.162 HTTP 200 e 28 redirecionamentos 307 esperados; 0 falhas |
| Cobertura XML | 3.368/3.368 URLs 200, índice e todas as partes; 0 falhas de contrato |
| Guardas e indexação | 27 leitores + painel protegidos; 3 amostras Tier 0 com `noindex, follow` |
| Deploy: traces de funções | Nenhum PDF privado ou `work/` referenciado; maior conjunto de arquivos rastreados: aproximadamente 44,84 MiB, abaixo de 250 MiB |
| ESLint dos arquivos envolvidos | Exit 0; 0 erros, 42 avisos de análise estática, sobretudo caminhos dinâmicos de arquivo |
| Disco | 78%; PDFs e índice privados fora do Git |

Os sitemaps continuam com 25 hubs, 28 provas, 107 disciplinas/assuntos e 3.208 questões (2.000 + 1.208). Capítulos protegidos não foram incluídos nos sitemaps. Nenhuma questão foi promovida ou teve gabarito alterado neste lote.

As evidências textuais estão em [evidencias/](evidencias/); a tabela integral de URLs está em [relatorio-urls-linker.md](../relatorio-urls-linker.md). Testes de acesso autenticado ao conteúdo publicado são unitários neste lote; os E2E novos verificam o catálogo e a proteção de visitantes, sem alegar sessão autenticada real.

## Falhas diagnosticadas e limpeza

A tentativa de mover todo `.next` para memória escapou da árvore normal de resolução dos workers de PostCSS. Dois builds falharam com `Cannot find module '@tailwindcss/postcss'` (`work/colecao/build.log:276` e `work/colecao/build-final.log:276`; chamada no chunk gerado, linha 86). As tentativas foram interrompidas antes de corrigir a causa. O caminho executável padrão `.next` foi restaurado; caches e mapas de depuração descartáveis foram separados, preservando JavaScript, licenças e PDFs. O build final passou. Ao encerrar, o cache normal foi recriado e todos os temporários de RAM removidos.

Os caches de fontes oficiais preexistentes foram preservados em `work/fontes-cache/`, acessíveis pelos caminhos usuais `.next/cache/enem-pdfs` e `.next/cache/etec-pdfs`; não apagar essas fontes ao limpar logs descartáveis. Os 39 anexos ficam em `bibliografia-pdfs/referencias/`, com permissões privadas. Nenhum PDF, TXT recebido, RAR, `.env` ou artefato de teste entra no commit. Commit local na branch atual; sem push/deploy.
