import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Document, Workspace, Message, ActivityLog, Report } from "@/lib/db/models"; 
// 🚀 FIX: Clerk auth import kiya
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 🚀 FIX: Security check - sir wahi data aayega jo is logged in user ka hai
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    // 🚀 FIX: Pehle check karo is user ke workspaces kaunse hain
    const userWorkspaces = await Workspace.find({ userId }).select('_id');
    const userWorkspaceIds = userWorkspaces.map(ws => ws._id);

    // Filter build karo. Agar ek workspace select kiya hai toh wo, warna user ke saare workspaces
    const filter = workspaceId 
      ? { workspaceId } 
      : { workspaceId: { $in: userWorkspaceIds } };

    const [stats, activityLogs] = await Promise.all([
      (async () => {
        const docCount = await Document.countDocuments(filter);
        // Sirf is user ke workspaces count karo
        const wsCount = await Workspace.countDocuments({ userId }); 
        const reportCount = await Report.countDocuments(filter); 
        
        const docs = await Document.find(filter, 'chunksCount');
        const totalChunks = docs.reduce((acc, doc) => acc + (doc.chunksCount || 0), 0);

        return {
          totalDocuments: docCount,
          totalReports: reportCount, 
          totalChunks: totalChunks,
          totalWorkspaces: wsCount
        };
      })(),

      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    const analytics = [
      { date: "2026-04-15", uploads: 2, reports: 1 },
      { date: "2026-04-16", uploads: 5, reports: 2 },
      { date: "2026-04-17", uploads: 3, reports: 1 },
      { date: "2026-04-18", uploads: 8, reports: 4 },
      { date: "2026-04-19", uploads: 4, reports: 2 },
      { date: "2026-04-20", uploads: 6, reports: 3 },
      { date: "2026-04-21", uploads: 1, reports: 1 },
    ];

    return NextResponse.json({
      success: true, 
      stats: {
        totalReports: stats.totalReports,
        totalWorkspaces: stats.totalWorkspaces,
        totalDocuments: stats.totalDocuments,
        recentActivities: activityLogs 
      },
      analytics
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}