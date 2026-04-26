import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Report } from "@/lib/db/models";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { reportId, instruction } = await req.json();

    if (!reportId || !instruction) {
      return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
    }

    // 1. Current version nikaalo DB se
    const report = await Report.findById(reportId);
    if (!report) return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });

    const currentContent = report.versions[report.versions.length - 1].content;

    // 2. Python Refiner ko call karo
    const pythonRes = await fetch(`${BACKEND_URL}/refine-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_content: currentContent,
        instruction: instruction
      }),
      signal: AbortSignal.timeout(40000)
    });

    if (!pythonRes.ok) throw new Error("Python Refiner failed");
    
    const pythonData = await pythonRes.json();
    const updatedContent = pythonData.content;

    // 3. New Version save karo (v2, v3...)
    const nextVersion = report.versions.length + 1;
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      {
        $push: { versions: { v: nextVersion, content: updatedContent } },
        $set: { currentVersion: nextVersion }
      },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      updatedReport 
    });

  } catch (error: any) {
    console.error("Refine API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}