---
description: Ensuring Firestore queries don't fail silently or crash
---

# HWT-DB-01: The Index Trap

## The Mistake
Running a Firestore query with multiple `where()` filters or an `orderBy()` on a different field than the filter WITHOUT a composite index. Firestore will throw an error, but if not caught properly, the UI just shows "Loading..." forever or "No items found."

## The Fix
1.  **Catch & Log:** Wrap every complex query in a `try/catch` and look specifically for the "Query requires an index" error string.
2.  **The Direct Link:** The Firebase error message contains a specific URL that, when clicked, automatically creates the required index for you.

### Implementation Pattern
```typescript
try {
  const q = query(
    collection(db, "notes"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
} catch (error: any) {
  if (error.message.includes("requires an index")) {
    console.error("CRITICAL: Missing Firestore Index. Click here to create it:", error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)[0]);
  }
  throw error;
}
```

## Audit Questions
- Did I add a new `where()` or `orderBy()` to an existing query?
- Does this query involve more than one field?
- If yes, have I deployed the required composite index?
