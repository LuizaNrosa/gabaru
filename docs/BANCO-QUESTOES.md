# Acervo oficial do Gabaru: aquisição, revisão e integração

## Objetivo
Importar questões oficiais em lotes rastreáveis; produzir resoluções autorais revisadas. IA auxilia extração e classificação, mas não transforma questão inventada em oficial e não decide sozinha um gabarito. Não copiar resoluções de cursinhos.

## Fontes e prioridade
1. ENEM / INEP: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos . Primeiro corrigir e completar o lote já existente, conferindo ano, aplicação, dia, caderno, idioma e posição. Microdados somente tabelas de itens necessárias, sem dados individuais dos candidatos.
2. ETEC / CPS: https://vestibulinho.etec.sp.gov.br/provas-gabaritos/?processo=1 . Separar semestre, modalidade e tipo de seleção. Prioridade comercial de vestibulinho.
3. COTUCA: https://exame.cotuca.unicamp.br/provas_anteriores . A página informa gabarito na primeira página do arquivo; verificar cada edição.
4. FUVEST: https://www.fuvest.br/acervo/ . Separar primeira fase e discursivas, versão de caderno e gabaritos retificados.
5. COMVEST, VUNESP, IFs, Coluni e Colégios Embraer: localizar e registrar a página oficial de cada processo antes da coleta. Não tratar todos os IFs/Colunis como uma única prova, nem presumir permissão para reutilizar acervos de organizadoras privadas.
6. Concursos: instituição e banca oficial por edital. Cebraspe certo/errado e discursivas exigem contratos de questão próprios; não forçar o modelo A–E.

## Publicação e origem
Disponibilidade pública de PDF não prova, por si só, autorização para reproduzir todo o conteúdo comercialmente. Registrar termos/base de uso e autoria de imagens e textos incorporados. Quando a base não estiver esclarecida, manter o lote em revisão e oferecer link à fonte. Não enviar solicitações a instituições sem instrução específica da proprietária.

## Esteira de produção
1. Inventário de edições e URLs oficiais, incluindo prova, gabarito definitivo e retificações.
2. Download com limites por origem, cache, tentativas limitadas e hash SHA-256; guardar PDF original imutável fora do Git.
3. Extrair texto nativo; OCR apenas onde necessário. Preservar notação matemática, tabelas, contexto compartilhado e imagens. Cada recorte guarda página e coordenadas.
4. Criar IDs estáveis por instituição/edição/aplicação/caderno/número; mapear cadernos equivalentes a um item canônico, sem contar versões de cor como novas questões.
5. Conferir alternativas e gabarito por versão; anulações são um estado, não uma letra. Itens sem correspondência ficam em quarentena.
6. IA sugere disciplina, tópico, habilidade e resolução. Revisão editorial valida cada enunciado/alternativa e resposta; matemática exige conferir equações, gráficos e unidades. Resolver por método independente ajuda a detectar erros.
7. Validar lote com `node scripts/questions/validate.mjs lote.json`. Esse comando valida o contrato, NÃO importa nem confirma automaticamente o conteúdo.
8. Publicar lote pequeno, medir erros e só ampliar após amostragem e revisão adequadas. Piloto sugerido: 100 itens; depois 500 por lote. São metas de operação, não produtividade já comprovada.

## Critérios de aceite
100% dos itens publicados com fonte, página, caderno, hash, base de uso e revisão registrados; nenhuma resposta presumida; nenhum duplicado de ID; sem fórmula/figura ilegível. Gabarito e resolução têm estados distintos. Dificuldade estimada por revisor é rotulada; dificuldade empírica só após amostra suficiente. TRI não é percentual de acertos nem um algoritmo genérico.

## Integração implementada nesta etapa
`GET /api/v1/catalog`: contagens reais, disciplinas e anos do lote existente.
`GET /api/v1/questions?disciplina=matematica&ano=2020&limit=30&offset=0`: seleção paginada, limite 90; `random=1` cria amostra para uma sessão, não paginação estável. Sem gabaritos no payload. O treino web passou a usar esse endpoint e não baixa todo o banco ao abrir.
A API ainda usa o JSON legado local em memória, apropriado para o lote atual; não é a arquitetura final de milhões de itens. Todos os gabaritos atuais continuam pendentes. Não há novas questões publicadas por este trabalho.

## Próxima infraestrutura
PostgreSQL: fontes, questões, revisões e tentativas; migração proposta em `database/questions.sql`, ainda não aplicada. R2: PDFs originais privados e imagens versionadas. Imagens públicas para conteúdo aberto, URLs temporárias para conteúdo restrito. Nunca service-account ou chave R2 no app. API Next.js substitui o repositório JSON sem mudar a interface móvel.
Correção futura: POST autenticado com ID, revisão e alternativa; servidor consulta gabarito separado e registra tentativa idempotente. Simulado oculta correção até finalizar; estudo pode mostrar feedback imediato. Offline permite pacote explicitamente aberto com gabaritos revisados, nunca respostas de provas restritas/ativas. Sincronização por UUID evita duplicação.

## Metas de expansão
Etapa 1: sanear o lote ENEM e resolver gabaritos, não inflar contagem. Etapa 2: ETEC e COTUCA com Português/Matemática e contexto completo. Etapa 3: exames paulistas, IFs e instituições selecionadas. Etapa 4: concursos por banca. A velocidade é medida em itens aprovados/hora e taxa de retrabalho, não PDFs baixados.

## Indicadores
Cobertura por prova/edição/tema; proporção com gabarito definitivo; proporção com resolução revisada; divergências por 100 itens; duplicação; custo/tempo por item aprovado; tempo de resposta p95 e tamanho do pacote móvel. Corrigir lote problemático exige retirar/revisionar itens e invalidar caches e downloads.
