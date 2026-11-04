// CSV export of the newsletter list (admin "Newsletter" tab → "Eksport CSV"):
// every entry matching the filters, as the list shows them. POST, so the
// filters (possibly hundreds of course ids) travel in the body, not the URL.
//
// Semicolons and a BOM, so Excel set to Polish opens it straight away with
// the accents intact.

import { auth } from "@/auth";
import { adminExportNewsletter } from "@/lib/clauwi/newsletter-repo";
import type { NewsletterFilters } from "@/lib/clauwi/newsletter";

const SOURCE_LABELS: Record<string, string> = {
  widget: "Widżet newslettera",
  import: "Import",
  course: "Zapis na kurs",
  admin: "Przywrócone w panelu",
};

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  // Quote everything that needs it; a leading = + - @ would be read as a formula.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[";\n\r]/.test(safe) || safe !== s ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("unauthorized", { status: 401 });

  let f: NewsletterFilters;
  try {
    const body = (await req.json()) as Partial<NewsletterFilters>;
    f = {
      q: String(body.q ?? ""),
      source: body.source === "widget" || body.source === "import" || body.source === "course" ? body.source : "",
      courseType: String(body.courseType ?? ""),
      courseIds: Array.isArray(body.courseIds) ? body.courseIds.map(String) : [],
    };
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const rows = await adminExportNewsletter(f);
  const lines = [
    ["E-mail", "Imię", "Nazwisko", "Źródło", "Import / kurs", "Rodzaj kursu", "Data kursu", "Data zgody (UTC)"],
    ...rows.map((r) => [
      r.email,
      r.first_name,
      r.last_name,
      SOURCE_LABELS[String(r.source)] ?? r.source,
      r.source === "course" ? r.course_name : r.import_label,
      r.course_type,
      r.course_starts_at ? String(r.course_starts_at).slice(0, 10) : "",
      r.created_at,
    ]),
  ];
  const csv = "﻿" + lines.map((l) => l.map(cell).join(";")).join("\r\n") + "\r\n";
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="newsletter-clauwi-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
