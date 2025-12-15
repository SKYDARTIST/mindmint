'use server';

import { generateContent } from "../services/openaiService";
import { 
  checkRateLimit, 
  generateRateLimitFallback, 
  cleanupRateLimitStore 
} from "../lib/rateLimiter";
import { AppMode } from "../types";

function getSafeClientIdentifier() {
  return "global-session";
}

export async function generateContentAction(
  mode: AppMode,
  inputText: string,
  layout: string = 'classic'
) {
  try {
    if (Math.random() < 0.1) {
      cleanupRateLimitStore();
    }

    const clientId = getSafeClientIdentifier();
    const rateLimitResult = checkRateLimit(clientId, 8, 60000);
    
    if (rateLimitResult.limited) {
      return generateRateLimitFallback(mode, layout, rateLimitResult.resetTime);
    }

    const result = await generateContent(mode, inputText, layout as any);
    return result;
  } catch (error) {
    console.error("Server action error:", error);
    return getFallbackContent(mode, layout);
  }
}

function getFallbackContent(mode: AppMode, layout: string) {
  switch (mode) {
    case AppMode.MINDMAP:
      return "graph TD\nA[Fallback Content]\nB[Please try again]\nA --> B";
    case AppMode.FLASHCARDS:
      return [{ question: "What happened?", answer: "An error occurred during generation.", tag: "error" }];
    case AppMode.QUIZ:
      return [{
        type: "multiple-choice",
        question: "What went wrong?",
        options: ["A. API Error", "B. Network Issue", "C. Unknown Error", "D. All of the above"],
        correctAnswer: "D. All of the above",
        explanation: "An error occurred during content generation.",
        meta: { difficulty: "medium", style: layout }
      }];
    case AppMode.INFOGRAPHIC:
      return {
        title: "Error State",
        tagline: "Content generation failed",
        layout: layout,
        steps: [
          { title: "Error", description: "An error occurred", icon: "error", accent: "red" }
        ]
      };
    case AppMode.SUMMARY:
      return "## Error\n\nAn error occurred during content generation. Please try again.";
    default:
      return "Content generation failed. Please try again.";
  }
}