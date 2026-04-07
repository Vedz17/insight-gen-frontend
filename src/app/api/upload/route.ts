 import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Frontend se FormData aayega, jisme file chupi hogi
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ success: false, error: "File nahi mili!" });
    }

    console.log("🚀 Forwarding PDF to Python Backend...");

    // 2. Python (FastAPI) ko file pass kar do
    const pythonRes = await fetch("http://127.0.0.1:8000/upload-pdf/", {
      method: "POST",
      body: formData, // Notice: No "Content-Type" header here, Fetch handles boundaries automatically
    });

    const data = await pythonRes.json();

    if (pythonRes.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: data.detail });
    }

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}