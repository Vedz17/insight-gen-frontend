"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useReactToPrint } from 'react-to-print';

export default function ReportViewPage() {
  const params = useParams();
  const router = useRouter();
  
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // 🎯 Ref for the PDF content
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log("Fetching report ID:", params.reportId);
        const res = await fetch(`/api/reports/${params.reportId}`);
        
        // 🛡️ SAFE JSON PARSING
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Backend sent HTML instead of JSON:", text);
          setErrorMsg("API route is returning HTML. Check backend!");
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (data.success) {
          setReport(data.report);
        } else {
          setErrorMsg(data.error || "Report not found");
        }
      } catch (error: any) {
        console.error("Fetch Error:", error);
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.reportId) fetchReport();
  }, [params.reportId]);

  // 📄 NATIVE DOWNLOAD PDF LOGIC (🚀 FIXED for V3 syntax)
  const handleDownloadPDF = useReactToPrint({
    contentRef: contentRef, // <--- Yahan change kiya hai (contentRef use kiya hai)
    documentTitle: report?.title || 'InsightGen_Report',
  });

  if (isLoading) return <div className="min-h-screen bg-[#0B0F19] text-blue-500 p-10 font-bold flex items-center justify-center">Loading Report Intelligence...</div>;
  if (errorMsg) return <div className="min-h-screen bg-[#0B0F19] text-red-500 p-10 font-bold flex items-center justify-center">Error: {errorMsg}</div>;

  const reportContent = report?.versions?.[report.versions.length - 1]?.content || "No content found in DB.";

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8 font-sans selection:bg-blue-500/30">
      
      {/* 🚀 ACTION BAR */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <button 
          type="button"
          onClick={() => router.back()} 
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1F2937] text-slate-200 font-medium rounded-xl hover:bg-gray-700 transition-all active:scale-95"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <button 
          type="button"
          // @ts-ignore
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all active:scale-95"
        >
          <Download size={18} />
          Save as PDF
        </button>
      </div>

      {/* 📄 REPORT WRAPPER */}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight">
          {report?.title || "Untitled Report"}
        </h1>

        {/* 🧠 BEAUTIFUL MARKDOWN RENDERER */}
        <div 
          ref={contentRef}
          className="p-8 md:p-12 bg-[#0F172A] border border-[#1F2937] shadow-2xl rounded-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-8"
        >
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-black text-white mt-8 mb-4 border-b border-white/10 pb-2 print:text-black print:border-black/20" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-blue-400 mt-8 mb-4 print:text-blue-700" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-blue-300 mt-6 mb-3 print:text-blue-600" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 text-slate-300 leading-relaxed text-[15px] print:text-gray-800" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-blue-500 text-slate-300 print:text-gray-800" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-blue-500 text-slate-300 print:text-gray-800" {...props} />,
              li: ({node, ...props}) => <li className="pl-1 leading-relaxed" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-white bg-white/5 px-1 rounded print:text-black print:bg-transparent" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-400 my-6 bg-blue-500/5 py-2 pr-4 rounded-r-lg print:text-gray-700 print:bg-gray-100" {...props} />
            }}
          >
            {reportContent}
          </ReactMarkdown>
        </div>
      </div>
      
    </div>
  );
}