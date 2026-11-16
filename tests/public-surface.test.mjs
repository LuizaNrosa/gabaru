import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Superfície pública — o que NUNCA pode voltar a existir em public/.
 *
 * Auditoria de 2026-11-03 (docs/AUDITORIA-BACKEND-2026-11-03.md), pendência
 * P0: `public/treino/banco.json` era servido como ficheiro estático. A base
 * viva do treino vive em `src/data/treino-banco.json` (só o servidor lê, via
 * src/lib/questions.ts) e o gabarito nunca sai pela API (questions-public.ts).
 * Estes testes guardam as duas metades dessa regra.
 */

const raiz = process.cwd();
const dirPublic = join(raiz, "public");

function arquivos(dir, acumulado = []) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) arquivos(caminho, acumulado);
    else acumulado.push(caminho);
  }
  return acumulado;
}

test("P0: public/treino/banco.json não existe (a base vive em src/data/)", () => {
  assert.equal(
    existsSync(join(dirPublic, "treino", "banco.json")),
    false,
    "A base de treino não pode ser servida como ficheiro estático.",
  );
  assert.equal(
    existsSync(join(raiz, "src", "data", "treino-banco.json")),
    true,
    "A base viva deve existir em src/data/treino-banco.json (leitura só no servidor).",
  );
});

test("nenhum ficheiro em public/ contém gabarito", () => {
  const suspeitos = [];
  for (const caminho of arquivos(dirPublic)) {
    // Só texto: JSON, JS, HTML, SVG, CSV, MD. PDFs/WebP/PNG ficam de fora.
    if (!/\.(json|js|mjs|html|svg|csv|md|txt|xml|webmanifest)$/.test(caminho)) continue;
    const texto = readFileSync(caminho, "utf8");
    // "gabarito" como campo/valor de dados, não menção editorial em MD.
    if (/["':]gabarito["':]?\s*[:=]/i.test(texto)) suspeitos.push(caminho);
  }
  assert.deepEqual(
    suspeitos,
    [],
    `Ficheiros públicos com possível gabarito: ${suspeitos.join(", ")}`,
  );
});
