import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Document, ActivityLog, Workspace } from "@/lib/db/models"; // 🚀 FIX: Added Workspace
import { auth } from '@clerk/nextjs/server'; // 🚀 FIX: Added Clerk Auth

// 1. GET: Fetch all documents for a workspace
export async function GET(req: NextRequest) {
  try {
    // 🚀 FIX: Get User ID
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: "Workspace ID is required" }, { status: 400 });
    }

    // 🚀 FIX: Verify Ownership - Check if this workspace actually belongs to this user
    const workspaceOwned = await Workspace.findOne({ _id: workspaceId, userId });
    if (!workspaceOwned) {
      return NextResponse.json({ success: false, error: "Forbidden: You don't own this workspace" }, { status: 403 });
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
    // 🚀 FIX: Get User ID
    const { userId } = await  auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ success: false, error: "Document ID is required" }, { status: 400 });
    }

    // Find document first
    const docToDelete = await Document.findById(documentId);
    if (!docToDelete) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    // 🚀 FIX: Verify Ownership of the Workspace where this document lives
    const workspaceId = docToDelete.workspaceId;
    const workspaceOwned = await Workspace.findOne({ _id: workspaceId, userId });
    if (!workspaceOwned) {
      return NextResponse.json({ success: false, error: "Forbidden: Cannot delete from someone else's workspace" }, { status: 403 });
    }

    const docName = docToDelete.name;

    // Actual deletion
    await Document.findByIdAndDelete(documentId);

    try {
      await ActivityLog.create({
        workspaceId: workspaceId,
        title: `Removed: ${docName}`,
        action: "DELETE",
        createdAt: new Date()
      });
    } catch (logError) {
      console.error("Activity Log Failed:", logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Document deleted successfully" 
    });

  } catch (error: any) {
    console.error("Delete Document Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}