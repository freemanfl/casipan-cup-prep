import { readFileSync } from "node:fs";
import path from "node:path";
import { EDITORS, type EditorKey } from "./editors";
import type { CaspianQuestion, TourGroup } from "./types";

export type { CaspianQuestion, EditorKey, TourGroup };
export { EDITORS };

type RawQuestion = {
  question_id?: string;
  editor?: string;
  tour_id?: string;
  tour_title?: string;
  question?: string;
  answer?: string;
  pass_criteria?: string;
  comment?: string;
  sources?: string;
  has_handout?: boolean;
};

const DATA_FILE = path.join(
  process.cwd(),
  "scouting-caspian-cup-2026/dataset/вопросы-основа.jsonl",
);

const TOUR_CACHE = path.join(
  process.cwd(),
  "scouting-caspian-cup-2026/cache/tours",
);

const EDITOR_BY_NAME = new Map<string, (typeof EDITORS)[number]>(
  EDITORS.map((editor) => [editor.name, editor]),
);

const tourDateCache = new Map<string, string>();
let cachedTours: TourGroup[] | null = null;

function editorKeyFor(name: string): (typeof EDITORS)[number] {
  const known = EDITOR_BY_NAME.get(name);
  if (known) return known;
  const lower = name.toLowerCase();
  const found = EDITORS.find(
    (editor) =>
      lower.includes(editor.short.toLowerCase()) || name.includes(editor.name),
  );
  return found ?? EDITORS[0];
}

function questionNumber(id: string): string {
  const dash = id.lastIndexOf("-");
  return dash >= 0 ? id.slice(dash + 1) : id;
}

function toIso(raw: string): string | null {
  const iso = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = raw.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return null;
}

function yearFromTourId(tourId: string): string | null {
  const full = tourId.match(/(?:19|20)\d{2}/);
  if (full) return full[0];
  const short = tourId.match(/(?:^|[^\d])(\d{2})(?:[._-]|$)/);
  if (!short) return null;
  const year = Number(short[1]);
  if (Number.isNaN(year)) return null;
  return String(year >= 90 ? 1900 + year : 2000 + year);
}

function tourDate(tourId: string): string {
  const cached = tourDateCache.get(tourId);
  if (cached) return cached;
  try {
    const html = readFileSync(path.join(TOUR_CACHE, `${tourId}.html`), "utf8");
    const match = html.match(/Дата:<\/strong>\s*([^<\n]+)/);
    const iso = match ? toIso(match[1]) : null;
    if (iso) {
      tourDateCache.set(tourId, iso);
      return iso;
    }
  } catch {
    /* no cached page */
  }
  const year = yearFromTourId(tourId);
  const fallback = year ? `${year}-01-01` : "1970-01-01";
  tourDateCache.set(tourId, fallback);
  return fallback;
}

export function loadCaspianQuestions(): TourGroup[] {
  if (cachedTours) return cachedTours;

  const text = readFileSync(DATA_FILE, "utf8");
  const tours = new Map<string, CaspianQuestion[]>();

  for (const line of text.split("\n")) {
    if (!line) continue;
    const raw = JSON.parse(line) as RawQuestion;
    const id = raw.question_id ?? "";
    if (!id) continue;
    const meta = editorKeyFor(raw.editor ?? "");
    const tourId = raw.tour_id ?? "";
    const question: CaspianQuestion = {
      question_id: id,
      editor: raw.editor ?? meta.name,
      editorKey: meta.key,
      tour_id: tourId,
      tour_title: raw.tour_title ?? tourId,
      number: questionNumber(id),
      question: raw.question ?? "",
      answer: raw.answer ?? "",
      pass_criteria: raw.pass_criteria ?? "",
      comment: raw.comment ?? "",
      sources: raw.sources ?? "",
      has_handout: Boolean(raw.has_handout),
    };
    const existing = tours.get(tourId);
    if (existing) existing.push(question);
    else tours.set(tourId, [question]);
  }

  cachedTours = [...tours.entries()]
    .map(([tour_id, questions]) => ({
      tour_id,
      tour_title: questions[0]?.tour_title ?? tour_id,
      editor: questions[0]?.editor ?? "",
      date: tourDate(tour_id),
      questions,
    }))
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return a.tour_id.localeCompare(b.tour_id);
    });

  return cachedTours;
}
