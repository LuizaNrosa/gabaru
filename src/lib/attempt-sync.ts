/**
 * Sincronização de tentativas (cliente → servidor).
 *
 * O aluno autenticado tem as respostas gravadas em `attempts` (Postgres) via
 * POST /api/v1/attempts — o servidor calcula o `correct` a partir de
 * `question_answers`; o cliente nunca afirma se acertou. É fire-and-forget:
 * falha de rede, 401 ou 404 (questão ainda não importada no banco) NUNCA
 * atrapalham a resolução da prova — o histórico é um benefício, não um gate.
 *
 * Idempotência: o `id` é um UUID gerado aqui; reenviar o mesmo id devolve o
 * registo original (UNIQUE(student_uid, id)), então repetir o POST é seguro.
 */

export interface EntradaTentativa {
  /** Identificador da questão no banco (ex.: `etec-2026-2-q001`). */
  questionId: string;
  selectedKey: "A" | "B" | "C" | "D" | "E";
  /** Tempo na questão em ms (0 quando desconhecido — o servidor aceita). */
  elapsedMs?: number;
}

type UsuarioComToken = { getIdToken: (force?: boolean) => Promise<string> };

function novoId(): string {
  // crypto.randomUUID existe em todos os browsers seguros suportados pelo
  // Next 16; o fallback só protege contextos exóticos.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function registrarTentativa(
  user: UsuarioComToken,
  entrada: EntradaTentativa,
): void {
  void (async () => {
    try {
      const token = await user.getIdToken();
      await fetch("/api/v1/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: novoId(),
          questionId: entrada.questionId,
          selectedKey: entrada.selectedKey,
          elapsedMs:
            typeof entrada.elapsedMs === "number" && entrada.elapsedMs >= 0
              ? Math.min(Math.round(entrada.elapsedMs), 2_147_483_647)
              : 0,
        }),
        keepalive: true,
      });
    } catch {
      // Silencioso por desenho: sem rede/sem banco, o treino continua.
    }
  })();
}
