import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Workspace, Message, ActivityLog } from "@/lib/db/models";
// 🚀 FIX: Import Clerk Auth hook for Server-Side APIs
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // 1. Get the current user ID securely from Clerk
    const { userId } = await auth();
    
    // Agar koi bina login ke direct API hit kare, toh bhaga do
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    
    //  FIX: Ab yahan filter laga diya. Sirf is specific user ke workspaces aayenge!
    const workspaces = await Workspace.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, workspaces });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch workspaces" });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Check Auth first
    const { userId } =  await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body; 

    await connectToDB();

    // 2. Create Workspace aur asil userId daalo
    const newWorkspace = await Workspace.create({
      name: name || "New Project Workspace",
      userId: userId, // FIX: 'guest_user' gaya kachre ke dabbe mein!
    });

    await ActivityLog.create({
      workspaceId: newWorkspace._id,
      type: 'chat',
      title: `Created workspace: ${newWorkspace.name}`
    });

    return NextResponse.json({ 
      success: true, 
      workspaceId: newWorkspace._id,
      name: newWorkspace.name
    }, { status: 201 });

  } catch (error: any) {
    console.error("Workspace creation failed:", error);
    return NextResponse.json({ success: false, error: "Failed to create workspace" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // Auth check here too just for safety
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ success: true, message: "Workspace renamed successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update workspace" });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, error: "ID missing" });

    //  FIX: Security Layer - Pehle verify karo ki ye workspace is bande ka hai bhi ya nahi
    const workspaceToVerify = await Workspace.findOne({ _id: id, userId });
    if (!workspaceToVerify) {
      return NextResponse.json({ success: false, error: "Action not allowed or Not Found" }, { status: 403 });
    }

    // Ab safely delete karo
    await Workspace.findByIdAndDelete(id);
    await Message.deleteMany({ workspaceId: id });

    return NextResponse.json({ success: true, message: "Chat deleted!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete" });
  }
}