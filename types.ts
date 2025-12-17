
export enum AppMode {
  MINDMAP = 'mindmap',
  FLASHCARDS = 'flashcards',
  QUIZ = 'quiz',
  SUMMARY = 'summary',
  INFOGRAPHIC = 'infographic',
}

export type MindmapLayout = 'classic' | 'flow' | 'layered' | 'chain';
export type FlashcardLayout = 'minimal' | 'qa' | 'keyword' | 'chunked' | 'scenario';
export type QuizLayout = 'classic' | 'mcq-heavy' | 'tf-speed' | 'scenario' | 'mixed';
export type SummaryLayout = 'executive' | 'bullet' | 'notes' | 'infostructured';
export type InfographicLayout = 'three_column' | 'timeline' | 'pillars' | 'flow' | 'comparison';

export interface Flashcard {
  question: string;
  answer: string;
  tag?: string;
}

export interface QuizItem {
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-gap';
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

export interface InfographicStep {
  title: string;
  description: string;
  icon?: 'star' | 'number' | 'check' | 'cross' | 'arrow' | 'dot' | 'bulb' | 'target' | 'list' | 'chart';
  accent?: 'blue' | 'green' | 'red' | 'purple' | 'gray'; 
}

export interface InfographicContent {
  title: string;
  tagline: string;
  layout: InfographicLayout;
  steps: InfographicStep[];
}

export type GenerationResult = 
  | { type: 'text'; content: string }
  | { type: 'json_flashcards'; content: Flashcard[] }
  | { type: 'json_quiz'; content: QuizItem[] }
  | { type: 'json_infographic'; content: InfographicContent };
