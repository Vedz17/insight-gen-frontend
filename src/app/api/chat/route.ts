import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Message } from "@/lib/db/models";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const { workspaceId, content, role } = body;

    // 1. User ka sawal Database mein save karo
    await Message.create({ workspaceId, role, content });

    // 2. Python backend ko sawal bhejo
    const pythonRes = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: content,
        domain: "General" 
      })
    });

    if (!pythonRes.body) {
      throw new Error("No response body from Python");
    }

    // ==========================================
    // 🚀 THE STREAMING BRIDGE (MAGIC)
    // ==========================================
    // Ye stream Python se data lega, frontend ko fekega aur DB mein bhi save karega!
    
    const stream = new ReadableStream({
      async start(controller) {
        const reader = pythonRes.body?.getReader();
        if (!reader) return;

        let aiFullAnswer = "";
        const decoder = new TextDecoder();

        // 1. Jab tak Python data fek raha hai, use padho
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 2. Raw data ko Text mein badlo aur aage fek do (Frontend ke liye)
          const chunkText = decoder.decode(value, { stream: true });
          aiFullAnswer += chunkText; // DB ke liye text jama karo
          controller.enqueue(value);
        }

        // 3. Stream khatam hone ke baad, AI ka poora answer Database mein save kar do
        try {
          await Message.create({
            workspaceId,
            role: "ai",
            content: aiFullAnswer
          });
        } catch (dbError) {
          console.error("Failed to save AI message to DB:", dbError);
        }

        controller.close();
      }
    });

    // 4. Stream ko Frontend ki taraf bhej do
    return new Response(stream, {
      headers: { "Content-Type": "text/plain" }
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" });
  }
}