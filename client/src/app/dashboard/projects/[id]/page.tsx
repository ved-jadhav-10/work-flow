"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Code2,
  ListTodo,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { projectsApi } from "@/lib/api";
import type { Project } from "@/types";

/* ─── inline Glass card ────────────────────────────────────────────────────── */
function Glass({
  children,
  className = "",
  glow,
}: {
  children: React.ReactNode;
  className?: string;
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
      }}
    >
      {children}
    </div>
  );
}

/* ─── module definitions ───────────────────────────────────────────────────── */
const MODULES = (projectId: string, project: Project) => [
  {
    key: "learning",
    href: `/dashboard/projects/${projectId}/learning`,
    icon: BookOpen,
    label: "EasyLearn",
    title: "Document Processing",
    accent: "#38BDF8",
    accentRgb: "56,189,248",
    stats: [
      { value: project.document_count ?? 0, label: "PDFs indexed" },
      { value: project.concept_count ?? 0, label: "Topics extracted" },
    ],
    badge: "RAG Ready",
    desc: "Upload PDFs, extract concepts, and generate summaries. All persisted to context.",
  },
  {
    key: "developer",
    href: `/dashboard/projects/${projectId}/developer`,
    icon: Code2,
    label: "EasyCode",
    title: "Code Analysis",
    accent: "#FFD700",
    accentRgb: "255,215,0",
    stats: [
      { value: project.insight_count ?? 0, label: "Code insights" },
      { value: project.insight_count ?? 0, label: "Analyses run" },
    ],
    badge: "Drift Watch",
    desc: "Deep code explanation, bug detection, and auto README, cross-referenced with docs.",
  },
  {
    key: "workflow",
    href: `/dashboard/projects/${projectId}/workflow`,
    icon: ListTodo,
    label: "EasyAutomate",
    title: "Task Automation",
    accent: "#a78bfa",
    accentRgb: "167,139,250",
    stats: [
      { value: project.task_count ?? 0, label: "Tasks extracted" },
      { value: project.high_priority_task_count ?? 0, label: "High priority" },
    ],
    badge: "Active",
    desc: "Extract action items from transcripts and emails with priority classification.",
  },
  {
    key: "chat",
    href: `/dashboard/projects/${projectId}/chat`,
    icon: MessageSquare,
    label: "Context Chat",
    title: "RAG Engine",
    accent: "#34d399",
    accentRgb: "52,211,153",
    stats: [
      { value: (project.document_count ?? 0) + (project.insight_count ?? 0) + (project.task_count ?? 0), label: "Sources connected" },
      { value: project.document_count ?? 0, label: "Documents loaded" },
    ],
    badge: "Online",
    desc: "Ask anything. The AI searches your full project context for grounded answers.",
  },
];

/* ─── page ─────────────────────────────────────────────────────────────────── */
export default function ProjectHomePage() {
  const params = useParams();
  const projectId = (params?.id ?? "") as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    projectsApi
      .get(projectId)
      .then((data: any) => setProject(data))
      .catch((err: any) => setError(err.message || "Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#38BDF8" }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-white">
        <p className="text-red-400">{error || "Project not found"}</p>
        <Link href="/dashboard" className="text-sm mt-2 block" style={{ color: "#38BDF8" }}>
          Back to Projects
        </Link>
      </div>
    );
  }

  const modules = MODULES(projectId, project);

  return (
    <div className="p-8 max-w-4xl w-full">
      {/* Project header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white truncate">{project.name}</h1>
        {project.goal && (
          <p className="text-[13px] mt-1.5 max-w-xl leading-relaxed" style={{ color: "rgba(148,163,184,0.72)" }}>
            {project.goal}
          </p>
        )}
      </div>

      {/* Section label */}
      <p
        className="text-[11px] font-semibold tracking-[0.16em] uppercase mb-5"
        style={{
          background: "linear-gradient(90deg,#FFD700,#38BDF8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Intelligence Modules
      </p>

      {/* 2×2 module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map((mod) => (
          <Link key={mod.key} href={mod.href} className="group block">
            <Glass
              glow={mod.accent}
              className="p-6 flex flex-col gap-4 h-full group-hover:scale-[1.005] transition-transform"
            >
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `rgba(${mod.accentRgb},0.10)`,
                      border: `1px solid rgba(${mod.accentRgb},0.28)`,
                      boxShadow: `0 0 14px rgba(${mod.accentRgb},0.18)`,
                    }}
                  >
                    <mod.icon className="w-4 h-4" style={{ color: mod.accent }} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold tracking-widest uppercase opacity-90"
                      style={{ color: mod.accent }}
                    >
                      {mod.label}
                    </p>
                    <h3 className="text-[14px] font-semibold leading-tight text-white">
                      {mod.title}
                    </h3>
                  </div>
                </div>
                <span
                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                  style={{
                    background: `rgba(${mod.accentRgb},0.12)`,
                    border: `1px solid rgba(${mod.accentRgb},0.30)`,
                    color: mod.accent,
                    boxShadow: `0 0 8px rgba(${mod.accentRgb},0.20)`,
                  }}
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
              <p className="text-[12px] leading-relaxed" style={{ color: "rgba(148,163,184,0.72)" }}>
                {mod.desc}
              </p>

              {/* Hover shimmer */}
              <div
                className="h-px w-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg,transparent,${mod.accent},transparent)` }}
              />
            </Glass>
          </Link>
        ))}
      </div>
    </div>
  );
}