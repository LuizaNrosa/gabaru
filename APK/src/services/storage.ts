import * as SQLite from "expo-sqlite";
import { File, Directory, Paths } from "expo-file-system";
import type { Question } from "./api";
import { imageUrl } from "./api";
const dbPromise = SQLite.openDatabaseAsync("gabaru.db").then(async (db) => {
  await db.execAsync(
    `PRAGMA journal_mode=WAL;CREATE TABLE IF NOT EXISTS packs(id TEXT PRIMARY KEY,payload TEXT NOT NULL,created_at INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS attempts(id INTEGER PRIMARY KEY AUTOINCREMENT,question_id TEXT NOT NULL,subject TEXT NOT NULL,selected TEXT NOT NULL,elapsed_ms INTEGER NOT NULL,created_at INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS profile(id INTEGER PRIMARY KEY,name TEXT NOT NULL,goal TEXT NOT NULL);`,
  );
  return db;
});
export async function savePack(
  items: Question[],
  progress: (n: number) => void,
) {
  const db = await dbPromise;
  const dir = new Directory(Paths.document, "questions");
  if (!dir.exists) dir.create();
  const stored: Question[] = [];
  for (const [i, q] of items.entries()) {
    if (!/^[a-zA-Z0-9-]+$/.test(q.id)) throw new Error("ID inválido");
    const file = new File(dir, `${q.id}.webp`);
    if (!file.exists) await File.downloadFileAsync(imageUrl(q), file);
    stored.push({ ...q, img: file.uri });
    progress(i + 1);
  }
  await db.runAsync(
    "INSERT OR REPLACE INTO packs(id,payload,created_at) VALUES(?,?,?)",
    "current",
    JSON.stringify(stored),
    Date.now(),
  );
}
export async function getPack(): Promise<Question[]> {
  const row = await (
    await dbPromise
  ).getFirstAsync<{ payload: string }>(
    "SELECT payload FROM packs WHERE id=?",
    "current",
  );
  return row ? JSON.parse(row.payload) : [];
}
export async function clearLocal() {
  const db = await dbPromise;
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM packs");
    await db.runAsync("DELETE FROM attempts");
    await db.runAsync("DELETE FROM profile");
  });
  const dir = new Directory(Paths.document, "questions");
  if (dir.exists) dir.delete();
}
export async function saveAttempt(
  q: Question,
  selected: string,
  elapsed: number,
) {
  await (
    await dbPromise
  ).runAsync(
    "INSERT INTO attempts(question_id,subject,selected,elapsed_ms,created_at) VALUES(?,?,?,?,?)",
    q.id,
    q.disciplina,
    selected,
    Math.max(0, elapsed),
    Date.now(),
  );
}
export async function stats() {
  return (await dbPromise).getAllAsync<{
    subject: string;
    count: number;
    elapsed: number;
  }>(
    "SELECT subject,COUNT(*) as count,SUM(elapsed_ms) as elapsed FROM attempts GROUP BY subject",
  );
}
export async function profile() {
  return (await dbPromise).getFirstAsync<{ name: string; goal: string }>(
    "SELECT name,goal FROM profile WHERE id=1",
  );
}
export async function saveProfile(name: string, goal: string) {
  await (
    await dbPromise
  ).runAsync(
    "INSERT OR REPLACE INTO profile(id,name,goal) VALUES(1,?,?)",
    name,
    goal,
  );
}
