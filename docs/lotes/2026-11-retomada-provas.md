# Retomada das provas

ETEC, COLUNI, IFSC, IFSP e ENEM salvam posição e respostas por exame no armazenamento local deste navegador. O ENEM também guarda o idioma e o resultado quando disponível. Não exige conta. Limpar os dados do navegador, trocar de aparelho ou usar navegação privada pode remover o progresso; quando o armazenamento falha, uma mensagem avisa que a sessão é temporária.

A correção do ENEM só é exibida para os cadernos marcados como conferidos no catálogo; acertos não são nota TRI. Os demais leitores mostram contagens separadas de acertos, erros, brancos e anuladas. Gabaritos e formatos diferem conforme a prova.

## Sincronização futura — ainda não implementada

Na entrada voluntária na conta, oferecer importação explícita dos progressos locais. Associar cada tentativa ao usuário autenticado, exame, edição, versão, idioma e identificador único; validar respostas no servidor. Em caso de divergência entre aparelhos, preservar ambas as tentativas e pedir escolha, sem apagar automaticamente; em modo offline, manter fila local com identificadores idempotentes e reenviar quando houver conexão. Informar duração de retenção, possibilidade de exclusão e riscos de dispositivo compartilhado; não enviar dados a terceiros para esse fim. Considerar alunos menores de idade e testar privacidade e autorização por conta. Nunca prometer sincronização antes de estar pronta.

FUVEST abre os PDFs pelo leitor integrado, quando a fonte está disponível. Unesp, Unicamp e FUVEST oferecem folha de marcação em documentos identificados como provas objetivas de primeira fase; a conferência é manual. Os gabaritos estruturados, correção automática, análises por assunto e notas de corte históricas desses exames ainda dependem de coleta e validação.

## Piloto FUVEST 2025

O caderno oficial V1 da primeira fase e o documento oficial das notas mínimas de convocação para a segunda fase estão disponíveis no próprio Gabaru. O gabarito V1 foi estruturado a partir do documento oficial das quatro versões, com 90 respostas. Fontes e hashes do caderno e do gabarito constam em `src/data/fuvest-2025-v1.json`. Os cortes são específicos de carreira e modalidade e referem-se à convocação para a segunda fase, não à aprovação final. As demais versões e edições ainda precisam de importação e conferência.

Fontes fornecidas: FUVEST (primária), Brasil Escola e Foco Medicina (catálogos auxiliares); materiais e resoluções próprias de terceiros não são apresentados como conteúdo do Gabaru. A coletânea do Foco Medicina ainda requer inventário das provas efetivamente acessíveis, sem presumir cobertura integral.
