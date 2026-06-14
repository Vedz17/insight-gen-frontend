import mongoose from "mongoose";

// 1. WORKSPACE: 🚀 FIX: userId added
const WorkspaceSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// 2. DOCUMENT:
const DocumentSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  name: { type: String, required: true },
  size: { type: String },
  chunksCount: { type: Number, default: 0 }, 
  status: { type: String, enum: ['Processing', 'Indexed', 'Failed'], default: 'Processing' },
  createdAt: { type: Date, default: Date.now },
});

// 3. MESSAGE: 
const MessageSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  role: { type: String, required: true }, 
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// 4. ACTIVITY LOG: 
const ActivityLogSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  type: { type: String, enum: ['upload', 'report', 'chat'], required: true },
  title: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

export const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", WorkspaceSchema);
export const Document = mongoose.models.Document || mongoose.model("Document", DocumentSchema);
export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);

const versionSchema = new mongoose.Schema({
  v: { type: Number, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  criterionId: { type: Number, required: true },
  title: { type: String, required: true },
  versions: [versionSchema], 
  currentVersion: { type: Number, default: 1 },
  status: { type: String, default: 'Generated' },
  size: { type: String, default: '0 KB' },
}, { timestamps: true });

export const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);