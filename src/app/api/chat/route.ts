import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Message } from "@/lib/db/models";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const { workspaceId, content, role } = body;

    // 1. Naya message DB mein save karo
    await Message.create({ workspaceId, role, content });

    // 🧠 2. MEMORY LOGIC: Puraani chat history uthao (Last 6 messages context ke liye)
    const historyDocs = await Message.find({ workspaceId })
                                   .sort({ createdAt: -1 })
                                   .limit(6);
    
    // Purane messages chronological order mein lagao (Puraana pehle, naya baad mein)
    historyDocs.reverse(); 

    const chatHistory = historyDocs.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 3. Python backend ko sawal + History dono bhejo
    const pythonRes = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: content,
        domain: "General",
        chat_history: chatHistory, 
        workspace_id: workspaceId// 🧠 Ye rha tera Memory bridge!
      })
    });

    if (!pythonRes.body) throw new Error("No response body from Python");

    // ==========================================
    // 🚀 THE STREAMING BRIDGE
    // ==========================================
    const stream = new ReadableStream({
      async start(controller) {
        const reader = pythonRes.body?.getReader();
        if (!reader) return;

        let aiFullAnswer = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          aiFullAnswer += chunkText; 
          controller.enqueue(value);
        }

        try {
          // AI ka final answer DB mein save karo
          await Message.create({ workspaceId, role: "ai", content: aiFullAnswer });
        } catch (dbError) {
          console.error("Failed to save AI message:", dbError);
        }
        controller.close();
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain" } });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" });
  }
}