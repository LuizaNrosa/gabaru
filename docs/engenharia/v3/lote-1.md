# Lote 1 — fundação da plataforma v3

Data: 16/11/2026. Base: `1ae44ebe`. Branch: `codex/gabaru-plataforma-v3`. Sem push, PR ou deploy nesta ordem.

As nove instalações `skills add` com fontes MIT passaram. O instalador Impeccable Apache-2.0 confirmou a instalação atualizada (CLI 4.9.2, skills reportadas 4.9.1). Inventário com fontes, commits e licenças em `skills-instaladas.json`; textos de licença preservados em `licencas-skills/`.

Exceções verificadas: `delphi-ai/animate-skill` não declara licença (a API LICENSE retorna 404). A skill `animate` ativa vem agora da fonte MIT `emilkowalski/skills`, sem confundir as origens. Na política inicial, o Tastemaker (MIT + CC BY 4.0) foi retirado das skills ativas. Após a autorização expressa de outras permissivas, foi reinstalado com atribuição; o inventário ativo foi atualizado. A cópia temporária de quarentena foi removida na limpeza final.

## Dependências

Todos os oito pacotes de produção e cinco validadores pedidos foram instalados/conferidos. Novos no lock: `smiles-drawer` 2.4.1 (MIT), `ts-fsrs` 6.0.0 (MIT), `chroma-js` (BSD-3-Clause AND Apache-2.0) e `@open-spaced-repetition/srs-kit` (BSD-3-Clause). A versão 6 da biblioteca ts-fsrs suporta o modelo FSRS-7; teste executado com `version: 'FSRS-7'`, memória rápida e revisão futura. O parser SMILES reconheceu etanol e rejeitou sintaxe incompleta.

O Node foi alinhado a 24 LTS (`>=24.12.0 <25`), conforme os requisitos da biblioteca e da árvore Firebase existente. Os testes não ativam ainda o agendamento no produto; a integração funcional pertence ao Lote 5.

## Trava de licenças

`npm run validar:licencas` verifica todas as entradas do lock, incluindo desenvolvimento e opcionais. O prebuild e os workflows verificam a política antes da compilação. Expressões OR podem escolher uma alternativa autorizada (MIT OR GPL usa MIT); AND exige que todas as licenças sejam autorizadas. Identificadores desconhecidos e exceções WITH ficam bloqueados. A licença MIT omitida nos metadados de limiter 1.1.5 é reconhecida apenas pelo hash exato do texto distribuído.

Auditoria final: **828 entradas, 798 aprovadas, 30 fora da lista explícita**. São dependências herdadas, não os quatro pacotes novos. Incluem 14 registros LGPL em variantes opcionais de Sharp/libvips e outras licenças não listadas (BlueOak, Boost/BSL, dados CC BY, entre outras). Nem toda entrada fora da lista é copyleft. O relatório separa cada expressão e variante de plataforma; não equivale a afirmar que todas são carregadas neste Linux.

Cadeias concretas: Next 16.4.1 → Sharp → libvips LGPL; function-plot → interval-arithmetic-eval → interval-arithmetic BSL-1.0. A lista literal exige resolver essas dependências ou rever a política antes de compilar. O build foi interrompido no prebuild; não se declara build aprovado nem se usa HTML/axe de uma build anterior como evidência desta branch.

## Validação

238 testes aprovados, zero falhas/skips; TypeScript aprovado; ESLint sem erros (96 avisos herdados). Política de licenças tem testes de AND/OR, metadados ausentes, árvore inválida e licença falsificada. Os logs estão em `evidencias-lote1/`.

Nenhuma página, conteúdo pedagógico, identidade visual ou serviço de produção foi alterado neste lote. O Lote 2 começa com inventário somente de leitura.

## Política ajustada pelo usuário e fechamento do Lote 1

O usuário autorizou outras licenças permissivas e LGPL exclusivamente da cadeia Sharp/libvips herdada. `scripts/lib/licencas-herdadas-v3.json` fixa as 14 variantes existentes na base `1ae44ebe` por caminho, versão, expressão de licença e integridade do tarball. Novas dependências ou novos artefatos LGPL continuam bloqueados; GPL, AGPL e SSPL permanecem sem concessão. O Tastemaker pôde ser reinstalado, preservando as licenças MIT e CC BY 4.0 e suas atribuições. Delphi continua sem licença declarada.

Após essa autorização: **build código 0**, auditoria 828/828 aprovada (incluindo as exceções identificadas), cinco testes da política aprovados. O build anterior bloqueado registra a política estrita então vigente; a regra foi alterada somente após autorização explícita. A build nova está registrada em `evidencias-lote1/build-autorizado.log`. Lote 1 encerrado; a aplicação ainda não foi modificada.

## Política final autorizada

A autorização posterior aceita outras licenças permissivas e LGPL somente dos artefatos Sharp/libvips herdados. `scripts/lib/licencas-herdadas-v3.json` fixa caminho, versão, integridade e baseline. Alterar o artefato invalida a exceção. GPL/AGPL/SSPL sem alternativa permissiva permanecem bloqueadas. Resultado ativo: `work/v3/licencas-build.json`, 828 aprovadas, zero bloqueadas. O Tastemaker foi reinstalado após autorização de MIT + CC-BY-4.0; o inventário inicial descreve o bloqueio histórico, não a política final. Animate utiliza exclusivamente a implementação MIT de emilkowalski; delphi-ai sem licença não foi incorporado.
