# MindMint

AI study workspace that turns raw notes or topics into mind maps, flashcards, quizzes, summaries, and infographics.

**Live:** [mindmint.study](https://mindmint.study)

---

## What It Does

Paste lecture notes, a chapter, an article, or a topic. MindMint generates five study formats:

- **Mind Map** — visual topic breakdown rendered with Mermaid.js
- **Flashcards** — front/back cards for active recall
- **Quiz** — multiple-choice questions with answers
- **Summary** — structured key points
- **Infographic** — hierarchical visual overview

All AI generation runs server-side. The OpenAI key never reaches the browser.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| AI | OpenAI via server-side API routes |
| Auth and data | Firebase Auth, Firestore |
| Rendering | Mermaid.js |
| Export | jsPDF, html-to-image |
| Deployment | Vercel |
| PWA | Web app manifest, service worker |

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full system diagram and core decisions.

Short version:

- User input is sanitized server-side before model generation.
- Firebase ID tokens are verified on every generation request.
- Daily limit is enforced server-side in Firestore.
- Mermaid output is normalized before rendering to reduce parser failures.
- Exports run through dedicated PDF/PNG helpers.

## Project Structure

```text
mindmint/
├── app/
│   ├── api/generate/route.ts    # Auth, rate limit, sanitize, OpenAI
│   ├── api/export/route.ts      # PDF/PNG export
│   ├── page.tsx                 # Landing page
│   └── notes/page.tsx           # Saved notes
├── components/
│   ├── MindMintApp.tsx          # Main app shell
│   ├── panels/                  # Per-mode renderers
│   └── EditorShell.tsx          # Input and toolbar
├── lib/
│   ├── generateService.ts       # Prompt builder and OpenAI client
│   ├── rateLimit.ts             # Daily usage policy
│   ├── security.ts              # Input sanitization
│   └── firebase/                # Auth and Firestore setup
└── public/
    ├── sw.js                    # Service worker
    └── manifest.json            # PWA manifest
```

## Run Locally

**Prerequisites:** Node.js 20+ and Firebase project credentials.

```bash
git clone https://github.com/SKYDARTIST/mindmint.git
cd mindmint
npm install
cp .env.local.example .env.local
npm run dev
```

Fill in Firebase config, Firebase Admin service account JSON, and an OpenAI API key in `.env.local`.

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
npm run audit:high
```

`npm run check` runs linting, type checking, and a production build.

## Cost and Performance Notes

AI generation calls OpenAI from the server, so every successful generation has API cost. The app limits free users to a daily quota and validates input size before generation. For production, monitor token usage and model latency before raising limits.

Exports run in the browser and can be CPU-heavy for large visual outputs. Keep generated diagrams compact enough for mobile devices.

## Security Notes

- Do not commit `.env.local` or Firebase service account JSON files.
- Keep `OPENAI_API_KEY` server-only.
- Rotate credentials immediately if a real key is committed.
- Review `firestore.rules` before changing note storage or user data paths.

See [SECURITY.md](SECURITY.md) for reporting and operational guidance.

---

Built by [Aakash Gajbhiye](https://aakashbuild.vercel.app) / [@AakashBuild](https://x.com/AakashBuild)
