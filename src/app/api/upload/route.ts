import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Document, ActivityLog } from "@/lib/db/models";

// Single Source of Truth for Backend URL
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const workspaceId = formData.get("workspaceId") as string;

    if (!file || !workspaceId) {
      return NextResponse.json({ success: false, error: "File or Workspace ID missing!" }, { status: 400 });
    }

    // 1. PYTHON BACKEND FORWARDING (FastAPI)
    const pythonFormData = new FormData();
    pythonFormData.append("file", file);
    pythonFormData.append("workspaceId", workspaceId);

    console.log(`🚀 Processing PDF for Workspace: ${workspaceId}...`);
    console.log(`📡 Sending to Python Backend at: ${BACKEND_URL}/upload-pdf/`);
    
    let pythonRes;
    try {
      // 🚀 THE FIX: Separate try-catch specifically for the connection bridge
      pythonRes = await fetch(`${BACKEND_URL}/upload-pdf/`, {
        method: "POST",
        body: pythonFormData,
        // Wait maximum 60 seconds for Python to process and return chunks
        signal: AbortSignal.timeout(60000), 
      });
    } catch (networkError: any) {
      console.error("🚨 Python Connection Refused! Is uvicorn running?", networkError.message);
      return NextResponse.json({ 
        success: false, 
        error: "Backend bridge broken. Check if Python terminal is running on port 8000." 
      }, { status: 503 });
    }

    // Handle Python returning 422 or 500 errors
    if (!pythonRes.ok) {
      let errorDetail = "Unknown Python Error";
      try {
        const errData = await pythonRes.json();
        errorDetail = JSON.stringify(errData.detail || errData);
      } catch (e) {
        errorDetail = await pythonRes.text();
      }
      console.error("❌ Python responded with error:", errorDetail);
      return NextResponse.json({ 
        success: false, 
        error: `Python Backend Error: ${errorDetail}` 
      }, { status: 500 });
    }

    const pythonData = await pythonRes.json();
    console.log(`✅ Python processing success! Chunks created: ${pythonData.chunks_count}`);

    // 2. MONGODB TRACKING (Dashboard Logic)
    await connectToDB();

    // Create Document Record
    const newDoc = await Document.create({
      workspaceId,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      status: 'Indexed',
      chunksCount: pythonData.chunks_count || 0 // Assuming Python sends this back
    });

    // Create Activity Log for Dashboard
    await ActivityLog.create({
      workspaceId,
      type: 'upload',
      title: `Uploaded ${file.name}`
    });

    return NextResponse.json({ 
      success: true, 
      message: "File processed and tracked successfully",
      docId: newDoc._id 
    });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}