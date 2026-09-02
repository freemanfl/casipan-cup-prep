/** Year of the thing itself: when it was made, written, discovered — not the era it depicts. */

const NAME_YEARS: Array<[string, number]> = [
  ["алеф борхеса", 1945],
  ["заир у борхеса", 1949],
  ["борхес", 1945],
  ["шерлок холмс", 1892],
  ["гамлет", 1601],
  ["пушкин", 1833],
  ["лермонтов", 1840],
  ["набоков", 1955],
  ["дар набокова", 1938],
  ["мартин лютер", 1517],
  ["архимед", -250],
  ["ной", -800],
  ["моби дик", 1851],
  ["фрейд", 1900],
  ["фаренгейт", 1953],
  ["харон", -700],
  ["крик мунка", 1893],
  ["титаник", 1912],
  ["шалтай-болтай", 1871],
  ["пизанская башня", 1372],
  ["дали", 1931],
  ["кэрролл", 1865],
  ["бэнкси", 2003],
  ["рекс стаут", 1934],
  ["бэкон", 1620],
  ["анна радклиф", 1794],
  ["хлебников", 1922],
  ["демон лапласа", 1814],
  ["гретна-грин", 1754],
  ["магритт", 1964],
  ["сын человеческий", 1964],
  ["кейдж", 1952],
  ["4′33", 1952],
  ["томас бекет", 1170],
  ["том бекет", 1170],
  ["девственницы-самоубийцы", 1999],
  ["бафомет", 1856],
  ["синдром туретта", 1885],
  ["теломеры", 1978],
  ["синкансэн", 1964],
  ["манул", 1776],
  ["наксос", -500],
  ["выше стропила", 1949],
  ["дон кихот", 1605],
  ["донкихот", 1605],
  ["гомер", -750],
  ["илиада", -750],
  ["одиссея", -750],
  ["данте", 1320],
  ["шекспир", 1600],
  ["рембрандт", 1642],
  ["бах", 1721],
  ["моцарт", 1787],
  ["бетховен", 1808],
  ["гойя", 1814],
  ["толстой", 1869],
  ["достоевский", 1866],
  ["чехов", 1900],
  ["горький", 1902],
  ["блокада", 1942],
  ["эйнштейн", 1905],
  ["дарвин", 1859],
  ["ньютон", 1687],
  ["галилей", 1610],
  ["коперник", 1543],
  ["колумб", 1492],
  ["наполеон", 1812],
  ["петр первый", 1703],
  ["пётр первый", 1703],
  ["екатерина вторая", 1762],
  ["екатерина ii", 1762],
  ["ленин", 1917],
  ["сталин", 1937],
  ["гитлер", 1939],
  ["черчилль", 1940],
  ["мандела", 1994],
  ["beatles", 1964],
  ["битлз", 1964],
  ["стар трек", 1966],
  ["стар варс", 1977],
  ["звездные войны", 1977],
  ["хан соло", 1977],
  ["гарри поттер", 1997],
  ["властелин колец", 1954],
  ["толкин", 1954],
  ["оруэлл", 1949],
  ["хэмингуэй", 1926],
  ["джойс", 1922],
  ["кафка", 1915],
  ["ван гог", 1889],
  ["моне", 1872],
  ["пикассо", 1907],
  ["варшава", 1943],
  ["чернобыль", 1986],
  ["берлинская стена", 1961],
  ["мел бланк", 1940],
  ["багз банни", 1940],
  ["баггз банни", 1940],
  ["родео", 1890],
  ["имя розы", 1980],
  ["голодные игры", 2008],
  ["черная стрела", 1888],
  ["любовь живет три года", 1997],
  ["t-1000", 1991],
];

const ROMAN: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
  XIII: 13,
  XIV: 14,
  XV: 15,
  XVI: 16,
  XVII: 17,
  XVIII: 18,
  XIX: 19,
  XX: 20,
  XXI: 21,
};

const URL_RE = /https?:\/\/\S+|www\.\S+/gi;
const YEAR_RE = /(?<![\p{L}\d-])(1[0-9]{3}|20[0-2]\d)(?!\d)/gu;
const ROMAN_CENT_RE =
  /\b(XXI|XX|XIX|XVIII|XVII|XVI|XV|XIV|XIII|XII|XI|X|IX|VIII|VII|VI|IV|V|III|II|I)\s*век/gi;
const RU_CENT_RE = /(\d{1,2})(?:-м|-ом|-е|-й)?\s+век/gi;
const NOT_A_YEAR =
  /^(?:километр|км\b|метр|миль|страниц|человек|раз\b|узл|фут\b|фунт|пиксель)/i;
