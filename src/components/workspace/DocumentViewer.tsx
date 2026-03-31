import { UploadCloud, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocumentViewer() {
  return (
    <main className="flex-1 flex flex-col border-r border-slate-200 bg-slate-50">
      
      {/* Header of Workspace */}
      <header className="h-16 border-b border-slate-200 flex items-center px-8 bg-white shadow-sm z-10">
        <h2 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
          <FileText className="text-slate-400" size={20} />
          Document Workspace
        </h2>
      </header>

      {/* Upload Dropzone Area */}
      <div className="flex-1 p-8 flex items-center justify-center relative overflow-hidden">
        
        {/* Background Decorative Blob (Optional SaaS flair) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>

        {/* The Actual Dropzone Card */}
        <div className="w-full max-w-lg p-12 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl hover:bg-white hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud size={32} />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload your Document</h3>
          
          <p className="text-sm text-slate-500 text-center mb-6 px-4">
            Drag and drop your PDF report here, or click to browse. We will extract and index it automatically using Pinecone.
          </p>
          
          <Button variant="outline" className="border-slate-300 pointer-events-none font-medium">
            Browse Files
          </Button>

        </div>
      </div>
    </main>
  );
}