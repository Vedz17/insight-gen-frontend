import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Document, Workspace, ActivityLog, Report } from "@/lib/db/models"; 
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 🛡️ SECURITY: Get current logged-in user
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get("workspaceId");

    // 1. Fetch ALL workspaces belonging to THIS user
    const userWorkspaces = await Workspace.find({ userId }).select('_id');
    const userWorkspaceIds = userWorkspaces.map(ws => ws._id);
    const userWorkspaceIdsStr = userWorkspaceIds.map(id => id.toString()); // For string-based refs

    // 🚀 Check if user is completely new (0 workspaces)
    if (userWorkspaceIds.length === 0) {
      return NextResponse.json({
        success: true,
        stats: { totalReports: 0, totalWorkspaces: 0, totalDocuments: 0, recentActivities: [] },
        analytics: [] // Returns empty to trigger frontend "Blank State" gracefully
      });
    }

    // Filter build karo. Agar UI se specific workspace bheja hai toh wo, warna user ke saare.
    const objectIdFilter = workspaceIdParam ? { workspaceId: workspaceIdParam } : { workspaceId: { $in: userWorkspaceIds } };
    const stringIdFilter = workspaceIdParam ? { workspaceId: workspaceIdParam } : { workspaceId: { $in: userWorkspaceIdsStr } };

    // 2. Parallel Database Queries for maximum speed
    const [stats, activityLogs, recentLogsForAnalytics] = await Promise.all([
      (async () => {
        const docCount = await Document.countDocuments(objectIdFilter);
        const wsCount = await Workspace.countDocuments({ userId }); 
        const reportCount = await Report.countDocuments(stringIdFilter); // Report schema uses string for workspaceId
        
        return {
          totalDocuments: docCount,
          totalReports: reportCount, 
          totalWorkspaces: wsCount
        };
      })(),

      // Fetch Recent Activity for the activity list UI
      ActivityLog.find(objectIdFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Fetch last 7 days logs for the Chart Analytics
      (async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return ActivityLog.find({
          ...objectIdFilter,
          createdAt: { $gte: sevenDaysAgo }
        }).select('type createdAt').lean();
      })()
    ]);

    // 3. 🧠 SMART ANALYTICS BUILDER (No hardcoded data!)
    // Generate an array of the last 7 dates (e.g., ['2026-06-18', '2026-06-19', ...])
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    // Initialize map with 0s so UI graph doesn't break on empty days
    const analyticsMap = last7Days.reduce((acc: any, date: string) => {
      acc[date] = { date, uploads: 0, reports: 0 };
      return acc;
    }, {});

    // Populate actual data from ActivityLog
    recentLogsForAnalytics.forEach((log: any) => {
      const dateStr = log.createdAt.toISOString().split('T')[0];
      if (analyticsMap[dateStr]) {
        if (log.type === 'upload') analyticsMap[dateStr].uploads += 1;
        if (log.type === 'report') analyticsMap[dateStr].reports += 1;
      }
    });

    const analytics = Object.values(analyticsMap); // Convert map back to array for Recharts

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