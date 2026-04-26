import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Report, ActivityLog, Document } from "@/lib/db/models";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const { workspaceId, criterionId, title, topics } = body;

    if (!workspaceId || !criterionId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 🔒 SAFETY LOCK: Check if workspace actually has documents (Your original logic)
    const docCount = await Document.countDocuments({ workspaceId });
    if (docCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "No documents found in this workspace. Please upload PDFs first." 
      }, { status: 400 });
    }

    console.log(`🚀 Triggering Python Generator for Workspace: ${workspaceId}, Criterion: ${criterionId}`);

    // 1. PYTHON API CALL (Synced with main.py naming)
    const pythonRes = await fetch(`${BACKEND_URL}/generate-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: workspaceId,
        criterion_id: criterionId,
        topics: topics || "" // Sent from frontend to Python loop
      }),
      // 🚀 95 Seconds timeout for deep AI compilation
      signal: AbortSignal.timeout(95000) 
    });

    if (!pythonRes.ok) {
      const errorText = await pythonRes.text();
      throw new Error(`AI Engine Error: ${errorText}`);
    }

    const pythonData = await pythonRes.json();
    const generatedContent = pythonData.content || "Empty report generated. Check documents.";

    // 2. SAVE TO MONGODB (Preserving your Versioning structure)
    const newReport = await Report.create({
      workspaceId,
      criterionId,
      title: title || `NAAC Criterion ${criterionId} Summary`,
      versions: [{ v: 1, content: generatedContent }], 
      currentVersion: 1,
      size: `${(Buffer.byteLength(generatedContent, 'utf8') / 1024).toFixed(1)} KB`
    });

    // 3. LOG ACTIVITY FOR DASHBOARD
    await ActivityLog.create({
      workspaceId,
      type: 'report',
      title: `Generated ${title}`
    });

    // ✅ THE CRITICAL FIX: Ensure ID is a string for instant frontend redirect
    return NextResponse.json({ 
      success: true, 
      reportId: newReport._id.toString() 
    });

  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}