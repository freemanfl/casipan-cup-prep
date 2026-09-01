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

