# MindMint Architecture

MindMint is a Next.js application that converts user-provided study material into structured learning formats. The app keeps paid AI credentials on the server and uses Firebase for authentication and usage tracking.

## Request Flow

1. A signed-in user submits source text and selects an output mode.
2. The client sends the request to `app/api/generate/route.ts` with a Firebase ID token.
3. The API route validates mode/layout, sanitizes input, verifies the token, and checks the daily generation limit.
4. `lib/generateService.ts` builds the mode-specific prompt and calls OpenAI server-side.
5. The response is parsed, normalized, and returned to the UI.
6. The relevant panel component renders the output.

## Key Modules

| Path | Responsibility |
| --- | --- |
| `app/api/generate/route.ts` | Authenticated generation endpoint and rate-limit gate |
| `lib/generateService.ts` | Prompt construction, OpenAI call, response cleanup |
| `lib/security.ts` | Input sanitization |
| `lib/rateLimit.ts` | Daily usage-limit policy |
| `lib/firebase/admin.ts` | Firebase Admin initialization and token verification |
| `components/MindMintApp.tsx` | Main application shell |
| `components/panels/*` | Output renderers for each study mode |
| `lib/export/*` | PDF and image export helpers |

## Security Boundaries

- Browser code can only use `NEXT_PUBLIC_` Firebase client config.
- `OPENAI_API_KEY` and `FIREBASE_SERVICE_ACCOUNT` are server-only.
- Generation requires a verified Firebase ID token.
- Daily usage is updated in a Firestore transaction before the OpenAI call to reduce race conditions.

## Cost and Performance

OpenAI usage is the primary variable cost. Input length validation and daily generation limits protect the project from accidental high spend. Exporting large diagrams can be CPU-heavy on older devices, so generated visual output should remain concise.

## Deployment

The production deployment runs on Vercel. Required environment variables are documented in `.env.local.example`.
