"use client";

// "Importuj…" on the newsletter tab: brings an existing list (the old
// newsletter system's export) onto the list. The file is read and checked in
// the browser — columns guessed from the header, adjustable — then sent in
// chunks; the server checks every row again, skips anyone who unsubscribed
// and leaves addresses already on the list alone.

import { useEffect, useMemo, useState } from "react";
import { IMPORT_CHUNK, type ImportRow, type NewsletterImport } from "@/lib/clauwi/newsletter";
import { createImportAction, getImportsAction, importChunkAction, undoImportAction } from "@/app/admin/actions";
import { formatUtc } from "./MailingView";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Exports from older Polish tools are often Windows-1250 rather than UTF-8. */
function decode(buf: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^﻿/, "");
  } catch {
    return new TextDecoder("windows-1250").decode(buf);
  }
}

/** Minimal CSV: quoted fields, "" escapes, the delimiter guessed from the first line. */
function parseCsv(text: string): string[][] {
  const first = text.split(/\r?\n/, 1)[0] ?? "";
  const delim = [";", ",", "\t"].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === delim) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

/** Common date formats → "YYYY-MM-DD HH:MM:SS", or "" when it isn't one. */
function normalizeDate(v: string): string {
  const s = v.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) return `${m[1]}-${m[2]}-${m[3]} ${(m[4] ?? "00").padStart(2, "0")}:${m[5] ?? "00"}:${m[6] ?? "00"}`;
  m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")} ${(m[4] ?? "00").padStart(2, "0")}:${m[5] ?? "00"}:${m[6] ?? "00"}`;
  return "";
}

type Columns = { email: number; first: number; last: number; full: number; date: number };

/** Guesses which column is which from the header (or, without one, the values). */
function guessColumns(header: string[] | null, rows: string[][]): Columns {
  const width = Math.max(...rows.slice(0, 50).map((r) => r.length), header?.length ?? 0);
  const h = (header ?? []).map((x) => x.trim().toLowerCase());
  const find = (re: RegExp, except: number[] = []) => h.findIndex((x, i) => re.test(x) && !except.includes(i));
  let email = find(/mail/);
  if (email < 0) {
    let best = -1, bestN = 0;
    for (let c = 0; c < width; c++) {
      const n = rows.slice(0, 50).filter((r) => EMAIL_RE.test((r[c] ?? "").trim())).length;
      if (n > bestN) { best = c; bestN = n; }
    }
    email = best;
  }
  const first = find(/^(imi[eę]|first|first[ _]?name|given)/, [email]);
  const last = find(/^(nazwisko|last|last[ _]?name|surname|family)/, [email]);
  const full = first < 0 && last < 0 ? find(/imi[eę] i nazwisko|^name$|^nazwa|full ?name|^osoba/, [email]) : -1;
  const date = find(/data|date|created|zapis|subscri|opt.?in|time|kiedy/, [email]);
  return { email, first, last, full, date };
}

type Parsed = { fileName: string; header: string[] | null; rows: string[][] };

