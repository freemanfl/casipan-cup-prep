import type { EditorKey } from "./editors";

export type CaspianQuestion = {
  question_id: string;
  editor: string;
  editorKey: EditorKey;
  tour_id: string;
  tour_title: string;
  number: string;
  question: string;
  answer: string;
  pass_criteria: string;
  comment: string;
  sources: string;
  has_handout: boolean;
};

export type CaspianFact = {
  name: string;
  gloss: string;
};

export type TourGroup = {
  tour_id: string;
  tour_title: string;
  editor: string;
  date: string;
  questions: CaspianQuestion[];
};

export type OverviewFact = CaspianFact & { year: number };

export type OverviewPeriod = {
  start: number;
  label: string;
  title: string;
  text: string;
  count: number;
  facts: OverviewFact[];
};

export type OverviewTheme = {
  name: string;
  count: number;
  share: number;
};

export type OverviewTag = {
  name: string;
  times: number;
};

export type QuestionTypeGuide = {
  id: string;
  title: string;
  what: string;
  example: string;
  how: string;
};

export type OverviewPayload = {
  factCount: number;
  datedCount: number;
  periods: OverviewPeriod[];
  themes: OverviewTheme[];
  tags: OverviewTag[];
  types: QuestionTypeGuide[];
};

