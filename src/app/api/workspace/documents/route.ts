import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Document, ActivityLog } from "@/lib/db/models"; 

// 1. GET: Fetch all documents for a workspace
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "Workspace ID is required" }, { status: 400 });
    }

    const documents = await Document.find({ workspaceId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      documents
    });

  } catch (error: any) {
    console.error("Fetch Documents Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. DELETE: Remove a document and log the activity
export async function DELETE(req: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ success: false, error: "Document ID is required" }, { status: 400 });
    }

    // Find document first to get details for the activity log
    const docToDelete = await Document.findById(documentId);
    
    if (!docToDelete) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    const docName = docToDelete.name;
    const workspaceId = docToDelete.workspaceId;

    // Actual deletion
    await Document.findByIdAndDelete(documentId);

    // Create an Activity Log entry for the Dashboard
    try {
      await ActivityLog.create({
        workspaceId: workspaceId,
        title: `Removed: ${docName}`,
        action: "DELETE",
        createdAt: new Date()
      });
    } catch (logError) {
      console.error("Activity Log Failed:", logError);
      // We don't block the response if logging fails
    }

    // 🚀 THE FIX: Sending back valid JSON so frontend doesn't crash
    return NextResponse.json({ 
      success: true, 
      message: "Document deleted successfully" 
    });

  } catch (error: any) {
    console.error("Delete Document Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}