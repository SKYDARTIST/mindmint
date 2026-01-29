---
description: Preventing Google Login failures on Android/Capacitor
---

# HWT-Auth-01: Capacitor Google Redirect

## The Mistake
Using the standard `GoogleLogin` React component or `signInWithPopup` in a Capacitor environment. Android WebViews often block popups or fail to render the Google iFrame correctly, leading to a blank screen or a "403: disallowed_useragent" error.

## The Fix
Always use the **Redirect Flow**. This navigates the entire WebView to Google and back, which is the most reliable method for hybrid mobile apps.

### Implementation Pattern (Firebase Auth)
```typescript
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";

const provider = new GoogleAuthProvider();
const auth = getAuth();

// To Trigger
const handleSignIn = () => {
  signInWithRedirect(auth, provider);
};

// To Handle return (in App.tsx or useAuth hook)
useEffect(() => {
  getRedirectResult(auth).then((result) => {
    if (result) {
      // User signed in successfully
    }
  }).catch((error) => {
    console.error("Auth redirect error", error);
  });
}, []);
```

## Audit Questions
- Is this running in a Capacitor environment? (Check for `Capacitor.isNativePlatform()`)
- Are we using a component that relies on popups? If yes, replace with Redirect.
- Is the OAuth Redirect URI configured in Google Cloud Console for BOTH web and android?
