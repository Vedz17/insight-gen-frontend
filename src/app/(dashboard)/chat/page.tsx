"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Cpu, CheckCircle2, ShieldCheck, Download, 
  Layers, ChevronDown, Search 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import ReactMarkdown from 'react-markdown';
import Swal from 'sweetalert2';

export default function ChatArena() {
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', content: "Hello Vedant! I am the **InsightGen Analyst**. Select your workspace above to start the multi-agent audit." }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [agentStatus, setAgentStatus] = useState("Idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const currentWS = workspaces.find(ws => ws._id === activeWorkspaceId);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    if (!activeWorkspaceId) {
      Swal.fire("Workspace Required", "Pehle workspace select karle bhai!", "warning");
      return;
    }

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: activeWorkspaceId, content: input, role: 'user' })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: "" }]);

      while (true) {
        const { done, value } = await reader?.read()!;
        if (done) break;
        const chunk = decoder.decode(value);
        
        // 🚀 STATUS PARSER: Pakadta hai [[STATUS:...]] tags ko
        if (chunk.includes("[[STATUS:")) {
          const statusMatch = chunk.match(/\[\[STATUS:(.*?)\]\]/);
          if (statusMatch) setAgentStatus(statusMatch[1]);
          continue; 
        }

        aiContent += chunk;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: aiContent } : m));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
      setAgentStatus("Idle");
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden">
      
      {/* 🟢 CENTER: CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-[#111827] border border-[#1F2937] rounded-[2rem] shadow-2xl overflow-hidden relative">
        <div className="p-5 border-b border-[#1F2937] bg-[#111827]/80 backdrop-blur-md flex justify-between items-center px-10">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isThinking ? 'bg-blue-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
                <span className="text-[10px] font-black text-[#E5E7EB] uppercase tracking-[0.2em]">
                  {isThinking ? agentStatus : "System Operational"}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-[#1F2937]" />
              <div className="relative">
                <select 
                  value={activeWorkspaceId || ""}
                  onChange={(e) => setActiveWorkspace(e.target.value)}
                  className="bg-[#0B0F19] border border-[#1F2937] text-blue-400 text-xs font-bold py-1.5 pl-4 pr-10 rounded-full appearance-none outline-none cursor-pointer"
                >
                  <option value="" disabled>Select Workspace</option>
                  {workspaces.map(ws => <option key={ws._id} value={ws._id}>{ws.name || ws.title}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
           </div>
           <button className="text-[10px] text-slate-500 hover:text-white font-bold flex items-center gap-1.5 transition-all">
              <Download size={12} /> Export JSON
           </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${msg.role === 'user' ? 'bg-[#1F2937]' : 'bg-blue-600'} text-white`}>
                {msg.role === 'user' ? <User size={24} /> : <Bot size={24} />}
              </div>
              <div className={`max-w-[75%] p-6 rounded-[2rem] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#0B0F19] text-[#E5E7EB] border border-[#1F2937] rounded-tl-none'}`}>
                <div className="prose prose-invert prose-sm max-w-none font-medium">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-[#0B0F19]/50 border-t border-[#1F2937]">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
             <div className="flex-1 relative flex items-center">
                <Search className="absolute left-6 text-slate-600" size={18} />
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Ask ${currentWS?.name || 'InsightGen'} anything...`}
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-[1.5rem] py-5 pl-14 pr-6 text-sm outline-none focus:border-blue-500 transition-all text-[#E5E7EB]"
                />
             </div>
             <button onClick={handleSend} disabled={isThinking} className="h-14 w-14 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-lg active:scale-95 disabled:bg-slate-800">
                <Send size={22} />
             </button>
          </div>
        </div>
      </div>

      {/* 🛡️ RIGHT SIDE: AGENT ORCHESTRATION (THE MONITOR) */}
      <div className="w-80 hidden xl:flex flex-col bg-[#111827] border border-[#1F2937] rounded-[2rem] p-8 space-y-10 shadow-xl">
        <div className="space-y-1">
          <h3 className="font-black text-[#E5E7EB] flex items-center gap-2 text-[11px] uppercase tracking-[0.25em]">
            <Layers size={16} className="text-blue-500" /> System Metrics
          </h3>
          <p className="text-[10px] text-slate-500">Live multi-agent state monitor</p>
        </div>
        
        <div className="space-y-8">
          {[
            { 
              name: "Researcher", 
              active: agentStatus.toLowerCase().includes("researcher") || agentStatus.toLowerCase().includes("scanning"), 
              icon: Search, 
              color: "bg-blue-500" 
            },
            { 
              name: "Writer", 
              active: agentStatus.toLowerCase().includes("writer") || agentStatus.toLowerCase().includes("drafting") || (isThinking && agentStatus === "Initializing"), 
              icon: Cpu, 
              color: "bg-purple-500" 
            },
            { 
              name: "Auditor", 
              active: agentStatus.toLowerCase().includes("auditor") || agentStatus.toLowerCase().includes("validating"), 
              icon: ShieldCheck, 
              color: "bg-green-500" 
            }
          ].map((agent, i) => (
            <div key={i} className={`space-y-3 transition-all duration-500 ${agent.active ? 'opacity-100 scale-105' : 'opacity-30 scale-100'}`}>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-[#0B0F19] border ${agent.active ? 'border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-[#1F2937]'}`}>
                        <agent.icon size={14} className={agent.active ? "text-blue-400" : "text-slate-600"} />
                      </div>
                      <span className={`text-[11px] font-bold ${agent.active ? 'text-white' : 'text-slate-500'}`}>{agent.name} Agent</span>
                  </div>
                  <span className={`text-[8px] px-2 py-0.5 rounded-md font-black ${agent.active ? 'bg-blue-500 text-white' : 'bg-[#1F2937] text-slate-600'}`}>
                    {agent.active ? "BUSY" : "IDLE"}
                  </span>
               </div>
               <div className="w-full h-[3px] bg-[#1F2937] rounded-full overflow-hidden">
                  {agent.active && (
                    <motion.div 
                      initial={{ x: "-100%" }} 
                      animate={{ x: "100%" }} 
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
                      className={`h-full w-1/2 ${agent.color} shadow-[0_0_10px_#fff]`} 
                    />
                  )}
               </div>
            </div>
          ))}
        </div>

        <div className="mt-auto p-5 bg-[#0B0F19] rounded-2xl border border-[#1F2937]">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">Isolation Namespace</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[11px] font-bold text-white truncate">{currentWS?.name || "Active Session"}</span>
            </div>
        </div>
      </div>
    </div>
  );
}