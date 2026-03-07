"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen, Code2, ListTodo, MessageSquare,
  Settings, FileText, Clock,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { projectsApi, dashboardApi, type DashboardStats } from "@/lib/api";

/* ── Glass card helper ─────────────────────────────────────────────────── */
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

/* ── Activity icon + color helper ──────────────────────────────────────── */
const ACTIVITY_META: Record<string, { icon: React.ComponentType<any>; accent: string }> = {
  document: { icon: BookOpen,       accent: "#38BDF8" },
  insight:  { icon: Code2,          accent: "#FFD700" },
  task:     { icon: ListTodo,       accent: "#a78bfa" },
  chat:     { icon: MessageSquare,  accent: "#34d399" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ── Component ─────────────────────────────────────────────────────────── */
export default function DashboardLeftPanel() {
  const { data: session } = useSession();
  const [projectCount, setProjectCount] = useState<number>(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    projectsApi.list()
      .then((data: any) => setProjectCount(data.projects?.length ?? 0))
      .catch(() => {});

    dashboardApi.stats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const userName    = session?.user?.name ?? "You";
  const userInitial = userName[0]?.toUpperCase() ?? "U";

  const STAT_ITEMS = [
    { icon: FileText,       label: "Documents",  value: stats?.total_documents ?? 0, color: "#38BDF8" },
    { icon: Code2,          label: "Insights",    value: stats?.total_insights ?? 0,  color: "#FFD700" },
    { icon: ListTodo,       label: "Tasks",       value: stats?.total_tasks ?? 0,     color: "#a78bfa" },
    { icon: MessageSquare,  label: "Chats",       value: stats?.total_chats ?? 0,     color: "#34d399" },
  ];

  return (
    <>
      <div
        className="relative z-10 flex flex-col w-[300px] shrink-0 overflow-y-auto py-7 px-5 gap-5 border-r"
        style={{
          background: "rgba(6,11,25,0.60)",
          backdropFilter: "blur(28px)",
          borderColor: "rgba(255,255,255,0.06)",
          scrollbarWidth: "none",
        } as React.CSSProperties}
      >
        {/* ── User card ───────────────────────────────────────────────── */}
        <Glass className="p-5 flex flex-col items-center text-center gap-3" glow="#FFD700">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg,#FFD700,#f59e0b)",
              color: "#060B19",
              boxShadow: "0 0 28px rgba(255,215,0,0.32)",
            }}
          >
            {userInitial}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">{userName}</p>
            <p className="text-[11px] truncate max-w-[200px]" style={{ color: "rgba(148,163,184,0.65)" }}>
              {session?.user?.email ?? ""}
            </p>
          </div>
          <div className="w-full grid grid-cols-2 gap-2 mt-1">
            {[
              { label: "Projects", value: projectCount, color: "#38BDF8" },
              { label: "Context",  value: "Live",       color: "#34d399" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl py-2 px-3 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-[16px] font-bold" style={{ color }}>{value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(148,163,184,0.60)" }}>{label}</p>
              </div>
            ))}
          </div>
        </Glass>

        {/* ── Context Stats ───────────────────────────────────────────── */}
        <Glass className="p-5">
          <p className="text-[12px] font-semibold text-white mb-4">Context Overview</p>
          <div className="grid grid-cols-2 gap-3">
            {STAT_ITEMS.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}14`, border: `1px solid ${color}28` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white leading-none">{value}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: "rgba(148,163,184,0.55)" }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </Glass>

        {/* ── Recent Activity ─────────────────────────────────────────── */}
        <Glass className="p-5 flex flex-col gap-0.5 flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5" style={{ color: "rgba(148,163,184,0.55)" }} />
            <p className="text-[12px] font-semibold text-white">Recent Activity</p>
          </div>
          {!stats || stats.recent_activity.length === 0 ? (
            <p className="text-[11px] text-center py-6" style={{ color: "rgba(148,163,184,0.45)" }}>
              No activity yet — start by creating a project.
            </p>
          ) : (
            <div className="space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
              {stats.recent_activity.map((item) => {
                const meta = ACTIVITY_META[item.type] ?? ACTIVITY_META.document;
                const Icon = meta.icon;
                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/projects/${item.project_id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/[0.03]"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${meta.accent}14`,
                        border: `1px solid ${meta.accent}28`,
                        boxShadow: `0 0 8px ${meta.accent}18`,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: meta.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-white truncate">{item.label}</p>
                      <p className="text-[9px] truncate" style={{ color: "rgba(148,163,184,0.48)" }}>
                        {item.project_name} · {timeAgo(item.created_at)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Glass>

        {/* ── Quick actions ───────────────────────────────────────────── */}
        <Glass className="p-4 flex items-center justify-center">
          <Link href="/dashboard/settings" className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
              style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.18)" }}
            >
              <Settings className="w-4 h-4" style={{ color: "rgba(148,163,184,0.70)" }} />
            </div>
            <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.60)" }}>Settings</span>
          </Link>
        </Glass>
      </div>
    </>
  );
}
