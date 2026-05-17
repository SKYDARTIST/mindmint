# Architecture — MindMint

MindMint is a Next.js PWA that converts text or topics into study tools: mind maps, flashcards, quizzes, summaries, and infographics. OpenAI generation runs server-side so paid credentials never reach the client. Auth and daily usage tracking run through Firebase.

```mermaid
flowchart TD
  User["Browser / PWA\nNext.js App Router"]

  User -->|"Bearer token + input"| GenerateAPI["POST /api/generate\nServer-side route"]
  User -->|"Google Sign-In"| Firebase["Firebase Auth\n+ Firestore"]
  User -->|"Export PDF/PNG"| ExportAPI["POST /api/export\nServer-side route"]

  GenerateAPI -->|"Verify ID token"| Firebase
  GenerateAPI -->|"Check daily limit"| Firestore["Firestore\nuser_plan_usage"]
  GenerateAPI -->|"Sanitized prompt"| OpenAI["OpenAI API"]

  OpenAI -->|"JSON or Mermaid output"| GenerateAPI
  GenerateAPI -->|"Study output"| User

  ExportAPI -->|"PDF or PNG render"| User
  Firebase --> Firestore
```

## Core Decisions

### 1. Server-Side Generation

All OpenAI calls go through `app/api/generate/route.ts`. The client sends a Firebase ID token; the server verifies it, checks the daily limit, sanitizes input, then calls OpenAI. The API key lives only in server environment variables.

### 2. Firebase Auth and Usage Tracking

Auth uses Firebase Google Sign-In and email link flows. Daily usage is tracked in Firestore under `user_plan_usage/{uid}`.

### 3. Server-Enforced Daily Limit

`lib/rateLimit.ts` checks usage against `DAILY_GENERATION_LIMIT`. The client reflects remaining usage, but the server is the source of truth.

### 4. Prompt Injection Resistance

`lib/security.ts` sanitizes user input before it reaches the generation prompt. User content is wrapped and treated as data, not instruction.

### 5. One Generation Service, Five Modes

`lib/generateService.ts` handles mind maps, flashcards, quizzes, summaries, and infographics through one `generateContent()` function that switches prompt strategy and expected output shape per mode.

### 6. Defensive Mermaid Rendering

OpenAI output can contain characters that break Mermaid parsing. `sanitizeMermaid()` strips code fences, escapes problematic labels, and normalizes graph structure before rendering.

### 7. PWA-First Shell

`public/sw.js` registers a service worker and `public/manifest.json` configures installability with 192px and 512px icons.

## Key Files

| Path | Responsibility |
| --- | --- |
| `app/api/generate/route.ts` | Authenticated generation endpoint and rate-limit gate |
| `app/api/export/route.ts` | PDF/PNG export endpoint |
| `lib/generateService.ts` | OpenAI client, prompt builder, Mermaid sanitizer, JSON cleaner |
| `lib/rateLimit.ts` | Daily limit policy |
| `lib/security.ts` | Input sanitization |
| `lib/firebase/admin.ts` | Firebase Admin SDK and token verification |
| `lib/firebase/config.ts` | Firebase client SDK init |
| `components/panels/` | Per-mode output renderers |
| `components/MindMintApp.tsx` | Main app shell |
| `public/sw.js` | PWA service worker |

## Output Modes

| Mode | Output Format | Renderer |
| --- | --- | --- |
| Mind Map | Mermaid.js syntax | `MindmapPanel.tsx` |
| Flashcards | JSON array | `FlashcardsPanel.tsx` |
| Quiz | JSON array | `QuizPanel.tsx` |
| Summary | Structured text | `SummaryPanel.tsx` |
| Infographic | Hierarchical JSON | `InfographicPanel.tsx` |

## Firestore Data Model

```text
user_plan_usage/{uid}
  daily_count          number
  last_generation_at   ISO timestamp
```

## Environment Variables

See `.env.local.example` for the full list.

| Variable | Where Used |
| --- | --- |
| `OPENAI_API_KEY` | `lib/generateService.ts`, server only |
| `NEXT_PUBLIC_FIREBASE_*` | `lib/firebase/config.ts`, client-safe Firebase config |
| `FIREBASE_SERVICE_ACCOUNT` | `lib/firebase/admin.ts`, server only |

## Cost and Performance

OpenAI usage is the main variable cost. Input validation and daily limits protect against accidental high spend. Exporting large diagrams can be CPU-heavy on older devices, so generated visual output should stay compact.

## Deployment

- **Frontend and API routes:** Vercel
- **Auth and usage DB:** Firebase
- **Live URL:** https://mindmint.study
