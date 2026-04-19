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

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://multi-agent-insight-genarator.onrender.com";

// 2. Ab fetch function mein us variable ko use kar:
    const pythonRes = await fetch(`${BACKEND_URL}/chat`, {
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
          // 🧹 THE CLEANUP FIX: Regex se saare STATUS tags hatao DB mein daalne se pehle
          const cleanFinalAnswer = aiFullAnswer.replace(/\[\[STATUS:.*?\]\]/g, "").trim();
          
          // AI ka saaf final answer DB mein save 
          await Message.create({ workspaceId, role: "ai", content: cleanFinalAnswer });
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