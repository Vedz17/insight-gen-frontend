"use client";

import React, { useEffect, useState } from 'react';
import { 
  FileText, LayoutGrid, Activity, 
  ArrowUpRight, Clock, Loader2, TrendingUp 
} from 'lucide-react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { workspaces } = useWorkspaceStore();
  
  const [stats, setStats] = useState({
    totalReports: 0,
    totalWorkspaces: 0,
    totalDocuments: 0, 
    recentActivities: []
  });
  
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Fetch Stats from your existing API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard'); 
        const data = await res.json();
        
        if (data.success) {
          setStats(data.stats);
          setAnalytics(data.analytics || []); 
        }
      } catch (error) {
        console.error("Dashboard stats fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // 🚀 Configuration for Redirection & UI
  const statCards = [
    { 
      title: "Total Reports", 
      value: stats.totalReports, 
      icon: <FileText size={20} className="text-blue-500" />, 
      trend: "+12%", 
      path: "/reports",
      color: "text-blue-500",
      glow: "group-hover:border-blue-500/50"
    },
    { 
      title: "Active Workspaces", 
      value: workspaces.length || stats.totalWorkspaces, 
      icon: <LayoutGrid size={20} className="text-purple-500" />, 
      trend: "Live", 
      path: "/workspace",
      color: "text-purple-500",
      glow: "group-hover:border-purple-500/50"
    },
    { 
      title: "Documents", 
      value: stats.totalDocuments, 
      icon: <Activity size={20} className="text-emerald-500" />, 
      trend: "Syncing", 
      path: "/documents",
      color: "text-emerald-500",
      glow: "group-hover:border-emerald-500/50"
    },
    { 
      title: "Usage Stats", 
      value: "84%", 
      icon: <TrendingUp size={20} className="text-orange-500" />, 
      trend: "Pro Plan", 
      path: "/settings", // Redirect to settings/billing
      color: "text-orange-500",
      glow: "group-hover:border-orange-500/50"
    }
  ];

  return (
    <div className="p-8 bg-[#0B0F19] min-h-screen text-white">
      <header className="mb-10">
        <h1 className="text-4xl font-black mb-2 tracking-tight">Welcome back, Vedant</h1>
        <p className="text-slate-400 font-medium">
          Everything looks good. You have processed <span className="text-blue-500 font-bold">{stats.totalReports}</span> reports so far.
        </p>
      </header>

      {/* 🚀 STATS CARDS WITH REDIRECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, i) => (
          <Link href={card.path} key={i}>
            <motion.div 
              whileHover={{ y: -5 }}
              className={`bg-[#111827] border border-[#1F2937] p-6 rounded-[2rem] group transition-all cursor-pointer shadow-2xl relative overflow-hidden ${card.glow}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#0B0F19] border border-white/5 rounded-2xl">
                  {card.icon}
                </div>
                <ArrowUpRight className="text-slate-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={20} />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{card.title}</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-black">{card.value}</h3>
                <span className={`text-[10px] font-bold ${card.color}`}>{card.trend}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 📊 ANALYSIS OVERVIEW (PRESERVED CHART LOGIC) */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1F2937] rounded-[2.5rem] p-8 flex flex-col shadow-2xl">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Analysis Overview</h2>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-[#0B0F19] px-3 py-1 rounded-full border border-[#1F2937]">
                Live Analytics
              </div>
           </div>
           
           <div className="w-full h-[320px]">
             {analytics.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                   <XAxis 
                      dataKey="date" 
                      stroke="#4B5563" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                      tickFormatter={(val) => {
                        const parts = val.split('-');
                        return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                      }}
                    />
                   <YAxis stroke="#4B5563" fontSize={11} tickLine={false} axisLine={false} />
                   <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1F2937', borderRadius: '16px', color: '#fff' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                   />
                   <Bar dataKey="uploads" name="Docs Uploaded" fill="#3b82f6" radius={[6, 6, 6, 6]} maxBarSize={20} />
                   <Bar dataKey="reports" name="Reports Gen" fill="#8b5cf6" radius={[6, 6, 6, 6]} maxBarSize={20} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full w-full border border-[#1F2937] border-dashed rounded-[2rem] flex flex-col items-center justify-center bg-[#0B0F19]/30">
                  <Loader2 className="animate-spin text-blue-500 mb-2" size={24} />
                  <p className="text-slate-500 italic text-sm">Syncing latest metrics...</p>
               </div>
             )}
           </div>
        </div>

        {/* 🕒 RECENT ACTIVITY (PRESERVED DATA MAPPING) */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-[2.5rem] p-8 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Link href="/activity">
               <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors">View all</button>
            </Link>
          </div>
          
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.slice(0, 6).map((activity: any) => (
                <div key={activity._id} className="flex items-center gap-4 group cursor-pointer hover:bg-[#1F2937]/50 p-3 -mx-3 rounded-2xl transition-all">
                  <div className="p-3 bg-[#0B0F19] border border-[#1F2937] rounded-xl group-hover:border-blue-500/30 transition-colors">
                    <Clock size={18} className="text-slate-500 group-hover:text-blue-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                      {activity.title || "Document Processed"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-medium">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20">
                <Clock className="text-slate-800 mb-4" size={40} />
                <p className="text-slate-500 text-sm italic">No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}