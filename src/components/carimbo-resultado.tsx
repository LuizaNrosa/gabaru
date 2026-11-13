import Link from "next/link";

/**
 * A proximidade é uma convenção de orientação, não um dado oficial: o chamador
 * define `margemProximidade` na MESMA escala do resultado e da referência.
 * Não usar para converter acertos do ENEM em nota TRI ou comparar escalas distintas.
 */
export function CarimboResultado({ resultado, referencia, margemProximidade, unidade = "pontos", treinoHref }: {
  resultado: number | null;
  referencia: number | null;
  margemProximidade: number;
  unidade?: string;
  treinoHref: string;
}) {
  if (resultado === null || referencia === null || !Number.isFinite(resultado) || !Number.isFinite(referencia)) {
    return <div className="gb-notice mt-6" role="status">Ainda não há referência verificável para esta combinação. Escolha outra opção ou continue treinando. <Link href={treinoHref} className="gb-text-link">Ver simulados →</Link></div>;
  }

  const diferenca = resultado - referencia;
  const perto = diferenca < 0 && Math.abs(diferenca) <= Math.max(0, margemProximidade);
  const titulo = diferenca >= 0 ? "Dá para passar" : perto ? "Quase lá" : "Continue estudando";
  const mensagem = diferenca >= 0
    ? "Seu resultado alcança a referência desta edição. Continue revisando os principais temas."
    : perto
      ? "Você está perto da referência. Faça mais simulados para descobrir onde pode melhorar."
      : "Seu resultado ainda está abaixo da referência. Continue estudando e faça mais simulados para identificar suas dificuldades.";
  const formatar = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  return <section className="mt-6 grid items-center gap-6 rounded-md border border-n2 bg-paper p-5 sm:grid-cols-[auto_1fr] sm:p-6" aria-live="polite" aria-label="Resultado da comparação">
    <span className={`gb-stamp ${diferenca < 0 ? "gb-stamp-ink" : ""}`}>{titulo}</span>
    <div>
      <p className="text-lg font-bold">{mensagem}</p>
      <p className="mt-2 text-sm leading-relaxed text-n5">Sua pontuação: {formatar(resultado)} {unidade}. Referência: {formatar(referencia)} {unidade}. {perto && `Para esta comparação, consideramos “quase lá” até ${formatar(margemProximidade)} ${unidade} abaixo da referência.`}</p>
      <p className="mt-2 text-sm leading-relaxed text-n5">Esta é uma comparação com uma edição anterior, não uma garantia de classificação ou matrícula. As regras e notas podem mudar.</p>
      <div className="gb-actions"><Link className="gb-button" href={treinoHref}>Fazer mais simulados →</Link></div>
    </div>
  </section>;
}
