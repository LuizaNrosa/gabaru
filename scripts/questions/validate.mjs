import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
export function validateBatch(batch) {
  const errors = [];
  const seen = new Set();
  if (
    batch?.version !== 1 ||
    !Array.isArray(batch?.items) ||
    !batch.items.length
  )
    return ["Lote vazio ou versão inválida"];
  for (const [i, q] of batch.items.entries()) {
    const key = `item ${i + 1}`;
    if (!q || typeof q !== "object") {
      errors.push(`${key}: formato inválido`);
      continue;
    }
    if (
      typeof q.id !== "string" ||
      !/^[a-z0-9-]+$/.test(q.id) ||
      seen.has(q.id)
    )
      errors.push(`${key}: ID inválido/duplicado`);
    seen.add(q.id);
    if (
      !Number.isInteger(q.year) ||
      q.year < 1900 ||
      q.year > 2100 ||
      !Number.isInteger(q.number) ||
      q.number < 1
    )
      errors.push(`${key}: edição/número inválidos`);
    if (!q.institution || !q.edition || !q.booklet || !q.subject || !q.topic)
      errors.push(
        `${key}: instituição, edição, caderno, disciplina e tema obrigatórios`,
      );
    if (!q.statement?.trim() && !q.image?.startsWith("/questoes/"))
      errors.push(`${key}: enunciado ou imagem local obrigatório`);
    if (
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      new Set(q.options.map((o) => o.key)).size !== q.options.length
    )
      errors.push(`${key}: alternativas inválidas`);
    for (const field of ["examUrl", "answerUrl"]) {
      try {
        const u = new URL(q.source?.[field]);
        if (u.protocol !== "https:") throw Error();
      } catch {
        errors.push(`${key}: ${field} HTTPS obrigatório`);
      }
    }
    if (
      !Number.isInteger(q.source?.page) ||
      q.source.page < 1 ||
      !/^([a-f0-9]{64})$/.test(q.source?.sha256 ?? "")
    )
      errors.push(`${key}: página/hash da prova obrigatórios`);
    if (!/^([a-f0-9]{64})$/.test(q.source?.answerSha256 ?? ""))
      errors.push(`${key}: hash do gabarito obrigatório`);
    if (q.status === "published") {
      if (q.rights?.status !== "cleared" || !q.rights?.basis)
        errors.push(`${key}: publicação exige base de uso registrada`);
      if (
        q.review?.statement !== "approved" ||
        q.review?.answer !== "approved" ||
        !q.review?.reviewer ||
        !q.review?.reviewedAt
      )
        errors.push(`${key}: revisão do enunciado/gabarito obrigatória`);
      if (!["final", "annulled"].includes(q.answer?.status))
        errors.push(`${key}: exige gabarito definitivo ou anulação`);
      if (
        q.answer?.status === "final" &&
        !q.options.some((o) => o.key === q.answer.key)
      )
        errors.push(`${key}: resposta fora das alternativas`);
    }
  }
  return errors;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const path = process.argv[2];
  if (!path || !existsSync(path)) {
    console.error("Uso: node scripts/questions/validate.mjs lote.json");
    process.exit(1);
  }
  const errors = validateBatch(JSON.parse(readFileSync(path, "utf8")));
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log(
    "Lote válido; somente itens publicados e revisados podem seguir para importação.",
  );
}
