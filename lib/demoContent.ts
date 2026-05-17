import type { AppMode, Flashcard, InfographicContent, QuizItem } from "@/types";

const topicFromInput = (input: string) => {
    const cleaned = input
        .replace(/\s+/g, " ")
        .trim()
        .replace(/[?.!,;:]+$/g, "");

    if (!cleaned) return "Your Topic";
    if (cleaned.length <= 48) return cleaned;
    return `${cleaned.slice(0, 45).trim()}...`;
};

export const generateDemoContent = (
    mode: AppMode,
    input: string,
    layout: string
): string | Flashcard[] | QuizItem[] | InfographicContent => {
    const topic = topicFromInput(input);

    switch (mode) {
        case "mindmap":
            if (layout === "categorized") {
                return `graph TD
  root["${topic}"]
  root --> basics["Core Ideas"]
  root --> examples["Examples"]
  root --> practice["Practice"]
  root --> review["Review"]
  basics --> definition["Simple definition"]
  basics --> purpose["Why it matters"]
  examples --> daily["Everyday example"]
  examples --> classroom["Study example"]
  practice --> explain["Explain in your words"]
  practice --> compare["Compare related ideas"]
  review --> recall["Quick recall"]
  review --> quiz["Self-test"]`;
            }

            if (layout === "flow") {
                return `graph TD
  start["Start with ${topic}"] --> understand["Understand the basic idea"]
  understand --> breakDown["Break it into smaller parts"]
  breakDown --> connect["Connect parts with examples"]
  connect --> apply["Apply it to a question"]
  apply --> review["Review and improve"]`;
            }

            return `mindmap
  root(("${topic}"))
    Core Ideas
      Definition
      Purpose
      Key terms
    Examples
      Real world
      Study use
    Practice
      Explain simply
      Ask questions
    Review
      Recall
      Quiz yourself`;

        case "flashcards":
            return [
                {
                    question: `What is the main idea of ${topic}?`,
                    answer: `${topic} can be understood by identifying its core definition, purpose, and real-world examples.`,
                    tag: "Core",
                },
                {
                    question: `How should you study ${topic}?`,
                    answer: "Break it into smaller concepts, connect each concept to an example, then test yourself with recall.",
                    tag: "Study Method",
                },
                {
                    question: `Why does ${topic} matter?`,
                    answer: "It matters because understanding the core idea helps you apply it instead of only memorizing it.",
                    tag: "Application",
                },
            ];

        case "quiz":
            return [
                {
                    type: "multiple-choice",
                    question: `What is the best first step for learning ${topic}?`,
                    options: [
                        "Memorize every detail immediately",
                        "Understand the core idea first",
                        "Skip examples",
                        "Only read once",
                    ],
                    correctAnswer: "Understand the core idea first",
                    explanation: "A strong overview makes the details easier to organize and remember.",
                    meta: { difficulty: "easy", topic },
                },
                {
                    type: "multiple-choice",
                    question: "Which habit improves long-term retention?",
                    options: ["Passive rereading", "Active recall", "Avoiding practice", "Cramming once"],
                    correctAnswer: "Active recall",
                    explanation: "Testing yourself forces retrieval, which strengthens memory.",
                    meta: { difficulty: "easy", topic },
                },
            ];

        case "infographic":
            return {
                title: topic,
                tagline: "A demo learning flow that shows how MindMint structures study material.",
                layout: layout === "comparison" || layout === "process_flow" ? layout : "step_by_step",
                steps: [
                    {
                        title: "Define",
                        description: "Start with a plain-language definition of the topic.",
                        icon: "bulb",
                        accent: "blue",
                    },
                    {
                        title: "Break Down",
                        description: "Split the topic into smaller ideas that are easier to study.",
                        icon: "list",
                        accent: "purple",
                    },
                    {
                        title: "Apply",
                        description: "Connect the concept to examples, questions, or real situations.",
                        icon: "target",
                        accent: "green",
                    },
                    {
                        title: "Review",
                        description: "Use recall, quizzes, and flashcards to check understanding.",
                        icon: "check",
                        accent: "gray",
                    },
                ],
            };

        case "summary":
        default:
            if (layout === "bullet") {
                return `${topic}

1. Start by identifying the central idea.
2. Break the topic into smaller concepts.
3. Connect each concept to a simple example.
4. Review with active recall instead of passive rereading.
5. Use quizzes or flashcards to check understanding.

Demo note: This is sample output generated locally for portfolio review. No paid AI API was called.`;
            }

            if (layout === "study_notes") {
                return `${topic}

Overview
${topic} is shown here as a structured study example. MindMint's production demo converts input into a clear learning format without calling a paid AI API.

Key Ideas
- Define the topic in simple words.
- Identify the most important parts.
- Connect each part to an example.
- Review using recall-based practice.

Study Strategy
Use this output as a preview of how the app organizes learning material. In a real AI-enabled deployment, the same interface can be connected to OpenAI or another model provider.`;
            }

            return `${topic}

${topic} can be understood by starting with the core idea, then breaking it into smaller parts. A good study flow explains what the topic means, why it matters, and how it can be applied.

This demo output is generated locally for portfolio review. It shows the product experience without calling OpenAI, Gemini, or any paid model API.`;
    }
};

