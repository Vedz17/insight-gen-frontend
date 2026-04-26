"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Search, Plus, MoreVertical, Eye, Trash2, 
  ChevronDown, CheckCircle2, Database, CloudUpload, 
  Scissors, Download, ArrowRight, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import Swal from 'sweetalert2';

export default function DocumentManager() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // 🔄 Fetch Documents from DB
  const fetchDocuments = useCallback(async () => {
    if (!activeWorkspaceId) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`/api/workspace/documents?workspaceId=${activeWorkspaceId}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
        if (data.documents.length > 0) setSelectedDoc(data.documents[0]);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // 📤 Upload Logic
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeWorkspaceId) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Pehle ek Workspace select karo bhai!', background: '#111827', color: '#fff' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspaceId", activeWorkspaceId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: 'File Indexed!', showConfirmButton: false, timer: 3000, background: '#111827', color: '#fff' });
        fetchDocuments(); // Refresh list
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message, background: '#111827', color: '#fff' });
    } finally {
      setIsUploading(false);
    }
  };

  // 🗑️ Delete Logic with Premium Alert
  const handleDelete = async (docId: string, docName: string) => {
    const result = await Swal.fire({
      title: 'Delete Document?',
      text: `Are you sure you want to delete "${docName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Tailwind red-500
      cancelButtonColor: '#374151', // Tailwind gray-700
      confirmButtonText: 'Yes, delete it',
      background: '#111827',
      color: '#f8fafc',
      customClass: {
        popup: 'border border-gray-800 rounded-2xl',
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/workspace/documents?documentId=${docId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        
        if (data.success) {
          Swal.fire({ 
            title: 'Deleted!', 
            text: 'Document has been removed.', 
            icon: 'success', 
            background: '#111827', 
            color: '#f8fafc',
            confirmButtonColor: '#2563eb' 
          });
          
          if (selectedDoc?._id === docId) setSelectedDoc(null); // Clear side panel if deleted doc was active
          fetchDocuments(); // Refresh list
        } else {
          throw new Error(data.error || 'Deletion failed');
        }
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#111827', color: '#fff' });
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 1. TOP SECTION */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#E5E7EB]">Documents</h1>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
            <input type="text" placeholder="Search..." className="bg-[#111827] border border-[#1F2937] text-sm rounded-xl py-2.5 pl-10 pr-4 w-64 outline-none focus:border-blue-500/50" />
          </div>
          <div className="relative">
            <input type="file" id="file-upload" className="hidden" accept=".pdf" onChange={handleUpload} disabled={isUploading} />
            <label htmlFor="file-upload" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              {isUploading ? "Processing..." : "Upload Document"}
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* 2. UPLOAD & PROCESSING PREVIEW */}
          <div className="grid grid-cols-2 gap-6">
            <label htmlFor="file-upload" className="border-2 border-dashed border-[#1F2937] rounded-3xl p-8 flex flex-col items-center justify-center bg-[#111827]/30 hover:border-blue-500/30 transition-all cursor-pointer group">
              <CloudUpload className="text-[#4B5563] group-hover:text-blue-500 mb-2" size={32} />
              <p className="text-[#E5E7EB] font-bold">Drag & drop PDF files</p>
              <p className="text-[#4B5563] text-xs">Maximum 10MB (PDF only)</p>
            </label>

            {isUploading && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 flex flex-col justify-center">
                 <div className="flex justify-between items-center mb-4 text-blue-500 animate-pulse">
                    <span className="text-sm font-bold">Indexing PDF...</span>
                    <Loader2 className="animate-spin" size={16}/>
                 </div>
                 <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 10 }} className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                 </div>
              </div>
            )}
          </div>

          {/* 3. TABLE DATA */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-3xl overflow-hidden shadow-2xl">
            {/* Visual Pipeline Header */}
            <div className="p-6 border-b border-[#1F2937] flex items-center justify-center gap-8 bg-[#111827]/50 overflow-x-auto">
               {[{ icon: CloudUpload, label: "Upload" }, { icon: FileText, label: "Extract" }, { icon: Scissors, label: "Chunk" }, { icon: Search, label: "Embed" }, { icon: Database, label: "Store" }].map((step, i, arr) => (
                 <div key={i} className="flex items-center gap-4 shrink-0">
                   <div className="flex flex-col items-center gap-1.5">
                      {/* 🚀 FIX: Made all pipeline icons permanently blue instead of conditionally gray */}
                      <div className="p-2 rounded-lg bg-blue-600/20 text-blue-500"><step.icon size={16}/></div>
                      <span className="text-[9px] font-bold text-[#4B5563] uppercase tracking-tighter">{step.label}</span>
                   </div>
                   {i !== arr.length - 1 && <ArrowRight size={14} className="text-[#1F2937]" />}
                 </div>
               ))}
            </div>
            
            <table className="w-full text-left">
              <thead className="bg-[#111827] text-[#4B5563] text-[10px] font-bold uppercase tracking-widest border-b border-[#1F2937]">
                <tr>
                  <th className="px-6 py-4">Document Name</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-10"><Loader2 className="animate-spin inline mr-2 text-blue-500"/> Loading documents...</td></tr>
                ) : documents.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-[#4B5563]">No documents found in this workspace.</td></tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc._id} onClick={() => setSelectedDoc(doc)} className={`group cursor-pointer transition-colors ${selectedDoc?._id === doc._id ? "bg-blue-500/[0.05]" : "hover:bg-blue-500/[0.02]"}`}>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <FileText size={18} className="text-red-500 shrink-0"/>
                        <span className="text-sm font-semibold text-[#E5E7EB] truncate max-w-xs">{doc.name}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#9CA3AF]">{doc.size}</td>
                      <td className="px-6 py-4 font-bold text-[10px] uppercase text-green-500">{doc.status}</td>
                      <td className="px-6 py-4 text-right">
                        {/* 🚀 FIX: Made the Trash icon functional and added stopPropagation so row doesn't get clicked */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc._id, doc.name); }}
                          className="p-2 text-[#4B5563] hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. RIGHT PANEL: DETAILS */}
        <div className="w-80 bg-[#111827] border border-[#1F2937] rounded-3xl p-6 overflow-y-auto hidden xl:block shadow-2xl">
           <h3 className="font-bold text-[#E5E7EB] mb-6 border-b border-[#1F2937] pb-4">Document details</h3>
           {selectedDoc ? (
             <div className="space-y-6">
                <div>
                   <p className="text-sm font-bold text-[#E5E7EB] break-all">{selectedDoc.name}</p>
                   <p className="text-xs text-[#4B5563] mt-1">Chunks indexed: {selectedDoc.chunksCount || "Pending"}</p>
                </div>
                <div className="aspect-[3/4] bg-[#0B0F19] rounded-xl border border-[#1F2937] flex items-center justify-center text-[10px] text-[#4B5563] p-4 text-center">
                   AI Indexing Status: <br/> {selectedDoc.status}
                </div>
                <div className="pt-4 border-t border-[#1F2937] space-y-3">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Processing logs</p>
                   {['Text extracted', 'Embeddings created', 'Stored in vector DB'].map((log, i) => (
                     <div key={i} className="flex items-center gap-2 text-[10px] text-[#9CA3AF]"><CheckCircle2 size={12} className="text-green-500"/> {log}</div>
                   ))}
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center text-[#4B5563]">
                <FileText size={40} className="mb-4 opacity-20" />
                <p className="text-xs">Select a file to see metadata</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}