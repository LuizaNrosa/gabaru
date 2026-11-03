import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Db } from "./db";

/**
 * Runner de migração idempotente.
 *
 * Aplica `database/questions.sql` tal e qual: o próprio SQL usa
 * `CREATE TABLE/INDEX IF NOT EXISTS`, por isso correr a migração duas
 * (ou vinte) vezes é seguro e não duplica nem apaga dados.
 *
 * Uso em código: `await runMigrations(db)`.
 * Uso em terminal: `npm run db:migrate` (scripts/migrate-db.mjs).
 */
export function readSchemaSql(): string {
  return readFileSync(join(process.cwd(), "database", "questions.sql"), "utf8");
}

export async function runMigrations(db: Db, sql: string = readSchemaSql()): Promise<void> {
  await db.exec(sql);
}
