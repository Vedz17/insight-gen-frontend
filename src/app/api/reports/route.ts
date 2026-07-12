import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db/connect";
import { Report, ActivityLog, Document } from "@/lib/db/models";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const body = await req.json();

    const {
      workspaceId,
      criterionId,
      title,
      content
    } = body;

    if (!workspaceId || !criterionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields"
        },
        {
          status: 400
        }
      );
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Generated report content is required"
        },
        {
          status: 400
        }
      );
    }

    // Check whether the workspace has uploaded documents
    const docCount = await Document.countDocuments({
      workspaceId
    });

    if (docCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: (
            "No documents found in this workspace. " +
            "Please upload PDFs first."
          )
        },
        {
          status: 400
        }
      );
    }

    const generatedContent = content.trim();

    console.log(
      `Saving generated report for Workspace: ${workspaceId}, ` +
      `Criterion: ${criterionId}`
    );

    // Save complete generated report to MongoDB
    // Existing versioning structure is preserved
    const newReport = await Report.create({
      workspaceId,
      criterionId,
      title:
        title ||
        `NAAC Criterion ${criterionId} Summary`,
      versions: [
        {
          v: 1,
          content: generatedContent
        }
      ],
      currentVersion: 1,
      size: `${
        (
          Buffer.byteLength(
            generatedContent,
            "utf8"
          ) / 1024
        ).toFixed(1)
      } KB`
    });

    // Preserve existing dashboard activity logging
    await ActivityLog.create({
      workspaceId,
      type: "report",
      title: `Generated ${
        title ||
        `NAAC Criterion ${criterionId} Summary`
      }`
    });

    // Preserve existing frontend redirect contract
    return NextResponse.json({
      success: true,
      reportId: newReport._id.toString()
    });

  } catch (error: any) {
    console.error(
      "Report Save Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      {
        status: 500
      }
    );
  }
}