import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Message } from "@/lib/db/models";

export async function GET(req: Request) {
  try {
    await connectToDB();
    
    // URL se ID nikalo
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    // Agar ID nahi hai (matlab New Workspace hai), toh khali array bhej do
    if (!workspaceId) {
      return NextResponse.json({ success: true, history: [] });
    }

    // Agar ID hai, toh sirf us specific chat ke messages laao
    const history = await Message.find({ workspaceId }).sort({ createdAt: 1 });

    return NextResponse.json({ success: true, history, workspaceId });

  } catch (error) {
    return NextResponse.json({ success: false, error: "History fetch failed" });
  }
}