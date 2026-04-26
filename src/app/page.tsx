"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  FileSearch, 
  Zap, 
  CheckCircle2,
  BrainCircuit,
  TerminalSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function RootLandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-blue-500/30 font-sans overflow-x-hidden">
      
      {/* 🌌 LAYERED BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 40H0V0h40v40zM1 39h38V1H1v38z' fill='white' fill-opacity='1'/%3E%3C/svg%3E")` }} 
        />
        <div className="absolute top-1/4 -left-1/4 w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <WhyInsightGen />
        <Features />
        <HowItWorks />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

/* 🚀 1. NAVBAR */
function Navbar() {
  const { userId } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white italic">InsightGen</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors">How it works</button>
          
          {!userId ? (
            <SignInButton mode="modal">
              <button className="group relative px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl overflow-hidden transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                 <span className="relative z-10">Log In / Sign Up</span>
                 <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-streak" />
              </button>
            </SignInButton>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm font-bold text-white hover:text-blue-400 transition-colors">
                Dashboard →
              </Link>
              <div className="ml-2">
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-blue-500/50" } }} />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* 🎨 2. HERO SECTION */
function Hero() {
  const { userId } = useAuth();

  return (
    <section className="max-w-7xl mx-auto px-8 pt-40 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Zap size={12} /> AI-Powered Report Intelligence
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8"
          >
            Multi-Agent <br /> 
            <span className="text-white">Insight Generator</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 leading-relaxed mb-12 font-medium"
          >
            Turn complex institutional data into structured, intelligent reports powered by multi-agent AI. No guesswork. No noise.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center gap-6"
          >
            {!userId ? (
              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-2xl hover:scale-[1.03] transition-all active:scale-95 shadow-blue-600/20 flex items-center gap-2">
                  Get Started <ArrowRight size={18} />
                </button>
              </SignInButton>
            ) : (
              <Link href="/dashboard" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-2xl hover:scale-[1.03] transition-all active:scale-95 shadow-blue-600/20 flex items-center gap-2">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            )}

            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
                    className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all active:scale-95">
               View Features
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative w-full max-w-lg mx-auto lg:ml-auto"
        >
           <div className="absolute inset-0 bg-blue-600/20 blur-[50px] rounded-full" />
           <div className="relative bg-[#090E17]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-mono text-sm">
             <div className="bg-white/[0.02] border-b border-white/5 px-4 py-3 flex items-center gap-2">
               <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-500/80" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                 <div className="w-3 h-3 rounded-full bg-green-500/80" />
               </div>
               <div className="flex-1 text-center text-[#9CA3AF] text-xs font-medium tracking-widest flex items-center justify-center gap-2">
                 <TerminalSquare size={12} /> insight-gen-core
               </div>
             </div>
             <div className="p-6 text-slate-300 space-y-3 min-h-[280px]">
               <TerminalLines />
             </div>
           </div>
        </motion.div>

      </div>
    </section>
  );
}

/* 🤖 ANIMATED TERMINAL LINES LOGIC */
function TerminalLines() {
  const lines = [
    { text: "> Authenticating workspace session...", delay: 0.5 },
    { text: "> Initiating Multi-Agent RAG pipeline.", delay: 1.5 },
    { text: "> [Researcher Agent] Scanning Pinecone Vector DB...", delay: 2.5, color: "text-blue-400" },
    { text: "> 42 contextual chunks retrieved in 120ms.", delay: 3.5, color: "text-green-400" },
    { text: "> [Writer Agent] Drafting NAAC compliance section...", delay: 4.5, color: "text-purple-400" },
    { text: "> [Auditor Agent] Cross-verifying against strict guidelines...", delay: 5.5, color: "text-orange-400" },
    { text: "> Status: PASSED. Zero hallucinations detected.", delay: 6.5, color: "text-green-400 font-bold" },
    { text: "> Awaiting next command_", delay: 7.5, blink: true }
  ];

  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const timeouts = lines.map((line, index) => 
      setTimeout(() => setVisibleLines(index + 1), line.delay * 1000)
    );
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <>
      {lines.slice(0, visibleLines).map((line, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }}
          className={cn("flex gap-2", line.color)}
        >
          <span className={cn(line.blink && "animate-pulse")}>{line.text}</span>
        </motion.div>
      ))}
    </>
  );
}

/* 🧠 7. WHY INSIGHTGEN */
function WhyInsightGen() {
  const points = [
    { title: "Multi-agent reasoning system", desc: "Coordinated AI agents (Researcher, Writer, Auditor) work in sync.", icon: Cpu },
    { title: "Structured output", desc: "Strict formatting logic ensures reports are submission-ready, not random AI text.", icon: LayoutGridIcon },
    { title: "Context-aware analysis", desc: "Retrieval-Augmented Generation (RAG) ensures answers stay grounded in your data.", icon: BrainCircuit },
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-20 border-y border-white/5 bg-white/[0.01]">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-blue-500 uppercase tracking-widest">Why InsightGen</h2>
            <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">Built for Intelligent Reporting</h3>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-10">
             {points.map((p, i) => (
               <div key={i} className="space-y-3">
                  <p className="text-white font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-500" /> {p.title}
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{p.desc}</p>
               </div>
             ))}
          </div>
       </div>
    </section>
  );
}

/* 🧠 5. FEATURE CARDS */
function Features() {
  const features = [
    { 
      title: "Structured Report Generation", 
      desc: "Transform raw institutional data into formal, NAAC-compliant report sections effortlessly.",
      icon: FileSearch 
    },
    { 
      title: "Document Intelligence (RAG)", 
      desc: "Instant retrieval of relevant context from large PDF sets with zero hallucination risk.",
      icon: ShieldCheck 
    },
    { 
      title: "Inline AI Editing", 
      desc: "Refine generated content on the fly with specialized prompts for tone and length adjustment.",
      icon: Zap 
    },
    { 
      title: "Workspace Management", 
      desc: "Maintain multi-project isolation with dedicated knowledge bases for every institutional audit.",
      icon: LayersIcon 
    }
  ];

  return (
    <section id="features" className="max-w-7xl mx-auto px-8 py-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-10 bg-[#111827]/50 border border-[#1F2937] rounded-[2.5rem] hover:border-blue-500/40 transition-all duration-500 cursor-default hover:shadow-[0_0_40px_rgba(37,99,235,0.05)]"
          >
            <div className="p-4 bg-blue-600/10 rounded-2xl w-fit mb-6 text-blue-500 group-hover:scale-110 transition-transform duration-500">
               <f.icon size={28} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">{f.title}</h4>
            <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* 🧠 6. HOW IT WORKS */
function HowItWorks() {
  const steps = ["Upload Documents", "Analyze with AI", "Generate Report", "Refine & Export"];
  
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-8 py-32 text-center overflow-hidden">
      <h2 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-20">The Process</h2>
      
      <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 md:gap-4">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
        
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              {i + 1}
            </div>
            <p className="text-lg font-bold text-white tracking-tight">{step}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* 🎯 8. CTA SECTION */
function CTASection() {
  const { userId } = useAuth();

  return (
    <section className="max-w-7xl mx-auto px-8 py-40 text-center">
      <div className="bg-gradient-to-b from-blue-600/10 to-transparent p-20 rounded-[4rem] border border-white/5">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
          Start generating structured reports
        </h2>
        <p className="text-slate-400 text-lg font-medium mb-12">
          No templates. No guesswork. Pure institutional intelligence.
        </p>
        
        {!userId ? (
          <SignInButton mode="modal">
            <button className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl hover:scale-[1.05] transition-all active:scale-95 shadow-blue-600/30 inline-block">
              Get Started for Free
            </button>
          </SignInButton>
        ) : (
          <Link href="/dashboard" className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-2xl hover:scale-[1.05] transition-all active:scale-95 shadow-blue-600/30 inline-block">
            Go to Dashboard →
          </Link>
        )}

      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-blue-500 w-5 h-5" />
          <span className="font-bold text-white italic">InsightGen</span>
        </div>
        <p className="text-slate-600 text-xs font-medium">© 2026 InsightGen. Built for Excellence.</p>
        <div className="flex gap-8 text-xs font-bold text-slate-500">
           <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
           <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
        </div>
      </div>
    </footer>
  );
}

// Custom Icons for Features
function LayersIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function LayoutGridIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}