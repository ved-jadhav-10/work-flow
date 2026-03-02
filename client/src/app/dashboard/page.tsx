"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FolderOpen, FileText, Code2, ListTodo, Loader2, Trash2,
  BookOpen, MessageSquare,
  Bell, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { projectsApi } from "@/lib/api";
import DashboardLeftPanel from "@/components/layout/DashboardLeftPanel";
import type { Project } from "@/types";

/* ─────────────────────────────────────────────────────────────────────────────
   CSS Keyframes
───────────────────────────────────────────────────────────────────────────── */

const CSS_KEYFRAMES = `
@keyframes pulseGlow {
  0%,100% { box-shadow: 0 0 0px rgba(56,189,248,0); border-color: rgba(56,189,248,0.22); }
  50%      { box-shadow: 0 0 12px rgba(56,189,248,0.25); border-color: rgba(56,189,248,0.50); }
}
@keyframes pillGlow {
  0%,100% { box-shadow: 0 0 6px rgba(255,215,0,0.15); }
  50%      { box-shadow: 0 0 18px rgba(255,215,0,0.38); }
}
@keyframes barBloom {
  0%   { filter: brightness(1); }
  50%  { filter: brightness(1.35) saturate(1.4); }
  100% { filter: brightness(1); }
}
@keyframes floatY {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-5px); }
}
@keyframes starSpin {
  from { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(180deg) scale(1.15); }
  to   { transform: rotate(360deg) scale(1); }
}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

function Glass({
  children,
  className = "",
  style,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glow?: string;
}) {
  return (
    <div
      className={`rounded-2xl border backdrop-blur-xl transition-all duration-300 ${className}`}
      style={{
        background: "rgba(6,11,25,0.52)",
        borderColor: "rgba(255,255,255,0.10)",
        boxShadow: glow
          ? `0 0 18px ${glow}0d, inset 0 1px 0 rgba(255,255,255,0.10)`
          : "inset 0 1px 0 rgba(255,255,255,0.10)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function GradText({ children, className = "", from = "#FFD700", to = "#38BDF8" }: { children: React.ReactNode; className?: string; from?: string; to?: string }) {
  return (
    <span className={className} style={{ background: `linear-gradient(110deg, ${from} 0%, ${to} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
      {children}
    </span>
  );
}

const FILTERS = [
  { key: "all",      label: "All Context"     },
  { key: "learning", label: "Learning Docs"   },
  { key: "code",     label: "Code Insights"   },
  { key: "tasks",    label: "Automated Tasks" },
];

const MODULES = [
  {
    key: "learning",
    icon: BookOpen,
    label: "Learning Intelligence",
    title: "Document Processing",
    accent: "#38BDF8",
    accentRgb: "56,189,248",
    stats: [
      { label: "PDFs indexed",       value: "—" },
      { label: "Concepts extracted", value: "—" },
    ],
    badge: "RAG Ready",
    desc: "Upload PDFs, extract concepts, generate summaries — all persisted to context.",
  },
  {
    key: "developer",
    icon: Code2,
    label: "Developer Productivity",
    title: "Code Analysis",
    accent: "#FFD700",
    accentRgb: "255,215,0",
    stats: [
      { label: "Bugs detected",     value: "—" },
      { label: "READMEs generated", value: "—" },
    ],
    badge: "Drift Watch",
    desc: "Deep code explanation, bug detection, and auto README — cross-referenced with docs.",
  },
  {
    key: "workflow",
    icon: ListTodo,
    label: "Workflow Automation",
    title: "Task Automation",
    accent: "#a78bfa",
    accentRgb: "167,139,250",
    stats: [
      { label: "Tasks extracted", value: "—" },
      { label: "High priority",   value: "—" },
    ],
    badge: "Active",
    desc: "Extract action items from transcripts and emails with priority classification.",
  },
  {
    key: "chat",
    icon: MessageSquare,
    label: "Unified Context Chat",
    title: "RAG Engine",
    accent: "#34d399",
    accentRgb: "52,211,153",
    stats: [
      { label: "Sources connected", value: "—" },
      { label: "Queries handled",   value: "—" },
    ],
    badge: "Online",
    desc: "Ask anything — the AI searches your full project context for grounded answers.",
  },
];



