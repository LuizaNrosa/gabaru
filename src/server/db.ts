import "server-only";
import { Pool } from "pg";

/**
 * Camada de dados — ligação Postgres preguiçosa (lazy).
 *
 * Sem `DATABASE_URL`, `getDb()` devolve `null` e o site continua a funcionar
 * exatamente como hoje: as rotas públicas servem os JSON em memória e apenas
 * as rotas que dependem do banco (tentativas/progresso) respondem 503.
 * Nenhum erro é lançado na ausência da variável.
 *
 * Os serviços em `src/server/` dependem apenas da interface `Db` (nunca do
 * `Pool` diretamente), o que permite testá-los com um Postgres embutido
 * (PGlite) sem tocar nesta ligação.
 */
export interface Db {
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
  /** Executa SQL sem parâmetros (ex.: migrações com vários comandos). */
  exec(sql: string): Promise<void>;
}

let pool: Pool | null = null;
let adapter: Db | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Devolve o adaptador do banco, ou `null` quando DATABASE_URL não existe. */
export function getDb(): Db | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    // Um cliente ocioso que falha (rede, restart do banco) emite "error"
    // no pool; sem listener, o Node trata-o como exceção não apanhada e
    // derruba o processo. Registar e seguir: o pool aposenta o cliente e
    // abre outro na próxima consulta.
    pool.on("error", (err) => {
      console.error("[db] erro num cliente ocioso do pool:", err);
    });
  }
  if (!adapter) {
    const p = pool;
    adapter = {
      async query<T = Record<string, unknown>>(
        text: string,
        params?: unknown[],
      ): Promise<{ rows: T[] }> {
        const result = await p.query(text, params as never[]);
        return { rows: result.rows as T[] };
      },
      async exec(sql: string): Promise<void> {
        await p.query(sql);
      },
    };
  }
  return adapter;
}
