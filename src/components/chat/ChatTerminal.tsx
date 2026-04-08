"use client";

import { useState, useRef, useEffect } from "react";
// 🚀 NAYA: Download icon import kiya hai
import { Paperclip, Send, BrainCircuit, User, X, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown'; 

type Message = {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
};

// 🧠 SMART TITLE GENERATOR
const generateSmartTitle = (text: string) => {
  const stopWords = ['what', 'is', 'are', 'the', 'of', 'in', 'how', 'to', 'can', 'you', 'tell', 'me', 'about', 'a', 'an', 'give', 'some', 'details', 'explain', 'please', 'do', 'does', 'did', 'for', 'with', 'on', 'my', 'i', 'want', 'know'];
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const meaningfulWords = words.filter(w => !stopWords.includes(w) && w.length > 2);
  if (meaningfulWords.length === 0) return "New Conversation";
  return meaningfulWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}; 

export function ChatTerminal() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentStatus]); 
  
  // 🚀 HISTORY FETCH LOGIC
  useEffect(() => {
    const fetchHistory = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlWorkspaceId = params.get("workspaceId");

      if (!urlWorkspaceId) {
        setMessages([]);
        setWorkspaceId(null);
        return;
      }

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

  // 🚀 HACKATHON TRICK: Text to MS Word Downloader
const downloadAsWord = (text: string) => {
    let formattedText = text
      // 1. AI ki faltu spaces: Double Enter ko Single Enter mein badlo
      .replace(/\n\s*\n/g, '\n')
      
      // 2. Bold Text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      
      // 3. Headings (Inke aage-peeche ka space fix kiya)
      .replace(/^### (.*$)/gim, '<h3 style="margin-top: 12px; margin-bottom: 4px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="margin-top: 14px; margin-bottom: 4px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="margin-top: 16px; margin-bottom: 4px;">$1</h1>')
      
      // 4. 🚀 THE FIX: <ul> hata diya! Ab simple paragraph use hoga jisme perfect margin hai
      .replace(/^\s*[\*\-\+]\s+(.*)$/gim, '<p style="margin-top: 2px; margin-bottom: 2px; margin-left: 20px;">&bull; $1</p>')
      
      // 5. Bachi hui lines ko break karo
      .replace(/\n/g, '<br>')
      
      // 6. Heading ya Bullet ke theek baad aane wale faltu <br> (empty space) ko hatao
      .replace(/(<\/p>|<\/h[1-3]>)<br>/g, '$1');

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Report</title></head><body>";
    const footer = "</body></html>";
    
    // Line height 1.5 se 1.4 kardi taaki aur compact lage
    const sourceHTML = header + "<div style='font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4;'>" + formattedText + "</div>" + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'NAAC_Generated_Report.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() && !selectedFile) return;

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

      if (isFirstMessage && userQuestion) {
        const smartTitle = generateSmartTitle(userQuestion);
        fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId: currentWorkspaceId, newName: smartTitle })
        }).then(() => {
          window.dispatchEvent(new Event("workspaceUpdated"));
        }).catch(err => console.error("Rename failed", err));
      }

      if (currentFile) {
        // Upload Scenario
        const loadingId = "loading-" + Date.now();
        setMessages((prev) => [...prev, { 
          id: loadingId, role: "ai", content: "⏳ *Reading PDF and storing in Pinecone Database... please wait.*" 
        }]);

        const formData = new FormData();
        formData.append("file", currentFile);
        formData.append("workspaceId", currentWorkspaceId); // 🚀 Private Room ID

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
            startChatStream(currentWorkspaceId, userQuestion);
          }
        } else {
          setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", content: `❌ **Upload Failed:** ${uploadData.error}` }]);
        }
      } else {
        // Normal Chat Scenario
        startChatStream(currentWorkspaceId, messageContent);
      }
    } catch (error) {
      console.error("API Call Error:", error);
      setAgentStatus(null);
    }
  };

  const startChatStream = async (workspaceId: string, content: string) => {
    const chatRes = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, content, role: "user" })
    });

    if (!chatRes.body) return;
    const aiMessageId = (Date.now() + 1).toString();
    
    setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", content: "" }]);

    const reader = chatRes.body.getReader();
    const decoder = new TextDecoder();
    let aiText = "";

    setAgentStatus("Thinking...");

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setAgentStatus(null);
        break;
      }
      
      aiText += decoder.decode(value, { stream: true });

      const statusRegex = /\[\[STATUS:(.*?)\]\]/g;
      let match;
      let lastStatus = null;
      
      while ((match = statusRegex.exec(aiText)) !== null) {
        lastStatus = match[1];
      }
      if (lastStatus) setAgentStatus(lastStatus);

      const cleanText = aiText.replace(/\[\[STATUS:(.*?)\]\]/g, "");
      if (cleanText.trim().length > 0) setAgentStatus(null); 
      
      setMessages((prev) => prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: cleanText } : msg)));
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
              
              <div className={`border rounded-2xl p-4 text-sm leading-relaxed max-w-[85%] min-h-[3rem] ${
                msg.role === "user" 
                  ? "bg-slate-800 text-white rounded-tr-none border-slate-800" 
                  : "bg-slate-50 text-slate-800 rounded-tl-none border-slate-200"
              }`}>
                {msg.role === "ai" ? (
                  !msg.content && agentStatus ? (
                    <div className="flex items-center gap-3 text-blue-600 animate-pulse py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-semibold tracking-wide">{agentStatus}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-strong:text-slate-900 prose-p:leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      
                      {/* 🚀 NAYA: DOWNLOAD BUTTON WALA JADU */}
                      {msg.content.length > 150 && (
                        <div className="pt-3 border-t border-slate-200 mt-2">
                          <Button 
                            onClick={() => downloadAsWord(msg.content)}
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 w-fit"
                          >
                            <Download size={14} />
                            Download as Word
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 shrink-0 bg-white border-t border-slate-200 relative">
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