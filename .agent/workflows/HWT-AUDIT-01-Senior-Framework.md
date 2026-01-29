---
description: The master checklist for upgrading from Junior to Senior engineering
---

# HWT-AUDIT-01: The Senior Auditor Framework

Whenever the user asks "Antigravity, Audit this," I will run the code through these five critical lenses.

## 1. The Security Lens (The "Hacker" Perspective)
*   **Input Sanitization:** "Can a user pass a string that deletes my database or injects a script (XSS)?"
*   **Authorization vs Authentication:** "I know who the user is, but did I check if they actually have permission to EDIT this specific doc?"
*   **Data Leakage:** "Am I returning extra fields (like `userEmail` or `hashedPassword`) in the API response that the frontend doesn't actually need?"

## 2. The Performance Lens (The "1,000 Users" Perspective)
*   **The N+1 Problem:** "Am I making 10 separate database calls inside a loop? Can I combine them into one query?"
*   **Cold Starts:** "Is this backend function too heavy? Will it take 5 seconds to wake up after 10 minutes of inactivity?"
*   **Bundle Size:** "Am I importing a massive 1MB library just to use one small function? Is there a lighter way?"

## 3. The Resilience Lens (The "Chaos" Perspective)
*   **Graceful Degradation:** "If the AI API is down, does the screen go white, or is there a friendly message with a 'Try Again' button?"
*   **Race Conditions:** "If a user clicks 'Submit' twice in one second, will it create two duplicate notes in the database?"
*   **Timeouts:** "Is there a hard limit on how long we wait for a response before we give up and release the resources?"

## 4. The Maintainability Lens (The "Future You" Perspective)
*   **Single Responsibility:** "Is this component doing too much? (e.g., fetching data, formatting text, AND rendering the UI)."
*   **Magic Numbers:** "Are there hardcoded values like `1000` or `'/api/v1'` scattered everywhere? Should they be in a config file?"
*   **Code Duplication (DRY):** "Did I write this exact same logic in three different files? Should it be a shared helper or hook?"

## 5. The UX & Business Lens (The "User" Perspective)
*   **Optimistic UI:** "Can we show the note on the screen immediately while the database saves it in the background to make it feel 'Instant'?"
*   **Accessibility (a11y):** "Can someone use this with just a keyboard? Do my images have `alt` tags?"
*   **Cost Management:** "Is this specific AI prompt using the most expensive model? Could a cheaper model do the same job?"

## Usage
Add this to any request: **"Perform HWT-AUDIT-01 on this code."**
