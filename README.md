# MindMint

AI-powered study tool that converts any text or topic into mind maps, flashcards, quizzes, summaries, and infographics. Free to use, no subscription.

**Live:** https://mindmint.study

---

## What It Does

Paste any text — lecture notes, a chapter, an article — or type a topic. MindMint generates five study formats instantly:

- **Mind Map** — visual topic breakdown rendered with Mermaid.js
- **Flashcards** — front/back cards for active recall
- **Quiz** — multiple choice questions with answers
- **Summary** — structured key points
- **Infographic** — hierarchical visual overview

All generation is server-side. The OpenAI key never reaches the browser.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 + React 19 (TypeScript) |
| AI | OpenAI GPT-4o via server-side API route |
| Auth | Firebase (Google Sign-In + email link) |
| Usage tracking | Firestore (`user_plan_usage`) |
| Mind map rendering | Mermaid.js |
| Export | PDF + PNG (jsPDF + html-to-image) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |
| PWA | Service worker + Web App Manifest |

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full system diagram and core design decisions.

**Short version:**
- User input → sanitized server-side → OpenAI → JSON output → panel renderer
- Firebase ID token verified on every generation request
- Daily limit (5 generations/day) enforced server-side in Firestore
- Mermaid.js output sanitized to prevent parser crashes

---

## Local Development

```bash
git clone https://github.com/SKYDARTIST/mindmint.git
cd mindmint
npm install
cp .env.local.example .env.local
# fill in Firebase config + OpenAI API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
mindmint/
├── app/
│   ├── api/generate/route.ts    # Core endpoint: auth → rate limit → sanitize → OpenAI
│   ├── api/export/route.ts      # PDF/PNG export
│   ├── page.tsx                 # Landing page
│   └── notes/page.tsx           # Saved notes
├── components/
│   ├── MindMintApp.tsx          # Main app shell
│   ├── panels/                  # Per-mode renderers (Mindmap, Flashcards, Quiz, Summary, Infographic)
│   └── EditorShell.tsx          # Input + toolbar
├── lib/
│   ├── generateService.ts       # OpenAI client, prompt builder, Mermaid sanitizer
│   ├── rateLimit.ts             # Daily limit logic
│   ├── security.ts              # Input sanitization
│   └── firebase/                # Auth + Firestore
└── public/
    ├── sw.js                    # Service worker
    └── manifest.json            # PWA manifest
```

---

## Security

- OpenAI API key is server-side only — no `NEXT_PUBLIC_` prefix
- Firebase ID token verified on every `/api/generate` request
- User input sanitized against prompt injection before reaching OpenAI
- Daily generation limit enforced server-side, not client-side

---

Built by [Aakash Gajbhiye](https://aakashbuild.vercel.app) / [@AakashBuild](https://x.com/AakashBuild)