export function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [imports, setImports] = useState<NewsletterImport[] | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [cols, setCols] = useState<Columns | null>(null);
  const [label, setLabel] = useState("");
  const [basis, setBasis] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ added: number; existing: number; suppressed: number } | null>(null);
  const [error, setError] = useState("");
  const [undoArmed, setUndoArmed] = useState<string | null>(null);

  useEffect(() => {
    getImportsAction().then(setImports, () => {});
  }, []);

  async function onFile(file: File | undefined) {
    setResult(null);
    setError("");
    if (!file) return;
    const rows = parseCsv(decode(await file.arrayBuffer()));
    if (rows.length === 0) {
      setParsed(null);
      setError("Plik jest pusty albo to nie jest plik CSV.");
      return;
    }
    // A first row without any address in it is a header.
    const header = rows[0].some((c) => EMAIL_RE.test(c.trim())) ? null : rows[0];
    const body = header ? rows.slice(1) : rows;
    setParsed({ fileName: file.name, header, rows: body });
    setCols(guessColumns(header, body));
    if (!label) setLabel(file.name.replace(/\.[^.]+$/, ""));
  }

  // Rows as they will be imported, plus what's wrong with the rest.
  const prepared = useMemo(() => {
    if (!parsed || !cols || cols.email < 0) return null;
    const seen = new Set<string>();
    const rows: ImportRow[] = [];
    const invalid: string[] = [];
    let duplicates = 0;
    for (const r of parsed.rows) {
      const email = (r[cols.email] ?? "").trim();
      if (!EMAIL_RE.test(email)) { invalid.push(email || "(pusty)"); continue; }
      const key = email.toLowerCase();
      if (seen.has(key)) { duplicates++; continue; }
      seen.add(key);
      let firstName = cols.first >= 0 ? (r[cols.first] ?? "").trim() : "";
      let lastName = cols.last >= 0 ? (r[cols.last] ?? "").trim() : "";
      if (cols.full >= 0) {
        const [f, ...rest] = (r[cols.full] ?? "").trim().split(/\s+/);
        firstName = f ?? "";
        lastName = rest.join(" ");
      }
      rows.push({ email, firstName, lastName, consentAt: cols.date >= 0 ? normalizeDate(r[cols.date] ?? "") : "" });
    }
    const undated = cols.date >= 0 ? rows.filter((r) => !r.consentAt).length : rows.length;
    return { rows, invalid, duplicates, undated };
  }, [parsed, cols]);

  async function runImport() {
    if (!prepared || !parsed) return;
    setError("");
    setProgress({ done: 0, total: prepared.rows.length });
    const sum = { added: 0, existing: 0, suppressed: 0 };
    try {
      const id = await createImportAction(label, parsed.fileName, basis);
      for (let i = 0; i < prepared.rows.length; i += IMPORT_CHUNK) {
        const res = await importChunkAction(id, prepared.rows.slice(i, i + IMPORT_CHUNK));
        sum.added += res.added;
        sum.existing += res.existing;
        sum.suppressed += res.suppressed;
        setProgress({ done: Math.min(i + IMPORT_CHUNK, prepared.rows.length), total: prepared.rows.length });
      }
      setResult(sum);
      setParsed(null);
      setConfirmed(false);
      onImported();
    } catch {
      setError(`Import przerwany po ${sum.added + sum.existing + sum.suppressed} adresach. To, co weszło, zostało zapisane — możesz cofnąć ten import poniżej i spróbować ponownie.`);
    } finally {
      setProgress(null);
      getImportsAction().then(setImports, () => {});
    }
  }

  async function undo(id: string) {
    if (undoArmed !== id) return setUndoArmed(id);
    setUndoArmed(null);
    try {
      setImports(await undoImportAction(id));
      onImported();
    } catch {
      setError("Nie udało się cofnąć importu.");
    }
  }

  const colOptions = parsed
    ? Array.from({ length: Math.max(...parsed.rows.slice(0, 50).map((r) => r.length), parsed.header?.length ?? 0) }, (_, i) => ({
        i,
        name: parsed.header?.[i]?.trim() || `Kolumna ${i + 1}`,
        sample: parsed.rows[0]?.[i]?.trim() ?? "",
      }))
    : [];
  const colSelect = (key: keyof Columns, label: string, optional = true) => (
    <label className="adm-f">
      <span>{label}</span>
      <select value={cols?.[key] ?? -1} onChange={(e) => setCols((c) => (c ? { ...c, [key]: Number(e.target.value) } : c))}>
        {optional && <option value={-1}>— brak —</option>}
        {colOptions.map((o) => (
          <option key={o.i} value={o.i}>{o.name}{o.sample ? ` (np. ${o.sample.slice(0, 30)})` : ""}</option>
        ))}
      </select>
    </label>
  );
  const canImport = !!prepared && prepared.rows.length > 0 && label.trim() !== "" && basis.trim() !== "" && confirmed && !progress;

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget && !progress) onClose(); }}>
      <div className="adm-sheet adm-import">
        <div className="adm-sheet__head">
          <h2>Import adresów</h2>
          <button type="button" className="adm-x" onClick={onClose} disabled={!!progress} aria-label="Zamknij">×</button>
        </div>
        <div className="adm-sheet__body">
          <p className="adm-compose__hint">
            Plik CSV (np. eksport ze starego systemu newslettera) z kolumną adresów e-mail; opcjonalnie imię, nazwisko i data zapisu. Adresy, które
            już są na liście, zostają bez zmian. Osoby, które się wypisały, są pomijane — import nigdy ich nie przywróci.
          </p>

          <label className="adm-f">
            <span>Plik</span>
            <input type="file" accept=".csv,.txt,text/csv" onChange={(e) => onFile(e.target.files?.[0])} disabled={!!progress} />
          </label>

          {parsed && cols && (
            <>
              <div className="adm-grid2">
                {colSelect("email", "Kolumna z adresem e-mail", false)}
                {colSelect("date", "Data zapisu (zgody)")}
                {colSelect("first", "Imię")}
                {colSelect("last", "Nazwisko")}
                {colSelect("full", "Imię i nazwisko w jednej kolumnie")}
              </div>
              {prepared && (
                <div className="adm-import__stats">
                  <b>{prepared.rows.length}</b> {prepared.rows.length === 1 ? "adres" : "adresów"} do importu
                  {prepared.duplicates > 0 && <> · {prepared.duplicates} powtórzeń w pliku (pominięte)</>}
                  {prepared.invalid.length > 0 && (
                    <> · {prepared.invalid.length} niepoprawnych (pominięte, np. {prepared.invalid.slice(0, 3).join(", ")})</>
                  )}
                  {prepared.undated > 0 && <> · {prepared.undated} bez daty zapisu (dostaną dzisiejszą)</>}
                </div>
              )}
              {prepared && prepared.rows.length > 0 && (
                <div className="adm-tablewrap">
                  <table className="adm-table">
                    <thead><tr><th>E-mail</th><th>Imię</th><th>Nazwisko</th><th>Data zapisu</th></tr></thead>
                    <tbody>
                      {prepared.rows.slice(0, 5).map((r) => (
                        <tr key={r.email}><td>{r.email}</td><td>{r.firstName}</td><td>{r.lastName}</td><td className="adm-td-addr">{r.consentAt}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <label className="adm-f">
                <span>Nazwa importu <small>(widoczna przy adresach na liście)</small></span>
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="np. Stary newsletter — eksport 2026" />
              </label>
              <label className="adm-f">
                <span>Jak te osoby zgodziły się na newsletter? <small>(zapisywane w historii zgód każdej osoby)</small></span>
                <textarea
                  rows={3}
                  value={basis}
                  onChange={(e) => setBasis(e.target.value)}
                  placeholder="np. Zapis przez formularz newslettera na poprzedniej stronie clauwi.pl, z zaznaczoną zgodą na otrzymywanie informacji o kursach."
                />
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                <span>Potwierdzam, że wszystkie osoby z tego pliku same zapisały się na informacje od ClauWi® i nie wypisały się.</span>
              </label>
            </>
          )}

          {progress && <p className="adm-compose__hint">Importowanie… {progress.done} / {progress.total} — nie zamykaj okna.</p>}
          {result && (
            <p className="adm-compose__ok">
              Zaimportowano: {result.added} nowych · {result.existing} już było na liście · {result.suppressed} pominiętych (wypisani).
            </p>
          )}
          {error && <p className="adm-compose__warn">{error}</p>}

          {imports && imports.length > 0 && (
            <>
              <h3 className="adm-import__h">Poprzednie importy</h3>
              <ul className="adm-templates__list">
                {imports.map((imp) => (
                  <li key={imp.id}>
                    <div>
                      <b>{imp.label}</b>
                      <span>
                        {formatUtc(imp.createdAt)} · {imp.added} dodanych, {imp.existing} już było, {imp.suppressed} pominiętych
                        {imp.undoneAt && <> · cofnięty {formatUtc(imp.undoneAt)}</>}
                      </span>
                    </div>
                    {!imp.undoneAt && (
                      <button type="button" className="adm-btn adm-btn--ghost adm-btn--dangertext" onClick={() => undo(imp.id)}>
                        {undoArmed === imp.id ? `Usunąć ${imp.added} adresów?` : "Cofnij import"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="adm-sheet__foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={!!progress}>Zamknij</button>
          {parsed && (
            <button type="button" className="adm-btn adm-btn--solid" disabled={!canImport} onClick={runImport}>
              Importuj {prepared?.rows.length ?? 0} adresów
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
