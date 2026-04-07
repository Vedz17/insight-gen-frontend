import mongoose from "mongoose";

// 1. Workspace Schema & Model
const WorkspaceSchema = new mongoose.Schema({
  pdfName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", WorkspaceSchema);

// 2. Message Schema & Model
const MessageSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  role: { type: String, required: true }, // "user" or "ai"
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);