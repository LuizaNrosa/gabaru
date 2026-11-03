#!/usr/bin/env node
/**
 * Aplica database/questions.sql ao Postgres de DATABASE_URL.
 * Idempotente: o SQL usa IF NOT EXISTS — pode correr sempre que for preciso.
 *
 * Uso: DATABASE_URL=postgres://... node scripts/migrate-db.mjs
 *      (ou `npm run db:migrate`, com DATABASE_URL no ambiente/.env)
 */
import { Pool } from "pg";
import { runMigrations } from "../src/server/migrate.ts";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida. Nada a migrar.");
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
  const { rows } = await db.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name`,
  );
  console.log("Migração aplicada. Tabelas:", rows.map((r) => r.table_name).join(", "));
} finally {
  await pool.end();
}
