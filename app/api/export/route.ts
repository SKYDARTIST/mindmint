import { NextRequest, NextResponse } from "next/server";
import { formatForExport } from "@/lib/generateService";
import { isDemoMode } from "@/lib/demoMode";

export async function POST(req: NextRequest) {
    try {
        const { content, mode, appMode } = await req.json();

        if (!content || !mode || !appMode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (isDemoMode()) {
            const formattedContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
            return NextResponse.json({ ok: true, data: formattedContent, demo: true });
        }

        // 1. Authenticate and verify Pro status using ID token from headers
        const { verifyIdToken, getAdminDb } = await import("@/lib/firebase/admin");
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await verifyIdToken(idToken);
        if (!decodedToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const adminDb = getAdminDb();
        const userPlanDoc = await adminDb.collection('user_plans').doc(decodedToken.uid).get();
        const plan = userPlanDoc.exists ? userPlanDoc.data()?.plan : 'free';

        if (plan !== 'pro') {
            return NextResponse.json({ error: "Pro plan required for exports" }, { status: 403 });
        }

        const formattedContent = await formatForExport(appMode, content, mode);

        return NextResponse.json({ ok: true, data: formattedContent });
    } catch (error) {
        console.error("Export API Error:", error);
        const message = error instanceof Error ? error.message : "Failed to format for export";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
