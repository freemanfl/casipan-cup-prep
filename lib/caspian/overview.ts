import type {
  OverviewFact,
  OverviewPayload,
  OverviewPeriod,
  OverviewTheme,
} from "./types";
import { SHARED_TOPICS } from "./shared-topics";
import { ERA_COPY, eraForStart } from "./era-copy";
import { QUESTION_TYPES } from "./question-types";
import { estimateFactYear, periodStart } from "./date-fact";
import { collectFacts, factKey, readQuestionRows, splitCard } from "./facts";

const THEME_ORDER = [
  "литература",
  "история",
  "кино",
  "искусство",
  "музыка",
  "еда",
  "спорт",
  "наука",
  "биология",
  "лингвистика",
  "мифология",
  "география",
  "архитектура",
  "театр",
  "технологии",
  "политика",
  "другое",
];

let cached: OverviewPayload | null = null;
let cachedMtime = 0;

function themeCount(rows: { primary_themes?: string[] }[]): OverviewTheme[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const row of rows) {
    const themes = row.primary_themes ?? [];
    const unique = themes.length ? themes : ["другое"];
    for (const theme of unique) {
      counts.set(theme, (counts.get(theme) ?? 0) + 1);
      total += 1;
    }
  }
  const list = [...counts.entries()].map(([name, count]) => ({
    name,
    count,
    share: total ? count / total : 0,
  }));
  list.sort((a, b) => {
    const ai = THEME_ORDER.indexOf(a.name);
    const bi = THEME_ORDER.indexOf(b.name);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    }
    return b.count - a.count;
  });
  return list;
}

export function loadOverview(): OverviewPayload {
  const { mtime, rows } = readQuestionRows();
  if (cached && cachedMtime === mtime) return cached;

  const blobs = new Map<string, string>();
  for (const row of rows) {
    const blob = [
      row.comment ?? "",
      row.question ?? "",
      row.answer ?? "",
      row.sources ?? "",
    ].join(" ");
    for (const card of row.card ?? []) {
      const fact = splitCard(card);
      if (!fact) continue;
      const key = factKey(fact.name);
      blobs.set(key, `${blobs.get(key) ?? ""} ${blob}`);
    }
  }

  const facts = collectFacts(rows);
  const byStart = new Map<number, OverviewFact[]>();
  let datedCount = 0;
  for (const fact of facts) {
    const year = estimateFactYear(
      fact.name,
      fact.gloss,
      blobs.get(factKey(fact.name)) ?? "",
    );
    if (year === null) continue;
    datedCount += 1;
    const start = periodStart(year);
    const list = byStart.get(start) ?? [];
    list.push({ ...fact, year });
    byStart.set(start, list);
  }

  const starts = new Set<number>([0, ...ERA_COPY.map((era) => era.start)]);
  for (const start of byStart.keys()) starts.add(start);

  const periods: OverviewPeriod[] = [...starts]
    .sort((a, b) => a - b)
    .map((start) => {
      const factsInEra = (byStart.get(start) ?? []).sort((a, b) => a.year - b.year);
      const copy = eraForStart(start);
      return {
        ...copy,
        count: factsInEra.length,
        facts: factsInEra,
      };
    })
    .filter((period) => period.start === 0 || period.start >= 1000);

  cachedMtime = mtime;
  cached = {
    factCount: facts.length,
    datedCount,
    periods,
    themes: themeCount(rows),
    tags: SHARED_TOPICS.filter((topic) => topic.times >= 3)
      .slice()
      .sort((a, b) => b.times - a.times || a.name.localeCompare(b.name, "ru"))
      .slice(0, 48)
      .map(({ name, times }) => ({ name, times })),
    types: QUESTION_TYPES,
  };
  return cached;
}
