/* =========================
   App Modes
========================= */

export type AppMode =
  | "mindmap"
  | "flashcards"
  | "quiz"
  | "summary"
  | "infographic";

/* =========================
   Theme
========================= */

export type ThemeMode = "light" | "dark";

/* =========================
   Layout Types
========================= */

export type MindmapLayout =
  | "classic"
  | "categorized"
  | "flow";

export type FlashcardLayout =
  | "classic"
  | "concept"
  | "cloze";

export type QuizLayout =
  | "classic"
  | "speed"
  | "scenario";

export type SummaryLayout =
  | "concept_overview"
  | "bullet"
  | "study_notes";

export type InfographicLayout =
  | "step_by_step"
  | "process_flow"
  | "comparison";

/* =========================
   Flashcards
========================= */

export interface Flashcard {
  question: string;
  answer: string;
  tag?: string;
}

/* =========================
   Quiz
========================= */

export interface QuizItem {
  type:
  | "multiple-choice"
  | "true-false"
  | "short-answer"
  | "fill-gap";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  meta?: {
    difficulty?: string;
    style?: string;
    topic?: string;
    skill?: string;
    [key: string]: any;
  };
}

/* =========================
   Infographic
========================= */

export interface InfographicStep {
  title: string;
  description: string;
  icon?:
  | "star"
  | "number"
  | "check"
  | "cross"
  | "arrow"
  | "dot"
  | "bulb"
  | "target"
  | "list"
  | "chart";
  accent?: "blue" | "green" | "red" | "purple" | "gray";
}

export interface InfographicContent {
  title: string;
  tagline: string;
  layout: InfographicLayout;
  steps: InfographicStep[];
}

/* =========================
   AI Generation Results
========================= */

export type GenerationResult =
  | { type: "text"; content: string }
  | { type: "json_flashcards"; content: Flashcard[] }
  | { type: "json_quiz"; content: QuizItem[] }
  | { type: "json_infographic"; content: InfographicContent };
