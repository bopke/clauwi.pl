import "server-only";

// Dostęp do doradców w D1 — jedyne źródło prawdy dla publicznego katalogu i panelu.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Advisor } from "./advisors";

export type PublicSort = "nazwa" | "miejscowosc";
export type PublicPageParams = { woj: string; q: string; sort: PublicSort; offset: number; limit: number };
export type PublicPage = { items: Advisor[]; total: number };

const COLUMNS = [
  "id", "nazwa", "poziom", "wojewodztwo", "miejscowosc",
  "email", "www", "telefon", "oferta", "aktywny",
] as const;

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

type Row = Record<string, unknown>;

function rowToAdvisor(r: Row): Advisor {
  return {
    id: String(r.id),
    nazwa: (r.nazwa as string) ?? "",
    poziom: (r.poziom as string) ?? "",
    wojewodztwo: (r.wojewodztwo as string) ?? "",
    miejscowosc: (r.miejscowosc as string) ?? "",
    email: (r.email as string) ?? "",
    www: (r.www as string) ?? "",
    telefon: (r.telefon as string) ?? "",
    oferta: (r.oferta as string) ?? "",
    aktywny: !!r.aktywny,
  };
}

function insertStmt(DB: D1Database, a: Advisor) {
  const placeholders = COLUMNS.map(() => "?").join(", ");
  return DB.prepare(`INSERT OR IGNORE INTO advisors (${COLUMNS.join(", ")}) VALUES (${placeholders})`).bind(
    a.id, a.nazwa, a.poziom, a.wojewodztwo, a.miejscowosc,
    a.email, a.www, a.telefon, a.oferta, a.aktywny ? 1 : 0,
  );
}

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => "\\" + c);
}

// ----- Public reads -----

/** Liczba aktywnych doradców na województwo (klucze = slug woj, w tym "zagranica"). */
export async function getWojCounts(): Promise<Record<string, number>> {
  const DB = await db();
  const { results } = await DB.prepare(
    "SELECT wojewodztwo AS woj, COUNT(*) AS n FROM advisors WHERE aktywny = 1 GROUP BY wojewodztwo",
  ).all<{ woj: string; n: number }>();
  const out: Record<string, number> = {};
  for (const row of results ?? []) out[row.woj] = row.n;
  return out;
}

/** Strona publicznej listy dla wybranego województwa (filtr + sort + paginacja). Tylko aktywni. */
export async function listPublicAdvisors(p: PublicPageParams): Promise<PublicPage> {
  const DB = await db();

  const where: string[] = ["wojewodztwo = ?", "aktywny = 1"];
  const binds: unknown[] = [p.woj];
  if (p.q.trim()) {
    const like = "%" + escapeLike(p.q.trim()) + "%";
    where.push("(nazwa LIKE ? ESCAPE '\\' OR miejscowosc LIKE ? ESCAPE '\\')");
    binds.push(like, like);
  }
  const whereSql = where.join(" AND ");

  const totalRow = await DB.prepare(`SELECT COUNT(*) AS n FROM advisors WHERE ${whereSql}`).bind(...binds).first<{ n: number }>();
  const total = totalRow?.n ?? 0;

  const order = p.sort === "miejscowosc"
    ? "miejscowosc COLLATE NOCASE, nazwa COLLATE NOCASE, id"
    : "nazwa COLLATE NOCASE, id";

  const sql = `SELECT * FROM advisors WHERE ${whereSql} ORDER BY ${order} LIMIT ? OFFSET ?`;
  const { results } = await DB.prepare(sql).bind(...binds, p.limit, p.offset).all<Row>();
  return { items: (results ?? []).map(rowToAdvisor), total };
}

// ----- Admin CRUD (includes inactive advisors) -----

export async function getAdvisorById(id: string): Promise<Advisor | null> {
  const DB = await db();
  const row = await DB.prepare("SELECT * FROM advisors WHERE id = ?").bind(id).first<Row>();
  return row ? rowToAdvisor(row) : null;
}

export async function adminListAdvisors(): Promise<Advisor[]> {
  const DB = await db();
  const { results } = await DB.prepare(
    "SELECT * FROM advisors ORDER BY wojewodztwo, nazwa COLLATE NOCASE, id",
  ).all<Row>();
  return (results ?? []).map(rowToAdvisor);
}

export async function createAdvisor(draft: Omit<Advisor, "id">): Promise<Advisor> {
  const DB = await db();
  const advisor: Advisor = { ...draft, id: "adv" + crypto.randomUUID() };
  await insertStmt(DB, advisor).run();
  return advisor;
}

export async function updateAdvisor(a: Advisor): Promise<void> {
  const DB = await db();
  await DB.prepare(
    `UPDATE advisors SET
       nazwa = ?, poziom = ?, wojewodztwo = ?, miejscowosc = ?,
       email = ?, www = ?, telefon = ?, oferta = ?, aktywny = ?
     WHERE id = ?`,
  ).bind(
    a.nazwa, a.poziom, a.wojewodztwo, a.miejscowosc,
    a.email, a.www, a.telefon, a.oferta, a.aktywny ? 1 : 0,
    a.id,
  ).run();
}

export async function removeAdvisor(id: string): Promise<void> {
  const DB = await db();
  await DB.prepare("DELETE FROM advisors WHERE id = ?").bind(id).run();
}
