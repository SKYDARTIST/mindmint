import admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

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