/* ─────────────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects]   = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [activeFilter, setFilter] = useState("all");
  const scrollRef   = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setParallaxY(el.scrollTop * 0.18);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const data: any = await projectsApi.list();
      setProjects(data.projects ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete project");
    }
  }

  const userName    = session?.user?.name ?? "You";
  const userInitial = userName[0]?.toUpperCase() ?? "U";

  return (
    <>
      <style>{CSS_KEYFRAMES}</style>

      {/* Fixed nebula background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/hero-bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.4) brightness(0.38) contrast(1.15)",
        }}
      />
      {/* Radial overlay */}
      <div
        className="fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 60%, rgba(6,11,25,0.55) 0%, rgba(6,11,25,0.18) 70%, transparent 100%), " +
            "linear-gradient(to bottom, rgba(6,11,25,0.70) 0%, rgba(6,11,25,0.30) 40%, rgba(6,11,25,0.65) 100%)",
        }}
      />

      {/* Layout shell */}
      <div className="relative z-10 flex h-screen overflow-hidden">

        {/* ── LEFT PANEL (homepage only) ───────────────────────────────── */}
        <DashboardLeftPanel />

        {/* ── MAIN SCROLL AREA ─────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          <div
            className="pl-4 pr-8 py-7 space-y-8 pb-20"
            style={{ transform: `translateY(${-parallaxY}px)`, willChange: "transform" }}
          >

            {/* ── Floating Top bar ──────────────────────────────────────── */}
            <div
              className="sticky top-0 z-20 pl-4 pr-8 py-4 flex items-center justify-between gap-4 backdrop-blur-2xl border-b"
              style={{ background: "rgba(6,11,25,0.65)", borderColor: "rgba(255,255,255,0.07)" }}
            >
              <div>
                <h1 className="text-[28px] font-bold tracking-tight leading-snug" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  <span className="text-slate-50 drop-shadow-md">Project Cosmos Overview</span>
                </h1>
                <p className="text-[12px] mt-0.5" style={{ color: "rgba(148,163,184,0.75)" }}>
                  Your persistent AI context — always in sync.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)", color: "rgba(148,163,184,0.8)" }}
                >
                  <Bell className="w-4 h-4" />
                </button>
                <Link
                  href="/dashboard/projects/new"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 active:scale-[0.97]"
                  style={{
                    fontFamily: "var(--font-playfair), serif",
                    color: "#FFD700",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ animation: "starSpin 4s linear infinite" }} />
                  New Project
                </Link>
              </div>
            </div>

            {/* ── Filter pills ──────────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {FILTERS.map(({ key, label }) => {
                const active = activeFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className="px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-200"
                    style={
                      active
                        ? { background: "rgba(255,215,0,0.10)", border: "1px solid rgba(255,215,0,0.42)", color: "#FFD700", animation: "pillGlow 2.5s ease-in-out infinite" }
                        : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(148,163,184,0.75)", backdropFilter: "blur(12px)" }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="p-3 rounded-xl text-[12px]" style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            {/* ── Intelligence Modules ──────────────────────────────────── */}
            <div>
              <p
                className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-5"
                style={{ fontFamily: "var(--font-playfair), serif", background: "linear-gradient(90deg,#FFD700,#38BDF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                Intelligence Modules
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MODULES.map((mod, idx) => (
                  <Glass
                    key={mod.key}
                    glow={mod.accent}
                    className="p-6 flex flex-col gap-4 cursor-pointer group hover:scale-[1.012] transition-transform"
                    style={{ animation: `floatY ${6 + idx}s ease-in-out infinite`, animationDelay: `${idx * 0.6}s` }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `rgba(${mod.accentRgb},0.10)`, border: `1px solid rgba(${mod.accentRgb},0.28)`, boxShadow: `0 0 14px rgba(${mod.accentRgb},0.18)` }}
                        >
                          <mod.icon className="w-4 h-4" style={{ color: mod.accent }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold tracking-widest uppercase opacity-90" style={{ color: mod.accent }}>{mod.label}</p>
                          <h3 className="text-[14px] font-semibold leading-tight text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>{mod.title}</h3>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                        style={{ background: `rgba(${mod.accentRgb},0.12)`, border: `1px solid rgba(${mod.accentRgb},0.30)`, color: mod.accent, boxShadow: `0 0 8px rgba(${mod.accentRgb},0.20)` }}
                      >
                        {mod.badge}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6">
                      {mod.stats.map((s) => (
                        <div key={s.label} className="flex flex-col gap-0.5">
                          <p className="text-[22px] font-bold leading-none text-white">{s.value}</p>
                          <p className="text-sm text-slate-400">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(148,163,184,0.72)" }}>{mod.desc}</p>

                    {/* Hover shimmer line */}
                    <div className="h-px w-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg,transparent,${mod.accent},transparent)` }} />
                  </Glass>
                ))}
              </div>
            </div>

            {/* ── Projects list ──────────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <p
                  className="text-[11px] font-semibold tracking-[0.16em] uppercase"
                  style={{ fontFamily: "var(--font-playfair), serif", background: "linear-gradient(90deg,#FFD700,#38BDF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                >
                  {loading ? "Loading…" : projects.length === 0 ? "No Projects" : `Your Projects (${projects.length})`}
                </p>
                <Link href="/dashboard/projects/new" className="text-[11px] font-semibold transition-colors" style={{ color: "#38BDF8" }}>
                  + New
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#38BDF8" }} />
                </div>
              ) : projects.length === 0 ? (
                <Glass className="p-12 text-center" glow="#38BDF8">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: "rgba(56,189,248,0.09)", border: "1px solid rgba(56,189,248,0.24)", boxShadow: "0 0 28px rgba(56,189,248,0.20)", animation: "floatY 4s ease-in-out infinite" }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: "#38BDF8", animation: "starSpin 6s linear infinite" }} />
                  </div>
                  <p className="font-semibold text-base text-white mb-1" style={{ fontFamily: "var(--font-playfair), serif" }}>
                    No projects yet
                  </p>
                  <p className="text-[12px] mb-6 max-w-[240px] mx-auto leading-relaxed" style={{ color: "rgba(148,163,184,0.72)" }}>
                    Create your first project to start building persistent AI context
                  </p>
                  <Link
                    href="/dashboard/projects/new"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 active:scale-[0.97]"
                    style={{ fontFamily: "var(--font-playfair), serif", color: "#FFD700" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" style={{ animation: "starSpin 3s linear infinite" }} />
                    Start Creating
                  </Link>
                </Glass>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <Glass key={project.id} className="group flex items-center justify-between px-5 py-4 hover:scale-[1.005] transition-all">
                      <Link href={`/dashboard/projects/${project.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(56,189,248,0.09)", border: "1px solid rgba(56,189,248,0.22)", boxShadow: "0 0 12px rgba(56,189,248,0.14)" }}>
                          <FolderOpen className="w-4 h-4" style={{ color: "#38BDF8" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate">{project.name}</p>
                          <p className="text-[11px] truncate" style={{ color: "rgba(148,163,184,0.65)" }}>{project.goal || "No goal set"}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-4 ml-auto pr-4 text-[11px] shrink-0" style={{ color: "rgba(148,163,184,0.60)" }}>
                          <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" style={{ color: "rgba(56,189,248,0.55)" }} />{project.document_count ?? 0} docs</span>
                          <span className="flex items-center gap-1.5"><Code2 className="w-3 h-3" style={{ color: "rgba(255,215,0,0.55)" }} />{project.insight_count ?? 0} insights</span>
                          <span className="flex items-center gap-1.5"><ListTodo className="w-3 h-3" style={{ color: "rgba(167,139,250,0.55)" }} />{project.task_count ?? 0} tasks</span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); handleDelete(project.id, project.name); }}
                        className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-400"
                        style={{ color: "rgba(148,163,184,0.50)" }}
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Glass>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
