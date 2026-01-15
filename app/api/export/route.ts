import { NextRequest, NextResponse } from "next/server";
import { formatForExport } from "@/lib/generateService";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { content, mode, appMode } = await req.json();

        if (!content || !mode || !appMode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Authenticate and verify Pro status
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: planData } = await supabase
            .from('user_plans')
            .select('plan')
            .eq('user_id', user.id)
            .single();

        const plan = planData?.plan || 'free';

        if (plan !== 'pro') {
            return NextResponse.json({ error: "Pro plan required for exports" }, { status: 403 });
        }

        const formattedContent = await formatForExport(appMode, content, mode);

        return NextResponse.json({ ok: true, data: formattedContent });
    } catch (error: any) {
        console.error("Export API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to format for export" }, { status: 500 });
    }
}
