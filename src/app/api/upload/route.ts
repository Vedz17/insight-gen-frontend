import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const workspaceId = formData.get("workspaceId"); 

    if (!file || !workspaceId) {
      return NextResponse.json({ success: false, error: "File or Workspace ID missing from frontend!" });
    }

    console.log(`🚀 Forwarding PDF for Workspace: ${workspaceId} to Python Backend...`);

    // 🚀 THE FIX: Python ko bhejne ke liye naya (fresh) FormData banao
    const pythonFormData = new FormData();
    pythonFormData.append("file", file);
    pythonFormData.append("workspaceId", workspaceId);

    // 🚀 THE FIX: Localhost hata kar Render ka URL dynamic banao
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://multi-agent-insight-genarator.onrender.com";

    const pythonRes = await fetch(`${BACKEND_URL}/upload-pdf/`, {
      method: "POST",
      body: pythonFormData, 
    });

    const data = await pythonRes.json();

    if (pythonRes.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      // 🚀 THE FIX: Agar 422 error aaye toh usko String mein convert karo taaki padh sakein
      return NextResponse.json({ success: false, error: JSON.stringify(data.detail) });
    }

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}