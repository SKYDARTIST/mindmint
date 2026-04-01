# Mindmint — AI Study Tools

Generate mindmaps, quizzes, and flashcards from any topic or document instantly.

**[Live App →](https://mindmint-ruddy.vercel.app)**

---

## What It Does

- **Mindmaps** — visualize any topic as a structured mindmap (Mermaid diagrams)
- **Quizzes** — auto-generate multiple choice questions with explanations
- **Flashcards** — spaced-repetition flashcards for fast memorization
- Export to PDF or image
- Free usage model with daily limits tracked per user

## Tech Stack

- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Database/Auth**: Firebase + Firestore
- **AI**: OpenAI API (via Next.js API routes)
- **Diagrams**: Mermaid.js
- **Export**: jsPDF + html-to-image
- **Deployment**: Vercel

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Add Firebase config + OpenAI API key
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000)

---

Built by [@AakashBuild](https://x.com/AakashBuild)
