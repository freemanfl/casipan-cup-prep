import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { CaspianFact } from "./types";

export type { CaspianFact };

type RawQuestion = {
  card?: string[];
};

const DATA_FILE = path.join(
  process.cwd(),
  "scouting-caspian-cup-2026/dataset/вопросы-основа.jsonl",
);

let cached: CaspianFact[] | null = null;
let cachedMtime = 0;

function splitCard(card: string): { name: string; gloss: string } | null {
  const text = card.trim();
  if (!text) return null;
  const dash = text.includes(" — ") ? " — " : text.includes(" - ") ? " - " : null;
  if (!dash) return null;
  const i = text.indexOf(dash);
  const name = text.slice(0, i).trim().replace(/^[«"]|[»"]$/g, "");
  const gloss = text.slice(i + dash.length).trim();
  if (!name || !gloss) return null;
  return { name, gloss };
}

export function loadCaspianFacts(): CaspianFact[] {
  const mtime = statSync(DATA_FILE).mtimeMs;
  if (cached && cachedMtime === mtime) return cached;

  const text = readFileSync(DATA_FILE, "utf8");
  const byKey = new Map<string, CaspianFact>();

  for (const line of text.split("\n")) {
    if (!line) continue;
    const raw = JSON.parse(line) as RawQuestion;
    for (const card of raw.card ?? []) {
      const fact = splitCard(card);
      if (!fact) continue;
      const key = fact.name.toLocaleLowerCase("ru").replace(/ё/g, "е");
      const prev = byKey.get(key);
      if (!prev || fact.gloss.length > prev.gloss.length) {
        byKey.set(key, fact);
      }
    }
  }

  cachedMtime = mtime;
  cached = [...byKey.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "ru", { sensitivity: "base" }),
  );
  return cached;
}
