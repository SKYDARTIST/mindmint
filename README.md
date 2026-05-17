# MindMint

AI study workspace that turns raw notes or topics into mind maps, flashcards, quizzes, summaries, and infographics.

This public portfolio deployment runs in **demo mode** by default. It returns realistic local sample outputs and does not call OpenAI, Gemini, or any other paid model API.

**Live:** [mindmint.study](https://mindmint.study)

---

## What It Does

Paste lecture notes, a chapter, an article, or a topic. MindMint generates five study formats:

- **Mind Map** — visual topic breakdown rendered with Mermaid.js
- **Flashcards** — front/back cards for active recall
- **Quiz** — multiple-choice questions with answers
- **Summary** — structured key points
- **Infographic** — hierarchical visual overview

Demo generation runs locally on the server with deterministic sample output. The code still keeps the real AI integration path isolated server-side for future use.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Demo generator by default; optional OpenAI server-side integration |
| Auth and data | Optional Firebase Auth, Firestore |
| Rendering | Mermaid.js |
| Export | jsPDF, html-to-image |
| Deployment | Vercel |
| PWA | Web app manifest, service worker |

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full system diagram and core decisions.

Short version:

- Demo mode returns local sample outputs and skips paid API calls.
- In non-demo mode, user input is sanitized server-side before model generation.
- In non-demo mode, Firebase ID tokens are verified on every generation request.
- In non-demo mode, daily limits are enforced server-side in Firestore.
- Mermaid output is normalized before rendering to reduce parser failures.
- Exports run through dedicated PDF/PNG helpers.

## Project Structure

```text
mindmint/
├── app/
│   ├── api/generate/route.ts    # Demo output, or auth/rate limit/OpenAI when enabled
│   ├── api/export/route.ts      # PDF/PNG export
│   ├── page.tsx                 # Landing page
│   └── notes/page.tsx           # Saved notes
├── components/
│   ├── MindMintApp.tsx          # Main app shell
│   ├── panels/                  # Per-mode renderers
│   └── EditorShell.tsx          # Input and toolbar
├── lib/
│   ├── demoContent.ts           # Local sample output for public demo mode
│   ├── generateService.ts       # Optional prompt builder and OpenAI client
│   ├── rateLimit.ts             # Daily usage policy
│   ├── security.ts              # Input sanitization
│   └── firebase/                # Auth and Firestore setup
└── public/
    ├── sw.js                    # Service worker
    └── manifest.json            # PWA manifest
```

## Run Locally

**Prerequisites:** Node.js 20+.

```bash
git clone https://github.com/SKYDARTIST/mindmint.git
cd mindmint
npm install
cp .env.local.example .env.local
npm run dev
```

No API key is required for the default demo mode.

To enable real AI generation later, set:

```bash
MINDMINT_DEMO_MODE=false
NEXT_PUBLIC_MINDMINT_DEMO_MODE=false
OPENAI_API_KEY=your_openai_api_key
```

For saved notes and authenticated rate limits, also add Firebase client config and `FIREBASE_SERVICE_ACCOUNT`.

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

The public deployment is intentionally no-cost: demo mode does not call any paid model API. This makes the project safe to keep public as a portfolio demo.

If real AI generation is enabled, every successful generation has OpenAI API cost. Keep server-side rate limits on, monitor token usage, and avoid enabling real model calls on a public demo without abuse protection.

Exports run in the browser and can be CPU-heavy for large visual outputs. Keep generated diagrams compact enough for mobile devices.

## Security Notes

- Do not commit `.env.local` or Firebase service account JSON files.
- Keep demo mode enabled for public portfolio deployments unless you are prepared to pay for model usage.
- Keep `OPENAI_API_KEY` server-only if real AI is enabled.
- Rotate credentials immediately if a real key is committed.
- Review `firestore.rules` before changing note storage or user data paths.

See [SECURITY.md](SECURITY.md) for reporting and operational guidance.

---

Built by [Aakash Gajbhiye](https://aakashbuild.vercel.app) / [@AakashBuild](https://x.com/AakashBuild)
