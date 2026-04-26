"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle2, ChevronDown, Loader2, Download, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import Swal from "sweetalert2";

const NAAC_CRITERIA = [
  { id: 1, title: "Criterion 1: Curricular Aspects", sections: ["1.1 Curriculum Planning", "1.2 Academic Flexibility", "1.3 Curriculum Enrichment", "1.4 Feedback System"] },
  { id: 2, title: "Criterion 2: Teaching-Learning & Evaluation", sections: ["2.1 Student Enrollment", "2.2 Catering to Student Diversity", "2.3 Teaching-Learning Process", "2.4 Teacher Profile"] },
  { id: 3, title: "Criterion 3: Research, Innovations & Extension", sections: ["3.1 Promotion of Research", "3.2 Resource Mobilization", "3.3 Innovation Ecosystem", "3.4 Extension Activities"] },
  { id: 4, title: "Criterion 4: Infrastructure & Learning Resources", sections: ["4.1 Physical Facilities", "4.2 Library as a Learning Resource", "4.3 IT Infrastructure", "4.4 Maintenance"] },
  { id: 5, title: "Criterion 5: Student Support & Progression", sections: ["5.1 Student Support", "5.2 Student Progression", "5.3 Student Participation", "5.4 Alumni Engagement"] },
  { id: 6, title: "Criterion 6: Governance, Leadership & Management", sections: ["6.1 Institutional Vision", "6.2 Strategy Development", "6.3 Faculty Empowerment", "6.4 Financial Management"] },
  { id: 7, title: "Criterion 7: Institutional Values & Best Practices", sections: ["7.1 Institutional Values", "7.2 Best Practices", "7.3 Institutional Distinctiveness"] },
];

export default function ReportsPage() {
  const router = useRouter();
  const { activeWorkspaceId, workspaces, setActiveWorkspaceId } = useWorkspaceStore();
  const [selectedCriterion, setSelectedCriterion] = useState(NAAC_CRITERIA[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!activeWorkspaceId) return;
      try {
        const res = await fetch(`/api/reports/list?workspaceId=${activeWorkspaceId}`);
        const data = await res.json();
        if (data.success) {
          setRecentReports(data.reports);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };
    fetchRecent();
  }, [activeWorkspaceId]);

  const handleGenerate = async () => {
    if (!activeWorkspaceId) {
      Swal.fire("Workspace Required", "Please select a workspace from the dropdown.", "warning");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: activeWorkspaceId,
          criterionId: selectedCriterion.id,
          title: selectedCriterion.title,
          topics: selectedCriterion.sections.join(":")
        })
      });

      const data = await res.json();

      if (data.success && data.reportId) {
        router.push(`/workspace/${activeWorkspaceId}/report/${data.reportId}`);
      } else {
        throw new Error(data.error || "Generation failed at engine level");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Report Generator</h1>
        <p className="text-slate-400 text-sm">Generate structured NAAC reports from your workspace data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-white">
              <FileText className="text-blue-500" size={20} /> Configure Report
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Select Workspace</label>
                <div className="relative">
                  <select 
                    className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    value={activeWorkspaceId || ""}
                    onChange={(e) => setActiveWorkspaceId(e.target.value)}
                  >
                    <option value="" disabled>Select a workspace...</option>
                    {workspaces.map((ws) => (
                      <option key={ws._id} value={ws._id}>{ws.name || "Untitled Project"}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">NAAC Criterion</label>
                <div className="relative">
                  <select 
                    className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    value={selectedCriterion.id}
                    onChange={(e) => setSelectedCriterion(NAAC_CRITERIA.find(c => c.id === parseInt(e.target.value))!)}
                  >
                    {NAAC_CRITERIA.map(crit => (
                      <option key={crit.id} value={crit.id}>{crit.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="mb-8 p-5 bg-[#0B0F19]/50 border border-[#1F2937] rounded-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-[#1F2937] pb-2">Included Sections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCriterion.sections.map((section, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!activeWorkspaceId || isGenerating}
                className={cn(
                  "w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                  (!activeWorkspaceId || isGenerating) 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10 active:scale-[0.98]"
                )}
              >
                {isGenerating ? <><Loader2 className="animate-spin" size={18} /> Generating Comprehensive Report...</> : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-6 flex items-center gap-2">
              <Clock size={16} /> Recent Reports
            </h2>
            <div className="space-y-3">
              {recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <div 
                    key={report._id}
                    onClick={() => router.push(`/workspace/${activeWorkspaceId}/report/${report._id}`)}
                    className="group flex items-center justify-between p-4 rounded-xl bg-[#0B0F19]/80 border border-[#1F2937] hover:border-blue-500 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="text-blue-400 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate max-w-[150px]">{report.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Download size={16} className="text-slate-500 group-hover:text-blue-500" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-10 italic">No reports found for this workspace.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}