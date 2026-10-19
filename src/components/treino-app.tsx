"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Questao = {
  id: string;
  ano: number;
  dia: number | null;
  numero: number;
  disciplina: string;
  subtopico: string;
  habilidade: string;
  tema: string;
  img: string;
  w: number;
  h: number;
};

type Fase = "escolha" | "treino" | "fim";

const NOMES: Record<string, string> = {
  matematica: "Matemática",
  fisica: "Física",
  quimica: "Química",
  biologia: "Biologia",
  geografia: "Geografia",
  historia: "História",
  portugues: "Português",
  literatura: "Literatura",
  ingles: "Inglês",
  espanhol: "Espanhol",
  artes: "Artes",
  filosofia: "Filosofia",
  sociologia: "Sociologia",
  interdisciplinar: "Interdisciplinar",
};

const QUANTIDADES = [30, 60, 90];
const LETRAS = ["A", "B", "C", "D", "E"];

export function TreinoApp() {
  const [catalog, setCatalog] = useState<{
    disciplines: { slug: string; count: number }[];
    years: number[];
  } | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [ano, setAno] = useState("");
  const [banco, setBanco] = useState<Questao[] | null>(null);
  const [erro, setErro] = useState(false);
  const [fase, setFase] = useState<Fase>("escolha");
  const [quantidade, setQuantidade] = useState(30);
  const [disciplina, setDisciplina] = useState("todas");
  const [fila, setFila] = useState<Questao[]>([]);
  const [posicao, setPosicao] = useState(0);
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respondidas, setRespondidas] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    const initial = new URLSearchParams(window.location.search).get(
      "disciplina",
    );
    if (initial) setDisciplina(initial);
    fetch("/api/v1/catalog", { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setCatalog(data);
        setBanco([]);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setErro(true);
      });
    return () => ctrl.abort();
  }, []);
  const disciplinas = catalog?.disciplines.map((d) => d.slug) ?? [];
  const disponiveis =
    catalog?.disciplines
      .filter((d) => disciplina === "todas" || d.slug === disciplina)
      .reduce((n, d) => n + d.count, 0) ?? 0;
  async function comecar() {
    setIniciando(true);
    setErro(false);
    try {
      const query = new URLSearchParams({
        limit: String(quantidade),
        disciplina,
        random: "1",
      });
      if (ano) query.set("ano", ano);
      const res = await fetch(`/api/v1/questions?${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.items.length) {
        setErro(true);
        return;
      }
      setFila(data.items);
      setPosicao(0);
      setEscolhida(null);
      setConfirmada(false);
      setRespondidas(0);
      setFase("treino");
    } catch {
      setErro(true);
    } finally {
      setIniciando(false);
    }
  }

  function confirmar() {
    if (!escolhida || confirmada) return;
    setConfirmada(true);
    setRespondidas((n) => n + 1);
  }

  function proxima() {
    if (posicao + 1 >= fila.length) {
      setFase("fim");
      return;
    }
    setPosicao((p) => p + 1);
    setEscolhida(null);
    setConfirmada(false);
  }

  if (erro) {
    return (
      <div className="rounded-2xl border border-n2 bg-white/70 p-8">
        <h1 className="text-2xl font-bold">
          Não foi possível carregar o treino.
        </h1>
        <p className="mt-3 text-n5">
          Não foi possível carregar as questões ou não há itens para esses
          filtros.
        </p>
        <button
          className="gb-button mt-5"
          onClick={() => {
            setErro(false);
            if (!catalog) window.location.reload();
          }}
        >
          Voltar e tentar novamente
        </button>
      </div>
    );
  }

  if (!banco) {
    return (
      <p className="font-mono text-sm text-n4" role="status">
        Carregando o banco de questões…
      </p>
    );
  }

  if (fase === "escolha") {
    return (
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-n4">
          Treino grátis
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Treino do dia
        </h1>
        <p className="mt-4 text-lg text-n5">
          Escolha quantas questões quer fazer hoje e a disciplina. Sem cadastro
          para começar.
        </p>

        <div className="mt-10 rounded-2xl border border-n2 bg-white/70 p-6 sm:p-8">
          <fieldset>
            <legend className="font-semibold">Quantas questões hoje?</legend>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {QUANTIDADES.map((q) => (
                <button
                  key={q}
                  type="button"
                  aria-pressed={quantidade === q}
                  onClick={() => setQuantidade(q)}
                  className={`min-h-14 rounded-xl border-2 font-mono text-lg font-bold transition ${
                    quantidade === q
                      ? "border-ink bg-ink text-paper"
                      : "border-n2 bg-paper text-ink hover:border-ink"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8">
            <label htmlFor="disciplina" className="font-semibold">
              Disciplina
            </label>
            <select
              id="disciplina"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              className="mt-3 min-h-14 w-full rounded-xl border-2 border-n2 bg-paper px-4 text-lg focus:border-ink"
            >
              <option value="todas">Todas as disciplinas</option>
              {disciplinas.map((d) => (
                <option key={d} value={d}>
                  {NOMES[d] ?? d}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-n4">
              {disponiveis.toLocaleString("pt-BR")} questões nesta disciplina,
              somando todos os anos.
            </p>
          </div>

          <div className="mt-6">
            <label htmlFor="ano" className="font-semibold">
              Ano da prova
            </label>
            <select
              id="ano"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="mt-3 min-h-14 w-full rounded-xl border-2 border-n2 bg-paper px-4"
            >
              <option value="">Todos os anos</option>
              {catalog?.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={comecar}
            disabled={disponiveis === 0 || iniciando}
            className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-gold px-6 text-lg font-bold text-ink transition hover:-translate-y-0.5 hover:bg-[#f0bd55] disabled:opacity-50"
          >
            {iniciando
              ? "Preparando treino…"
              : `Começar treino de até ${Math.min(quantidade, disponiveis)} questões`}
          </button>
        </div>

        <p className="mt-6 text-sm text-n4">
          A correção automática será ativada depois da integração e revisão dos
          gabaritos oficiais. Por enquanto, você seleciona respostas e conclui a
          sessão, sem correção ou explicações.
        </p>
      </div>
    );
  }

  if (fase === "fim") {
    return (
      <div className="text-center">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-n4">
          Treino concluído
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Você fez {respondidas} questões.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-n5">
          Sua sessão foi concluída. O histórico e o plano individual ainda estão
          em desenvolvimento; as respostas desta sessão não são salvas.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="gb-button">
            Voltar ao início
          </Link>
          <button
            type="button"
            onClick={() => setFase("escolha")}
            className="inline-flex min-h-12 items-center rounded-md border border-ink px-6 font-semibold text-ink hover:bg-ink hover:text-paper"
          >
            Fazer outro treino
          </button>
        </div>
        <Link
          href="/planos"
          className="mt-6 inline-block text-sm font-semibold underline"
        >
          Ver os planos
        </Link>
      </div>
    );
  }

  const q = fila[posicao];
  const progresso = Math.round(
    ((posicao + (confirmada ? 1 : 0)) / fila.length) * 100,
  );
  const ultima = posicao + 1 >= fila.length;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-sm font-bold text-n5">
          Questão {posicao + 1} de {fila.length}
        </p>
        <button
          type="button"
          onClick={() => setFase("escolha")}
          className="text-sm font-semibold text-n5 underline"
        >
          Sair do treino
        </button>
      </div>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-n1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progresso}
        aria-label="Progresso do treino"
      >
        <div
          className="h-full rounded-full bg-gold transition-all"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <article className="mt-6 overflow-hidden rounded-2xl border border-n2 bg-white/70 shadow-sm">
        <header className="flex flex-wrap items-center gap-2 border-b border-n2 px-5 py-4">
          <span className="rounded-md bg-ink px-2.5 py-1 font-mono text-xs font-bold uppercase text-paper">
            {NOMES[q.disciplina] ?? q.disciplina}
          </span>
          <span className="rounded-md border border-n3 px-2.5 py-1 font-mono text-xs font-bold text-n5">
            ENEM {q.ano}
            {q.dia ? ` · dia ${q.dia}` : ""}
          </span>
          <span className="rounded-md bg-gold-soft px-2.5 py-1 font-mono text-xs font-bold text-ink">
            {q.habilidade}
          </span>
        </header>

        <div className="bg-paper p-4 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={q.img}
            width={q.w}
            height={q.h}
            alt={`Questão ${q.numero} do ENEM ${q.ano}`}
            className="mx-auto h-auto max-w-full"
          />
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-sm text-n5">{q.tema}</p>
          <fieldset className="mt-4">
            <legend className="sr-only">Escolha uma alternativa</legend>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {LETRAS.map((l) => {
                const marcada = escolhida === l;
                return (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={marcada}
                    disabled={confirmada}
                    onClick={() => setEscolhida(l)}
                    className={`min-h-14 rounded-xl border-2 font-mono text-lg font-bold transition disabled:cursor-not-allowed ${
                      marcada
                        ? "border-ink bg-ink text-paper"
                        : "border-n2 bg-paper text-ink hover:border-ink"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {!confirmada ? (
            <button
              type="button"
              onClick={confirmar}
              disabled={!escolhida}
              className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-gold px-6 text-lg font-bold text-ink transition hover:-translate-y-0.5 hover:bg-[#f0bd55] disabled:opacity-50"
            >
              Confirmar resposta
            </button>
          ) : (
            <div className="mt-6 space-y-4">
              <p
                className="rounded-xl border border-n2 bg-paper p-4 text-n5"
                role="status"
              >
                Resposta registrada:{" "}
                <strong className="text-ink">{escolhida}</strong>. O gabarito
                oficial desta questão entra em breve.
              </p>
              <button
                type="button"
                onClick={proxima}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-ink px-6 text-lg font-bold text-paper transition hover:-translate-y-0.5"
              >
                {ultima ? "Ver resultado" : "Próxima questão"}
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
