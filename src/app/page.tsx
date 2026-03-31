import { Sidebar } from "@/components/layout/Sidebar";
import { DocumentViewer } from "@/components/workspace/DocumentViewer";

export default function Home() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Left Panel: Navigation */}
      <Sidebar />

      {/* Middle Panel: PDF Upload Area */}
      <DocumentViewer />

      {/* Right Panel: AI Chat */}
      <section className="w-112.5 bg-white flex items-center justify-center text-slate-400 border-l border-slate-200 shadow-[-4px_0_24px_-16px_rgba(0,0,0,0.1)] z-20">
        <p>AI Agent Terminal Loading...</p>
      </section>

    </div>
  );
}