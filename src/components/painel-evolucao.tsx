"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { User } from "firebase/auth";
import { useAuth } from "@/context/auth-context";

/**
 * "Sua evolução" — histórico real de respostas do aluno, direto do banco
 * (GET /api/v1/attempts + GET /api/v1/progress), no lugar do card que dizia
 * "aparecerá aqui quando...". Estados honestos: carregando, sem banco
 * (503), sem token (401) e histórico vazio com caminho para o primeiro
 * treino. Nada de número inventado — regra da casa.
 */

interface ItemHistorico {
  id: string;
  questionId: string;
  subject: string;
  topic: string;
  selectedKey: string;
  correct: boolean | null;
  elapsedMs: number;
  createdAt: string;
}

interface PaginaHistorico {
  items: ItemHistorico[];
  total: number;
  nextOffset: number | null;
}

interface ProgressoResumo {
  totalAttempts: number;
  gradedAttempts: number;
  correctCount: number;
  accuracy: number | null;
}

/** Erro com marcador de causa para escolher a mensagem da UI. */
class ErroApi extends Error {
  constructor(public causa: "sem-banco" | "negado" | "outro") {
    super(causa);
  }
}

async function buscarComToken<T>(user: User, url: string): Promise<T> {
  const token = await user.getIdToken();
  let res: Response;
  try {
    res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new ErroApi("outro");
  }
  if (res.status === 503) throw new ErroApi("sem-banco");
  if (!res.ok) throw new ErroApi("negado");
  return (await res.json()) as T;
}

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function rotuloResultado(correct: boolean | null): { sigla: string; titulo: string } {
  if (correct === true) return { sigla: "✓", titulo: "Acertou" };
  if (correct === false) return { sigla: "✗", titulo: "Errou" };
  return { sigla: "—", titulo: "Sem gabarito (não conta no acerto)" };
}

export function PainelEvolucao() {
  const { user } = useAuth();

  const historico = useQuery({
    queryKey: ["historico", user?.uid],
    enabled: Boolean(user),
    queryFn: () =>
      buscarComToken<PaginaHistorico>(user!, "/api/v1/attempts?limit=8"),
  });

  const progresso = useQuery({
    queryKey: ["progresso", user?.uid],
    enabled: Boolean(user),
    queryFn: () =>
      buscarComToken<ProgressoResumo>(user!, "/api/v1/progress"),
  });

  if (!user) return null;

  return (
    <article className="gb-content-card">
      <p className="gb-eyebrow">DISPONÍVEL · NOVO</p>
      <h2>Sua evolução</h2>

      {historico.isPending || progresso.isPending ? (
        <div role="status" aria-label="Carregando seu histórico">
          <div className="gb-skeleton" />
          <div className="gb-skeleton" />
          <div className="gb-skeleton" />
        </div>
      ) : historico.isError && historico.error instanceof ErroApi && historico.error.causa === "sem-banco" ? (
        <>
          <p>
            O histórico guarda cada resposta no seu cadastro. Ele liga quando
            o banco de dados do Gabaru estiver conectado — enquanto isso,
            treine normalmente.
          </p>
          <p className="text-xs text-n4">
            (Configuração do servidor: variável DATABASE_URL.)
          </p>
        </>
      ) : historico.isError || progresso.isError ? (
        <>
          <p>Não conseguimos carregar seu histórico agora. Tente de novo em instantes.</p>
          <button
            className="gb-login mt-3"
            onClick={() => {
              void historico.refetch();
              void progresso.refetch();
            }}
          >
            Tentar de novo
          </button>
        </>
      ) : (
        <>
          {progresso.data && progresso.data.totalAttempts > 0 && (
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-n2 bg-paper p-3">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-n4">
                  Respostas
                </dt>
                <dd className="gb-stat-sm mt-1">{progresso.data.totalAttempts}</dd>
              </div>
              <div className="rounded-md border border-n2 bg-paper p-3">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-n4">
                  Acertos
                </dt>
                <dd className="gb-stat-sm mt-1">{progresso.data.correctCount}</dd>
              </div>
              <div className="rounded-md border border-n2 bg-paper p-3">
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-n4">
                  Aproveitamento
                </dt>
                <dd className="gb-stat-sm mt-1">
                  {progresso.data.accuracy === null
                    ? "—"
                    : `${Math.round(progresso.data.accuracy * 100)}%`}
                </dd>
              </div>
            </dl>
          )}

          {historico.data && historico.data.items.length > 0 ? (
            <>
              <ol className="mt-4 grid gap-2">
                {historico.data.items.map((item) => {
                  const r = rotuloResultado(item.correct);
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-md border border-n2 bg-paper px-3 py-2.5"
                    >
                      <span
                        aria-hidden="true"
                        className={`grid size-7 flex-none place-items-center rounded-full border font-bold ${
                          item.correct === true
                            ? "border-gold-text text-gold-text"
                            : item.correct === false
                              ? "border-anil text-anil"
                              : "border-n3 text-n4"
                        }`}
                      >
                        {r.sigla}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold capitalize">
                          {item.subject}
                        </span>
                        <span className="block truncate text-xs text-n4">
                          {item.topic} · {formatoData.format(new Date(item.createdAt))}
                        </span>
                      </span>
                      <span className="sr-only">{r.titulo}</span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-xs text-n4">
                {historico.data.total} resposta{historico.data.total === 1 ? "" : "s"} gravada
                {historico.data.total === 1 ? "" : "s"} na conta.
              </p>
            </>
          ) : (
            <p className="mt-2">
              Nenhuma resposta gravada ainda. Resolva uma prova do acervo com
              a sua conta — cada marcação entra aqui, com acerto, erro e tempo.
            </p>
          )}

          <Link href="/provas/etec" className="gb-button mt-4">
            Treinar agora <span aria-hidden="true">↗</span>
          </Link>
        </>
      )}
    </article>
  );
}
