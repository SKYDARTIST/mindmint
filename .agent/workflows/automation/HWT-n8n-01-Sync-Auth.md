---
description: Resolving persistence and auth errors in n8n workflows
---

# HWT-n8n-01: Credential & Sync Issues

## The Mistake
Workflows failing because n8n loses authentication with the backend (Postgres/Supabase) or because the Gemini API key is improperly formatted in the node.

## The Fix
1.  **Variable Masking:** Use n8n Expressions to pull from Environment Variables or credentials, never hardcode.
2.  **The "Preference" Sync:** Always start a profile-dependent workflow with a node that fetches the *latest* data from the database, rather than relying on the trigger data alone.

### Implementation Pattern (n8n Node setup)
- Node 1: `Get User Profile` (SQL: `SELECT * FROM profiles WHERE id = {{ $json.userId }}`)
- Node 2: `Gemini AI` (Prompt: `Use these preferences: {{ $node["Get User Profile"].json.preferences }}`)

## Audit Questions
- Does this workflow depend on a dynamic user profile?
- Are we fetching the LATEST data from the DB before the AI node?
- Is there an "Error Trigger" workflow connected to notify if a node fails?
