"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, MessageSquare, Trash2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';

type Workspace = {
  _id: string;
  pdfName: string;
  createdAt: string; 
};

export function Sidebar() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const router = useRouter();

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
      }
    };
    fetchWorkspaces();
  }, []);

  // 🗑️ SEXY DELETE FUNCTION (SweetAlert2)
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 

    const result = await Swal.fire({
      title: 'Delete this chat?',
      text: "You won't be able to recover this conversation!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#475569', 
      confirmButtonText: 'Yes, delete it!',
      background: '#0F1117', 
      color: '#f8fafc', 
      customClass: {
        popup: 'border border-slate-800 rounded-xl'
      }
    });

    if (result.isConfirmed) {
      setWorkspaces((prev) => prev.filter((ws) => ws._id !== id));

      try {
        await fetch(`/api/workspace?id=${id}`, { method: 'DELETE' });
        
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Chat deleted successfully',
          showConfirmButton: false,
          timer: 3000,
          background: '#0F1117',
          color: '#f8fafc',
          iconColor: '#3b82f6' 
        });

        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get("workspaceId") === id) {
          router.push("/");
          setTimeout(() => window.location.reload(), 100);
        }
      } catch (err) {
        console.error("Delete failed");
        Swal.fire({
          toast: true, position: 'bottom-end', icon: 'error', 
          title: 'Failed to delete', showConfirmButton: false, timer: 3000
        });
      }
    }
  };

 const handleNewChat = () => {
    // Ye direct URL change karke page reload karega taaki fresh state aaye
    window.location.href = "/"; 
  };

  const loadChat = (id: string) => {
    window.location.href = `/?workspaceId=${id}`; 
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="w-72 bg-[#0F1117] text-slate-300 flex flex-col border-r border-slate-800 h-screen overflow-hidden">
      
      <div className="p-6 pb-2">
        <div className="text-xl font-bold text-white flex items-center gap-2 mb-8 truncate">
          <BrainCircuit className="text-blue-500 shrink-0" />
          Insight Generator
        </div>
        
        <Button onClick={handleNewChat} className="w-full bg-white text-black hover:bg-slate-200 font-medium mb-4 shadow-sm transition-all">
          + New Workspace
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 px-2 mt-2">
          Recent Chats
        </p>
        
        {workspaces.map((ws) => (
          <div 
            key={ws._id}
            onClick={() => loadChat(ws._id)}
            className="group relative flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-[#1A1D27] text-slate-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare size={15} className="shrink-0 text-slate-500 group-hover:text-blue-400 transition-colors" />
              <div className="flex flex-col items-start overflow-hidden">
                <span className="text-sm font-medium truncate w-full text-left">{ws.pdfName}</span>
                <span className="text-[10px] text-slate-500">{formatDate(ws.createdAt)}</span>
              </div>
            </div>

            <button 
              onClick={(e) => handleDelete(e, ws._id)} 
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-md transition-all shrink-0"
              title="Delete Chat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        {workspaces.length === 0 && (
          <p className="text-xs text-slate-600 px-2 italic text-center mt-4">No recent chats found.</p>
        )}
      </div>
      
      <div className="mt-auto p-4 border-t border-slate-800 flex items-center gap-3 bg-[#0F1117]">
        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
          VB
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm text-white font-medium truncate">
            Vedant Bhamare
          </p>
          <p className="text-[10px] text-slate-500 truncate uppercase tracking-tight">
            Free Tier (100 Credits)
          </p>
        </div>
      </div>

    </aside>
  );
}