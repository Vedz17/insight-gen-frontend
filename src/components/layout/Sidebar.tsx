import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="w-72 bg-[#0F1117] text-slate-300 flex flex-col border-r border-slate-800 h-screen">
      
      {/* Top Section: Logo & New Workspace Button */}
      <div className="p-6">
        <div className="text-xl font-bold text-white flex items-center gap-2 mb-8">
          <BrainCircuit className="text-blue-500" />
          Insight Genarator
        </div>
        
        <Button className="w-full bg-white text-black hover:bg-slate-200 font-medium mb-6">
          + New Workspace
        </Button>
        
        {/* Domain Selector Area */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
            Active Domain
          </p>
          <div className="bg-[#1A1D27] border border-slate-700 p-3 rounded-md text-sm text-slate-200">
            NAAC Accreditation
          </div>
        </div>
      </div>
      
      {/* Bottom Section: User Profile (Pushed to bottom using mt-auto) */}
      <div className="mt-auto p-6 border-t border-slate-800 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          VB
        </div>
        <div className="text-sm">
          <p className="text-white font-medium">Vedant Bhamare</p>
          <p className="text-xs text-slate-500">Free Tier (100 Credits)</p>
        </div>
      </div>

    </aside>
  );
}