import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Report } from "@/lib/db/models";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  context: { params: Promise<{ reportId: string }> | { reportId: string } }
) {
  try {
    await connectToDB();

    // 🚀 Awaiting params (Safe for Next.js 15)
    const resolvedParams = await context.params;
    const reportId = resolvedParams.reportId;

    console.log("🔍 Fetching Report ID:", reportId);

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        console.error("❌ Invalid Report ID format:", reportId);
        return NextResponse.json({ success: false, error: "Invalid Report ID" }, { status: 400 });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      report 
    });

  } catch (error: any) {
    console.error("🚨 Error fetching report:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch report details" }, { status: 500 });
  }
}