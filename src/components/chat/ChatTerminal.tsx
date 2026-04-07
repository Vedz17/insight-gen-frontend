"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, BrainCircuit, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown'; 

type Message = {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
};

// 🧠 SMART TITLE GENERATOR (Faltu words ignore karega)
const generateSmartTitle = (text: string) => {
  const stopWords = ['what', 'is', 'are', 'the', 'of', 'in', 'how', 'to', 'can', 'you', 'tell', 'me', 'about', 'a', 'an', 'give', 'some', 'details', 'explain', 'please', 'do', 'does', 'did', 'for', 'with', 'on', 'my', 'i', 'want', 'know'];
  
  // Special characters hatao aur words ko alag karo
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  
  // Stop-words hatao aur sirf meaningful words rakho (jinki length > 2 ho)
  const meaningfulWords = words.filter(w => !stopWords.includes(w) && w.length > 2);

  if (meaningfulWords.length === 0) return "New Conversation";

  // Shuru ke 3 words lo aur unka Pehla Letter Capital kar do (Title Case)
  return meaningfulWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}; 

export function ChatTerminal() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 🚀 UPDATED HISTORY FETCH LOGIC
  useEffect(() => {
    const fetchHistory = async () => {
      // 1. URL se check karo ki koi chat khuli hai ya nahi
      const params = new URLSearchParams(window.location.search);
      const urlWorkspaceId = params.get("workspaceId");

      // 2. Agar New Workspace hai (ID nahi hai), toh screen khali rakho
      if (!urlWorkspaceId) {
        setMessages([]);
        setWorkspaceId(null);
        return;
      }

      // 3. Agar ID hai, toh API ko wahi ID bhejo
      try {
        const res = await fetch(`/api/chat/history?workspaceId=${urlWorkspaceId}`);
        const data = await res.json();

        if (data.success && data.history.length > 0) {
          const formattedMsgs = data.history.map((m: any) => ({
            id: m._id,
            role: m.role,
            content: m.content
          }));
          setMessages(formattedMsgs);
          setWorkspaceId(data.workspaceId);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };

    fetchHistory();
  }, []); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        alert("Please select a PDF file only.");
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() && !selectedFile) return;

    // 🚀 Check if this is the FIRST message
    const isFirstMessage = messages.length === 0;

    const userQuestion = inputValue.trim(); 
    const messageContent = userQuestion || `Uploaded file: ${selectedFile?.name}`;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
    };
    setMessages((prev) => [...prev, newUserMsg]);
    
    const currentFile = selectedFile;
    setInputValue("");
    setSelectedFile(null); 

    try {
      let currentWorkspaceId = workspaceId;

      // Agar Workspace nahi hai, toh pehle naya banao
      if (!currentWorkspaceId) {
        const res = await fetch("/api/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfName: currentFile?.name || "New Chat Session" }),
        });
        const data = await res.json();
        
        if (data.success) {
          currentWorkspaceId = data.workspaceId;
          setWorkspaceId(currentWorkspaceId);
        } else {
          return;
        }
      }

      // ==========================================
      // 🚀 SMART AUTO-RENAME MAGIC
      // ==========================================
      if (isFirstMessage && userQuestion) {
        const smartTitle = generateSmartTitle(userQuestion);
        
        // Background mein naam update kar do (Fire and forget)
        fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            workspaceId: currentWorkspaceId, 
            newName: smartTitle 
          })
        }).catch(err => console.error("Rename failed", err));
      }

      // ==========================================
      // SCENARIO 1: FILE UPLOAD + QUESTION
      // ==========================================
      if (currentFile) {
        const loadingId = "loading-" + Date.now();
        setMessages((prev) => [...prev, { 
          id: loadingId, role: "ai", content: "⏳ *Reading PDF and storing in Pinecone Database... please wait.*" 
        }]);

        const formData = new FormData();
        formData.append("file", currentFile);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();

        setMessages((prev) => prev.filter(msg => msg.id !== loadingId));

        if (uploadData.success) {
          const successMsg: Message = {
            id: Date.now().toString(), role: "ai",
            content: `✅ **Success!** I have read **${currentFile.name}** and stored **${uploadData.data.chunks_created}** data chunks.`
          };
          setMessages((prev) => [...prev, successMsg]);

          if (userQuestion) {
            const chatRes = await fetch("/api/chat", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ workspaceId: currentWorkspaceId, content: userQuestion, role: "user" })
            });

            if (!chatRes.body) return;
            const aiMessageId = (Date.now() + 1).toString();
            setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", content: "" }]);

            const reader = chatRes.body.getReader();
            const decoder = new TextDecoder();
            let aiText = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              aiText += decoder.decode(value, { stream: true });
              setMessages((prev) => prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: aiText } : msg)));
            }
          }
        } else {
          setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", content: `❌ **Upload Failed:** ${uploadData.error}` }]);
        }

      } else {
        // ==========================================
        // SCENARIO 2: NORMAL TEXT CHAT (Streaming)
        // ==========================================
        const chatRes = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId: currentWorkspaceId, content: messageContent, role: "user" })
        });

        if (!chatRes.body) return;
        const aiMessageId = (Date.now() + 1).toString();
        setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", content: "" }]);

        const reader = chatRes.body.getReader();
        const decoder = new TextDecoder();
        let aiText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiText += decoder.decode(value, { stream: true });
          setMessages((prev) => prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: aiText } : msg)));
        }
      }
    } catch (error) {
      console.error("API Call Error:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full min-h-0 overflow-hidden">
      
      <header className="h-16 shrink-0 border-b border-slate-200 flex items-center px-8 shadow-sm">
        <h2 className="font-semibold text-slate-800">InsightGen Agent Terminal</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white shrink-0 mt-1">
              <BrainCircuit size={18} />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-sm text-slate-800 leading-relaxed max-w-[85%]">
              Hello! I am your AI agent. Attach a PDF document, or ask me a general question.
            </div>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`h-8 w-8 rounded-md flex items-center justify-center text-white shrink-0 mt-1 ${msg.role === "user" ? "bg-slate-800" : "bg-blue-600"}`}>
                {msg.role === "user" ? <User size={18} /> : <BrainCircuit size={18} />}
              </div>
              
              <div className={`border rounded-2xl p-4 text-sm leading-relaxed max-w-[85%] ${
                msg.role === "user" 
                  ? "bg-slate-800 text-white rounded-tr-none border-slate-800" 
                  : "bg-slate-50 text-slate-800 rounded-tl-none border-slate-200"
              }`}>
                {msg.role === "ai" ? (
                  <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-strong:text-slate-900 prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 shrink-0 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          {selectedFile && (
            <div className="mb-3 flex items-center gap-2 bg-blue-50 text-blue-700 w-fit px-3 py-1.5 rounded-lg text-sm border border-blue-200">
              <span className="truncate max-w-[200px]">{selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)} className="hover:text-blue-900">
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
            <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" size="icon" className="shrink-0 rounded-full h-12 w-12 border-slate-300 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
              <Paperclip size={20} />
            </Button>
            <Input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask a question or upload a document..." className="flex-1 rounded-full bg-slate-50 border-slate-300 focus-visible:ring-blue-500 px-6 py-6 text-base" />
            <Button type="submit" disabled={!inputValue.trim() && !selectedFile} size="icon" className="shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 h-12 w-12 disabled:opacity-50">
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}