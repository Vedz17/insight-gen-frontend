import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Message, ActivityLog } from "@/lib/db/models";

export const dynamic = "force-dynamic";

// Python FastAPI ka URL (ensure your FastAPI is running here)
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const { workspaceId, content, role } = body;

    if (!workspaceId || !content) {
      return NextResponse.json({ success: false, error: "Missing workspaceId or content" }, { status: 400 });
    }

    // 🧠 1. FETCH CONTEXT HISTORY (Latest 4 messages)
    const historyDocs = await Message.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(4);
    
    historyDocs.reverse(); 

    const chatHistory = historyDocs.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 💾 2. SAVE USER MESSAGE TO DB
    await Message.create({ workspaceId, role, content });

    // 📊 3. LOG ACTIVITY FOR DASHBOARD
    await ActivityLog.create({
      workspaceId,
      type: 'chat',
      title: `Query: "${content.substring(0, 40)}..."`,
      createdAt: new Date()
    });

    // 📡 4. CALL PYTHON ENGINE (LangGraph)
    console.log(`📡 Streaming from Python for Workspace: ${workspaceId}`);
    
    const pythonRes = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: content,
        domain: "NAAC Analyst",
        chat_history: chatHistory,
        workspace_id: workspaceId // Python expects snake_case
      })
    });

    if (!pythonRes.ok) {
      return NextResponse.json({ success: false, error: "AI Engine is offline" }, { status: 502 });
    }

    // 🚀 5. THE STREAMING BRIDGE
    const stream = new ReadableStream({
      async start(controller) {
        const reader = pythonRes.body?.getReader();
        if (!reader) return;

        let aiFullAnswer = "";
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunkText = decoder.decode(value, { stream: true });
            
            // We enqueue the raw value so frontend gets the [[STATUS:...]] tags
            controller.enqueue(value);
            
            // Build the full answer but ignore status tags for DB storage
            if (!chunkText.includes("[[STATUS:")) {
              aiFullAnswer += chunkText;
            }
          }

          // 💾 SAVE CLEAN AI RESPONSE TO DB AFTER STREAM ENDS
          if (aiFullAnswer.trim().length > 0) {
            await Message.create({ 
              workspaceId, 
              role: "ai", 
              content: aiFullAnswer.trim() 
            });
          }
        } catch (err) {
          console.error("Stream Error:", err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, { 
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      } 
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}