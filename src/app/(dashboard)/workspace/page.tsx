"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Folder, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useRouter } from 'next/navigation';

export default function WorkspacePage() {
  const router = useRouter();
  // Zustand store se data aur functions nikalna
  const { workspaces, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();
  
  // 🚀 FIX: Correctly named the setter function to setLoading
  const [loading, setLoading] = useState(true);

  // 🔄 Purana Logic: Fetch Workspaces from MongoDB
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("/api/workspace");
        const data = await res.json();
        if (data.success) {
          setWorkspaces(data.workspaces);
        }
      } catch (error) {
        console.error("Failed to load workspaces", error);
      } finally {
        setLoading(false); // Now this works perfectly
      }
    };
    fetchWorkspaces();
  }, [setWorkspaces]);

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspace(id); // Zustand store update
    router.push('/documents'); // Chat page par redirect
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-[#E5E7EB] tracking-tight">Workspaces</h1>
          <p className="text-[#9CA3AF] mt-2 text-lg">Select a project environment to start generating insights.</p>
        </div>
        <button 
          onClick={() => router.push('/documents')} // Pehle doc upload fir workspace
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workspaces.map((ws, idx) => (
            <motion.div
              key={ws._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => handleSelectWorkspace(ws._id)}
              className="group relative p-8 rounded-3xl border border-[#1F2937] bg-[#111827] cursor-pointer hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Folder size={28} />
                </div>
                <div className="p-2 rounded-full bg-[#1F2937] text-[#9CA3AF] group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-all">
                  <ArrowRight size={18} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#E5E7EB] mb-2 truncate group-hover:text-white">
                {/* 🚀 BUG FIXED HERE: Fetches 'name' first to match sidebar */}
                {ws.name || ws.title || ws.pdfName || "Untitled Workspace"}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-[#9CA3AF] mb-6">
                <Calendar size={14} />
                <span>Created {new Date(ws.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="pt-6 border-t border-[#1F2937] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563] group-hover:text-blue-500/70 transition-colors">
                  Agent Ready
                </span>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-[#111827] bg-[#1F2937] flex items-center justify-center text-[8px] font-bold text-[#9CA3AF]">
                      A{i}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}