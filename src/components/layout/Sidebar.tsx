"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Layers, FileText, BarChart, 
  MessageSquare, BrainCircuit, Trash2, Plus, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { activeWorkspaceId, setActiveWorkspaceId, workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = async () => {
    const { value: wsName } = await Swal.fire({
      title: 'New Project Name',
      input: 'text',
      inputPlaceholder: 'e.g. Semester 6 Audit',
      showCancelButton: true,
      background: '#111827',
      color: '#fff',
      confirmButtonColor: '#2563eb',
      inputValidator: (value) => !value && 'Naam likhna zaroori hai bhai!'
    });

    if (wsName) {
      setIsCreating(true);
      try {
        const res = await fetch("/api/workspace", {
          method: "POST",
          body: JSON.stringify({ name: wsName }),
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        
        if (data.success) {
          await fetchWorkspaces(); 
          setActiveWorkspaceId(data.workspaceId); 
          
          Swal.fire({
            icon: 'success',
            title: 'Workspace Live!',
            background: '#111827',
            color: '#fff',
            timer: 1500,
            showConfirmButton: false
          });
          
          router.push('/documents');
        }
      } catch (err) {
        Swal.fire("Error", "Bann nahi paya!", "error");
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    const result = await Swal.fire({
      title: 'Delete Workspace?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      background: '#111827', 
      color: '#f8fafc', 
    });

    if (result.isConfirmed) {
      await fetch(`/api/workspace?id=${id}`, { method: 'DELETE' });
      if (activeWorkspaceId === id) setActiveWorkspaceId(null);
      await fetchWorkspaces(); 
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Workspace', icon: Layers, href: '/workspace' },
    { name: 'Documents', icon: FileText, href: '/documents' },
    { name: 'Reports', icon: BarChart, href: '/reports' },
    { name: 'Chat', icon: MessageSquare, href: '/chat' },
  ];

  // 🚀 CRITICAL FIX: Enhanced focus kill style
  const noFocusStyle = {
    outline: 'none !important',
    boxShadow: 'none !important',
    border: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <aside 
      style={noFocusStyle}
      className="fixed left-0 top-0 h-screen w-72 bg-[#111827] border-r border-[#1F2937] flex flex-col z-50 select-none"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight italic font-sans">InsightGen</span>
      </div>

      <nav className="px-4 py-2 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            // 🚀 Applied fixed style to remove white ring
            style={noFocusStyle}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none",
              pathname === item.href 
                ? "bg-blue-600/10 text-blue-500 border border-blue-600/20" 
                : "text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white"
            )}
          >
            <item.icon size={18} />
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto mt-6 px-4 custom-scrollbar">
        <div className="flex items-center justify-between px-2 mb-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Recent Projects</p>
          <button 
            onClick={handleCreateWorkspace} 
            disabled={isCreating}
            style={noFocusStyle}
            className="text-blue-500 hover:text-blue-400 transition-transform active:scale-90 outline-none focus:outline-none ring-0 focus:ring-0 focus-visible:outline-none"
          >
            {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>
        
        <div className="space-y-1">
          {workspaces.map((ws) => (
            <div 
              key={ws._id}
              onClick={() => {
                setActiveWorkspaceId(ws._id);
                router.push(`/documents`);
              }}
              style={noFocusStyle}
              className={cn(
                "group flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all cursor-pointer outline-none focus:outline-none ring-0 focus:ring-0",
                activeWorkspaceId === ws._id 
                ? "bg-blue-600/10 text-white border-l-2 border-blue-500" 
                : "text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Layers size={14} className={activeWorkspaceId === ws._id ? "text-blue-400" : "text-slate-500"} />
                <span className="text-xs font-medium truncate">{ws.name || "Untitled Project"}</span>
              </div>
              <Trash2 
                size={12} 
                style={noFocusStyle}
                onClick={(e) => handleDelete(e, ws._id)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity outline-none focus:outline-none" 
              />
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-[#1F2937] bg-[#0B0F19]/50">
        <div className="flex items-center gap-3 p-2">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20 uppercase">
            VB
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">Vedant Bhamare</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}