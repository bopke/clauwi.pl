import "server-only";

// D1 access for advisors — the single source of truth for the public
// directory and the admin panel.

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Advisor } from "./advisors";

export type PublicSort = "name" | "locality";
export type PublicPageParams = { region: string; q: string; sort: PublicSort; offset: number; limit: number };
export type PublicPage = { items: Advisor[]; total: number };

const COLUMNS = [
  "id", "name", "level", "region", "locality",
  "email", "website", "phone", "services", "certification_valid_until", "notes", "active",
] as const;

async function db(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}

type Row = Record<string, unknown>;

function rowToAdvisor(r: Row): Advisor {
  return {
    id: String(r.id),
    name: (r.name as string) ?? "",
    level: (r.level as string) ?? "",
    region: (r.region as string) ?? "",
    locality: (r.locality as string) ?? "",
    email: (r.email as string) ?? "",
    website: (r.website as string) ?? "",
    phone: (r.phone as string) ?? "",
    services: (r.services as string) ?? "",
    certificationValidUntil: (r.certification_valid_until as string) ?? "",
    notes: (r.notes as string) ?? "",
    active: !!r.active,
  };
}

function insertStmt(DB: D1Database, a: Advisor) {
  const placeholders = COLUMNS.map(() => "?").join(", ");
  return DB.prepare(`INSERT OR IGNORE INTO advisors (${COLUMNS.join(", ")}) VALUES (${placeholders})`).bind(
    a.id, a.name, a.level, a.region, a.locality,
    a.email, a.website, a.phone, a.services, a.certificationValidUntil, a.notes, a.active ? 1 : 0,
  );
}

function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => "\\" + c);
}

// ----- Public reads -----

/** Active advisors per region (keys = region slug, including "zagranica"). */
export async function getRegionCounts(): Promise<Record<string, number>> {
  const DB = await db();
  const { results } = await DB.prepare(
    "SELECT region, COUNT(*) AS n FROM advisors WHERE active = 1 GROUP BY region",
  ).all<{ region: string; n: number }>();
  const out: Record<string, number> = {};
  for (const row of results ?? []) out[row.region] = row.n;
  return out;
}

/** One page of the public list for a region (filter + sort + pagination). Active advisors only. */
export async function listPublicAdvisors(p: PublicPageParams): Promise<PublicPage> {
  const DB = await db();

  const where: string[] = ["region = ?", "active = 1"];
  const binds: unknown[] = [p.region];
  if (p.q.trim()) {
    const like = "%" + escapeLike(p.q.trim()) + "%";
    where.push("(name LIKE ? ESCAPE '\\' OR locality LIKE ? ESCAPE '\\')");
    binds.push(like, like);
  }
  const whereSql = where.join(" AND ");

  const totalRow = await DB.prepare(`SELECT COUNT(*) AS n FROM advisors WHERE ${whereSql}`).bind(...binds).first<{ n: number }>();
  const total = totalRow?.n ?? 0;

  // Priority ordering (applies regardless of name/locality sort): Izabela
  // Banach always first if she's in the list, then by certification tier
  // (Certyfikat > Kurs zaawansowany > Kurs podstawowy > anything else, e.g.
  // a country name for advisors abroad) — the client asked for seniority
  // first, not plain alphabetical. The level values themselves stay Polish:
  // they are real data entered by the client, not identifiers.
  const PRIORITY = `
    CASE WHEN name = 'Izabela Banach' THEN 0 ELSE 1 END,
    CASE
      WHEN level LIKE 'Certyfikat%' THEN 0
      WHEN level LIKE 'Kurs zaawansowany%' THEN 1
      WHEN level LIKE 'Kurs podstawowy%' THEN 2
      ELSE 3
    END
  `;
  const order = p.sort === "locality"
    ? `${PRIORITY}, locality COLLATE NOCASE, name COLLATE NOCASE, id`
    : `${PRIORITY}, name COLLATE NOCASE, id`;

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
    "SELECT * FROM advisors ORDER BY region, name COLLATE NOCASE, id",
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
       name = ?, level = ?, region = ?, locality = ?,
       email = ?, website = ?, phone = ?, services = ?, certification_valid_until = ?, notes = ?, active = ?
     WHERE id = ?`,
  ).bind(
    a.name, a.level, a.region, a.locality,
    a.email, a.website, a.phone, a.services, a.certificationValidUntil, a.notes, a.active ? 1 : 0,
    a.id,
  ).run();
}

export async function removeAdvisor(id: string): Promise<void> {
  const DB = await db();
  await DB.prepare("DELETE FROM advisors WHERE id = ?").bind(id).run();
}
