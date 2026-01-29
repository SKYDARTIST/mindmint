import admin from "firebase-admin";

let serviceAccount;
try {
    serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : undefined;

    // 🛡️ Fix for newline escaping in environment variables
    if (serviceAccount && serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
} catch (error) {
    console.error("CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT env var. Ensure it is a valid single-line JSON string.", error);
    serviceAccount = undefined;
}

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        // Fallback for local development if service account is not yet provided
        // In a real production environment, this should throw an error.
        admin.initializeApp();
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

export function getAdminDb() {
    return adminDb;
}

export async function verifyIdToken(token: string) {
    try {
        return await adminAuth.verifyIdToken(token);
    } catch (error) {
        console.error("Error verifying ID token:", error);
        return null;
    }
}
