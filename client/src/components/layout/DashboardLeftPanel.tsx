"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen, AlertTriangle, ListTodo, GitBranch, Bot,
  TrendingUp, Database, Zap, Settings,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { projectsApi } from "@/lib/api";

/* ── Keyframes ─────────────────────────────────────────────────────────── */
const CSS_KEYFRAMES = `
@keyframes floatY {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-5px); }
}
@keyframes barBloom {
  0%   { filter: brightness(1); }
  50%  { filter: brightness(1.35) saturate(1.4); }
  100% { filter: brightness(1); }
}
`;

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

/* ── Static data ───────────────────────────────────────────────────────── */
const CHART_WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"];
const CHART_DATA = [
  { docs: 30, code: 20, tasks: 15 },
  { docs: 45, code: 30, tasks: 25 },
  { docs: 40, code: 55, tasks: 30 },
  { docs: 60, code: 45, tasks: 40 },
  { docs: 50, code: 60, tasks: 50 },
  { docs: 75, code: 50, tasks: 45 },
  { docs: 65, code: 70, tasks: 60 },
];

const RECENT_AI = [
  { label: "Summarised 3 PDFs",             icon: BookOpen,      accent: "#38BDF8", time: "2h ago" },
  { label: "Bug found in auth.py",           icon: AlertTriangle, accent: "#FFD700", time: "4h ago" },
  { label: "7 tasks extracted from meeting", icon: ListTodo,      accent: "#a78bfa", time: "6h ago" },
  { label: "README generated for API",       icon: GitBranch,     accent: "#FFD700", time: "1d ago" },
  { label: "RAG query answered",             icon: Bot,           accent: "#34d399", time: "1d ago" },
];

/* ── Component ─────────────────────────────────────────────────────────── */
export default function DashboardLeftPanel() {
  const { data: session } = useSession();
  const [projectCount, setProjectCount] = useState<number>(0);

  useEffect(() => {
    projectsApi.list()
      .then((data: any) => setProjectCount(data.projects?.length ?? 0))
      .catch(() => {});
  }, []);

  const userName    = session?.user?.name ?? "You";
  const userInitial = userName[0]?.toUpperCase() ?? "U";

  return (
    <>
      <style>{CSS_KEYFRAMES}</style>
      <div
        className="relative z-10 flex flex-col w-[300px] shrink-0 overflow-y-auto py-7 px-5 gap-5 border-r"
        style={{
          background: "rgba(6,11,25,0.60)",
          backdropFilter: "blur(28px)",
          borderColor: "rgba(255,255,255,0.06)",
          scrollbarWidth: "none",
        } as React.CSSProperties}
      >
        {/* User card */}
        <Glass className="p-5 flex flex-col items-center text-center gap-3" glow="#FFD700">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg,#FFD700,#f59e0b)",
              color: "#060B19",
              boxShadow: "0 0 28px rgba(255,215,0,0.32)",
              fontFamily: "var(--font-playfair), serif",
              animation: "floatY 5s ease-in-out infinite",
            }}
          >
            {userInitial}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
              {userName}
            </p>
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

        {/* Context Health chart */}
        <Glass className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[12px] font-semibold text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Context Health
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(148,163,184,0.60)" }}>Data ingestion this week</p>
            </div>
            <TrendingUp className="w-4 h-4" style={{ color: "#38BDF8" }} />
          </div>
          <div className="flex items-end gap-1.5 h-[80px] mb-2">
            {CHART_DATA.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${d.docs * 0.5}px`,
                    background: "linear-gradient(to top,rgba(56,189,248,0.4),rgba(56,189,248,0.75))",
                    boxShadow: i === 6 ? "0 0 10px rgba(56,189,248,0.45)" : "none",
                    animation: i === 6 ? "barBloom 2.5s ease infinite" : "none",
                  }}
                />
                <div className="w-full rounded-sm" style={{ height: `${d.code * 0.3}px`, background: "linear-gradient(to top,rgba(255,215,0,0.35),rgba(255,215,0,0.65))" }} />
                <div className="w-full rounded-sm" style={{ height: `${d.tasks * 0.25}px`, background: "linear-gradient(to top,rgba(167,139,250,0.35),rgba(167,139,250,0.60))" }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            {CHART_WEEKS.map((w) => (
              <p key={w} className="flex-1 text-center text-[9px]" style={{ color: "rgba(148,163,184,0.40)" }}>{w}</p>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            {[
              { color: "rgba(56,189,248,0.75)",  label: "Docs"  },
              { color: "rgba(255,215,0,0.65)",   label: "Code"  },
              { color: "rgba(167,139,250,0.65)", label: "Tasks" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: color }} />
                <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.60)" }}>{label}</span>
              </div>
            ))}
          </div>
        </Glass>

        {/* Recent AI Decisions */}
        <Glass className="p-5 flex flex-col gap-0.5">
          <p className="text-[12px] font-semibold text-white mb-3" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Recent AI Decisions
          </p>
          {RECENT_AI.map(({ label, icon: Icon, accent, time }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/[0.03]"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${accent}14`, border: `1px solid ${accent}28`, boxShadow: `0 0 8px ${accent}18` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white truncate">{label}</p>
                <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.48)" }}>{time}</p>
              </div>
            </div>
          ))}
        </Glass>

        {/* Quick actions */}
        <Glass className="p-4 flex items-center justify-around">
          {[
            { icon: Database, label: "Context",   color: "#38BDF8",             href: undefined },
            { icon: Zap,      label: "Inference",  color: "#FFD700",             href: undefined },
            { icon: Settings, label: "Settings",   color: "rgba(148,163,184,0.70)", href: "/dashboard/settings" },
          ].map(({ icon: Icon, label, color, href }) => {
            const el = (
              <div key={label} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.60)" }}>{label}</span>
              </div>
            );
            return href ? <Link key={label} href={href}>{el}</Link> : el;
          })}
        </Glass>
      </div>
    </>
  );
}
