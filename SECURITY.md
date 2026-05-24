# Security Policy

MindMint's public deployment runs in demo mode by default and does not call paid AI APIs. The codebase still contains the production-style path for Firebase authentication, Firestore data, rate limits, and OpenAI generation, so treat changes to auth, rate limits, export, and generation routes as security-sensitive.

## Supported Version

This repository tracks the production version deployed from `main`.

## Reporting a Vulnerability

If you find a vulnerability, do not open a public issue with exploit details. Contact the maintainer through the profile linked in the README and include:

- Affected route, component, or configuration.
- Clear reproduction steps.
- Expected impact.
- Whether any credentials or user data may be exposed.

## Secrets

Never commit:

- `.env`, `.env.local`, or deployment environment files.
- Firebase Admin service account JSON.
- OpenAI API keys.
- OAuth client secrets.

If a real secret is committed, rotate it immediately in the provider dashboard and remove it from git history before treating the repository as clean.

## Operational Notes

- Keep `MINDMINT_DEMO_MODE=true` for public portfolio deployments to avoid sign-in friction and paid API abuse.
- If real OpenAI calls are enabled, they create direct API cost. Keep Firebase auth, server-side rate limits, and usage monitoring enabled.
- Firebase ID tokens must be verified before non-demo generation or user data access.
- Firestore rules should deny cross-user reads and writes by default.
- Generated Mermaid and exported HTML should stay sanitized before rendering.
