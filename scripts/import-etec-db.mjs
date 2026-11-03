#!/usr/bin/env node
/**
 * Importa o acervo ETEC (src/data/etec-exams.json) para o Postgres.
 * Idempotente (UPSERT por id estável): correr de novo não duplica nada.
 * Aplica as migrações antes de importar, para funcionar num banco vazio.
 *
 * Uso:
 *   DATABASE_URL=postgres://... node scripts/import-etec-db.mjs
 *   DATABASE_URL=postgres://... node scripts/import-etec-db.mjs 2026-2
 *   (o argumento opcional importa só uma edição)
 */
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { runMigrations } from "../src/server/migrate.ts";
import { importEtecArchive } from "../src/server/import-etec.ts";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida. Nada a importar.");
  process.exit(1);
}

const onlyEdition = process.argv[2];
const exams = JSON.parse(
  readFileSync(new URL("../src/data/etec-exams.json", import.meta.url), "utf8"),
);
const selected = onlyEdition ? exams.filter((e) => e.id === onlyEdition) : exams;
if (!selected.length) {
  console.error(`Nenhuma edição encontrada${onlyEdition ? ` para "${onlyEdition}"` : ""}.`);
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = {
  query: async (text, params) => ({ rows: (await pool.query(text, params)).rows }),
  exec: async (sql) => {
    await pool.query(sql);
  },
};

try {
  await runMigrations(db);
  const result = await importEtecArchive(db, selected);
  console.log(
    `Importação ETEC concluída: ${result.sources} fontes, ${result.questions} questões, ` +
      `${result.answers} gabaritos (${result.annulled} anuladas).`,
  );
} finally {
  await pool.end();
}
