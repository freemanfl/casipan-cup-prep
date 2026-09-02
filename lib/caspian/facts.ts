import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { CaspianFact } from "./types";

export type { CaspianFact };

type RawQuestion = {
  card?: string[];
  primary_themes?: string[];
  knowledge_tags?: string[];
  comment?: string;
  question?: string;
  answer?: string;
  sources?: string;
};

const DATA_FILE = path.join(
  process.cwd(),
  "scouting-caspian-cup-2026/dataset/вопросы-основа.jsonl",
);

let cached: CaspianFact[] | null = null;
let cachedMtime = 0;

export function factKey(name: string): string {
  return name
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/[«»„“”"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanFactText(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[–—−]/g, "—")
    .replace(/\s+—\s+/g, " — ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

export function splitCard(card: string): CaspianFact | null {
  const text = cleanFactText(card);
  if (!text) return null;
  const dash = text.includes(" — ")
    ? " — "
    : text.includes(" - ")
      ? " - "
      : null;
  if (!dash) return null;
  const i = text.indexOf(dash);
  const name = text.slice(0, i).trim().replace(/^[«"„]+|[»"]+$/g, "");
  const gloss = text.slice(i + dash.length).trim().replace(/[.;]+$/, "");
  if (!name || !gloss) return null;
  return { name, gloss };
}

export function readQuestionRows(): { mtime: number; rows: RawQuestion[] } {
  const mtime = statSync(DATA_FILE).mtimeMs;
  const text = readFileSync(DATA_FILE, "utf8");
  const rows: RawQuestion[] = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    rows.push(JSON.parse(line) as RawQuestion);
  }
  return { mtime, rows };
}

export function collectFacts(rows: RawQuestion[]): CaspianFact[] {
  const byKey = new Map<string, CaspianFact>();
  for (const raw of rows) {
    for (const card of raw.card ?? []) {
      const fact = splitCard(card);
      if (!fact) continue;
      const key = factKey(fact.name);
      const prev = byKey.get(key);
      if (!prev || fact.gloss.length > prev.gloss.length) {
        byKey.set(key, fact);
      }
    }
  }

  return [...byKey.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "ru", { sensitivity: "base" }),
  );
}

export function loadCaspianFacts(): CaspianFact[] {
  const { mtime, rows } = readQuestionRows();
  if (cached && cachedMtime === mtime) return cached;
  cachedMtime = mtime;
  cached = collectFacts(rows);
  return cached;
}
