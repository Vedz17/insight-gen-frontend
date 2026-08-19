import { NextResponse } from "next/server";

export const maxDuration = 60;

const BACKEND_URL =
  process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      workspaceId,
      criterionId,
      sectionName
    } = body;

    if (!workspaceId || !criterionId || !sectionName) {
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

    const pythonRes = await fetch(
      `${BACKEND_URL}/generate-section`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          criterion_id: criterionId,
          section_name: sectionName
        }),
        signal: AbortSignal.timeout(30000)
      }
    );

    if (!pythonRes.ok) {
      const errorText = await pythonRes.text();

      throw new Error(
        `AI Engine Error: ${errorText}`
      );
    }

    const pythonData = await pythonRes.json();

    if (!pythonData.success) {
      throw new Error(
        pythonData.error || "Section generation failed"
      );
    }

    return NextResponse.json({
      success: true,
      sectionName: pythonData.section_name,
      content: pythonData.content,
      reviewStatus: pythonData.review_status,
      feedback: pythonData.feedback,
      writerAttempts: pythonData.writer_attempts
    });

  } catch (error: any) {
    console.error(
      "Section Generation Error:",
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