const BCE_AFTER = /^(?:г(?:ода?|\.)?\s*)?до\s*н/i;
const BIBLIO_AFTER = /^(?:год\s*\(|\.\s*—\s*С\.)/;
const CULTURAL_WORK =
  /роман\b|повесть|рассказ|\bпьеса\b|кинофильм|\bфильм\b|сериал|экранизац|название отсылает|туристическ/i;

const ERA_HINTS: Array<[RegExp, number]> = [
  [/до н\.?\s*э|до нашей эры/i, -400],
  [/античн|древн(?:ий|яя|ей) грец|римск(?:ая|ой) импери/i, -200],
  [/средневеков/i, 1100],
  [/ренессанс|возрожден/i, 1500],
  [/барокко/i, 1650],
  [/просвещен/i, 1750],
  [/романтизм/i, 1820],
  [/импрессион/i, 1875],
  [/викториан/i, 1870],
  [/перв(?:ой|ая) мирово/i, 1916],
  [/втор(?:ой|ая) мирово|великой отечественной/i, 1942],
  [/советск/i, 1960],
];

const MODERN_THING =
  /акт[её]р|озвуч|мультфильм|кинофильм|\bфильм\b|сериал|персонаж|супергерой|баскетбол|хокке|футбол(?:ист)?|айфон|интернет|компьютер|рок-н-ролл|тв\b|телев|youtube|комикс/i;

function stripNoise(text: string): string {
  return text
    .replace(URL_RE, " ")
    .replace(/\/(?:node|id|item|topic|issues?)\/\d+/gi, " ")
    .replace(/\b(?:node|id|t|time_continue|start|page)=\d+\b/gi, " ")
    .replace(/\b\d{3,4}x\d{3,4}\b/g, " ");
}

function numericYears(raw: string): number[] {
  const text = stripNoise(raw);
  const years: number[] = [];
  for (const match of text.matchAll(YEAR_RE)) {
    const year = Number(match[1]);
    const after = text.slice(match.index! + match[1].length).trimStart();
    if (NOT_A_YEAR.test(after) || BCE_AFTER.test(after) || BIBLIO_AFTER.test(after))
      continue;
    if (year >= 1000 && year <= 2026) years.push(year);
  }
  return years;
}

function hintYears(raw: string): number[] {
  const text = stripNoise(raw);
  const years: number[] = [];
  for (const match of text.matchAll(ROMAN_CENT_RE)) {
    const n = ROMAN[match[1].toUpperCase()];
    if (n) years.push(n * 100 - 50);
  }
  for (const match of text.matchAll(RU_CENT_RE)) {
    const n = Number(match[1]);
    if (n >= 1 && n <= 21) years.push(n * 100 - 50);
  }
  for (const [pattern, year] of ERA_HINTS) {
    if (pattern.test(text)) years.push(year);
  }
  return years;
}

function historical(years: number[]): number[] {
  return years.filter((year) => year < 2008 || year === 2001);
}

function pickNumeric(years: number[]): number | null {
  if (!years.length) return null;
  const hist = historical(years);
  if (hist.length) return Math.max(...hist);
  const modern = years.filter((year) => year >= 1990 && year <= 2026);
  if (modern.length) return Math.min(...modern);
  return Math.max(...years);
}

function yearFromName(name: string): number | null {
  const key = name.toLocaleLowerCase("ru").replace(/ё/g, "е");
  let best: { needle: string; year: number } | null = null;
  for (const [needle, year] of NAME_YEARS) {
    if (!key.includes(needle)) continue;
    if (!best || needle.length > best.needle.length) best = { needle, year };
  }
  return best?.year ?? null;
}

function looksModern(name: string, gloss: string): boolean {
  return MODERN_THING.test(`${name} ${gloss}`);
}

export function estimateFactYear(
  name: string,
  gloss: string,
  blob: string,
): number | null {
  const named = yearFromName(name);
  if (named !== null) return named;
  const card = `${name} ${gloss}`;
  const year =
    pickNumeric(numericYears(card)) ??
    pickNumeric(numericYears(blob)) ??
    (CULTURAL_WORK.test(card) ? null : pickNumeric(hintYears(card)));
  if (year !== null && looksModern(name, gloss) && year < 1850) {
    return null;
  }
  return year;
}

export function periodStart(year: number): number {
  if (year < 1000) return 0;
  return year - (year % 50);
}
