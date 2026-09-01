export const EDITORS = [
  { key: "merzlyakov", name: "Максим Мерзляков", short: "Мерзляков" },
  { key: "monosov", name: "Борис Моносов", short: "Моносов" },
  { key: "borok", name: "Дмитрий Борок", short: "Борок" },
  { key: "abramov", name: "Андрей Абрамов", short: "Абрамов" },
  { key: "naumenko", name: "Константин Науменко", short: "Науменко" },
  { key: "mirotin", name: "Евгений Миротин", short: "Миротин" },
] as const;

export type EditorKey = (typeof EDITORS)[number]["key"];
