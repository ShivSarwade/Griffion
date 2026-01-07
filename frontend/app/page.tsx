'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { 
  ShieldCheck, 
  ChevronRight, 
  Terminal, 
  Layers, 
  Database, 
  Cpu, 
  ArrowRight,
  Github,
  Moon,
  Sun,
  Menu,
  X,
  Zap,
  Lock,
  Box
} from 'lucide-react';

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full">
    {children}
  </span>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors uppercase tracking-widest">
    {children}
  </a>
);

const FolderTree = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h7Z" />
    <path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 14h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h7Z" />
    <path d="M3 3v18h2" />
    <path d="M12 8H8v8h4" />
  </svg>
);

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className={`min-h-screen selection:bg-indigo-500/30 transition-colors duration-500 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100 dark' : 'bg-white text-zinc-900'}`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow-lg transform -rotate-3">
              <ShieldCheck size={18} />
            </div>
            <span className="font-black text-lg tracking-tighter uppercase italic">Griffion</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Infrastructure</NavLink>
            <NavLink href="#workflow">Workflow</NavLink>
            <NavLink href="#tech">Tech Stack</NavLink>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/configure">
              <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                Launch Provisioner
              </button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge>Enterprise Infrastructure</Badge>
            <h1 className="mt-8 text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]">
              Architect your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">
                Full-Stack
              </span> in minutes.
            </h1>
            <p className="mt-8 mx-auto max-w-2xl text-zinc-500 dark:text-zinc-400 font-medium text-sm md:text-base leading-relaxed tracking-wide uppercase">
              The professional boilerplate-as-a-service for automated authentication, 
              RBAC hierarchies, and dynamic navigation logic.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/configure">
                <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs uppercase tracking-[0.2em] rounded shadow-2xl hover:-translate-y-1 transition-all">
                  Get Started Free
                </button>
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 border border-zinc-200 dark:border-zinc-800 font-black text-xs uppercase tracking-[0.2em] rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-2">
                Documentation <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            
            <div className="p-12 bg-white dark:bg-zinc-950 space-y-6">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-indigo-500">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase italic">Universal Auth</h3>
              <p className="text-xs leading-loose text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
                Dynamic configuration of Email vs Username identity strategies with native TOTP-based Multi-Factor Authentication.
              </p>
            </div>

            <div className="p-12 bg-white dark:bg-zinc-950 space-y-6">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-indigo-500">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase italic">Database Agnostic</h3>
              <p className="text-xs leading-loose text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
                Seamless migration between MySQL and MongoDB utilizing our proprietary Unified Data Access Layer powered by Prisma.
              </p>
            </div>

            <div className="p-12 bg-white dark:bg-zinc-950 space-y-6">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-indigo-500">
                <FolderTree size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase italic">Recursive RBAC</h3>
              <p className="text-xs leading-loose text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
                Hierarchical navigation architectures with role-based visibility pruned dynamically via server-side DFS logic.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Workflow Visualization */}
      <section id="workflow" className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/20">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <Badge>The Orchestration</Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">From Spec to Stack.</h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Configure", desc: "Define identity, roles, and hierarchy in the visual orchestrator.", icon: Terminal },
              { step: "02", title: "Provision", desc: "Our engine executes architectural tokenization and ORM compilation.", icon: Cpu },
              { step: "03", title: "Deploy", desc: "Download your structured ZIP archive containing ready-to-run microservices.", icon: Box }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="mb-6 mx-auto w-16 h-16 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:border-indigo-500 transition-colors">
                  <item.icon size={24} className="text-indigo-500" />
                </div>
                <span className="text-[40px] font-black text-zinc-200 dark:text-zinc-800 absolute -top-4 left-1/2 -translate-x-1/2 -z-10 select-none">
                  {item.step}
                </span>
                <h4 className="text-sm font-black uppercase tracking-widest">{item.title}</h4>
                <p className="mt-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[2rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-indigo-500/40 relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
              Ready to ship <br />
              production-grade stacks?
            </h2>
            <p className="max-w-md mx-auto text-indigo-100 text-xs font-bold uppercase tracking-[0.3em] leading-loose">
              Stop reinventing the auth wheel. Provision your next enterprise architecture today.
            </p>
            <Link href="/configure">
              <button className="px-10 py-5 bg-white text-indigo-600 font-black text-xs uppercase tracking-[0.2em] rounded shadow-xl hover:scale-105 transition-all">
                Initialize Project
              </button>
            </Link>
          </div>
          
          {/* Decorative Rings */}
          <div className="absolute top-0 right-0 w-96 h-96 border-[40px] border-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 border-[20px] border-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={20} />
            <span className="font-black text-sm uppercase italic tracking-tighter">Griffion</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            © 2024 Griffion BaaS Infrastructure. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
