import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Report } from "@/lib/db/models";

export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "Workspace ID required" }, { status: 400 });
    }

    // Latest reports pehle dikhane ke liye sort by createdAt
    const reports = await Report.find({ workspaceId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch list" }, { status: 500 });
  }
}
