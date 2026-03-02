"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  ListTodo,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
  Lock,
} from "lucide-react";

const INFERENCE_MODE_KEY = "inference_mode";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: LayoutDashboard, exact: true },
];

const PROJECT_NAV_ITEMS = (projectId: string) => [
  { href: `/dashboard/projects/${projectId}`, label: "Overview", icon: LayoutDashboard, exact: true },
  { href: `/dashboard/projects/${projectId}/learning`, label: "Learning", icon: BookOpen },
  { href: `/dashboard/projects/${projectId}/developer`, label: "Developer", icon: Code2 },
  { href: `/dashboard/projects/${projectId}/workflow`, label: "Workflow", icon: ListTodo },
  { href: `/dashboard/projects/${projectId}/chat`, label: "Chat", icon: MessageSquare },
];

interface SidebarProps {
  projectId?: string;
}

export default function Sidebar({ projectId: propProjectId }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    const read = () =>
      setIsLocalMode(localStorage.getItem(INFERENCE_MODE_KEY) === "local");
    read();
    window.addEventListener("inferenceModeChanged", read);
    return () => window.removeEventListener("inferenceModeChanged", read);
  }, []);

  // Auto-detect projectId from URL: /dashboard/projects/<uuid>/...
  const projectId = propProjectId ?? (() => {
    const match = pathname?.match(/\/dashboard\/projects\/([^/]+)/);
    const id = match?.[1];
    return id && id !== "new" ? id : undefined;
  })();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <aside
      className="relative z-10 w-60 min-h-screen flex flex-col border-r backdrop-blur-2xl"
      style={{ background: "rgba(6,11,25,0.68)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#FFD700,#f59e0b)", boxShadow: "0 0 14px rgba(255,215,0,0.30)" }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#060B19" }} />
          </div>
          <span className="font-bold text-white text-[17px] tracking-wide select-none" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Workflow<span style={{ color: "#FFD700" }}>.</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {/* Top-level nav */}
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
              isActive(item.href, item.exact)
                ? "text-white"
                : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]"
            }`}
            style={
              isActive(item.href, item.exact)
                ? { background: "rgba(255,215,0,0.10)", borderColor: "rgba(255,215,0,0.30)", boxShadow: "0 0 12px rgba(255,215,0,0.14)" }
                : {}
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}

        {/* Project-level nav — only shown when inside a project */}
        {projectId && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                Current Project
              </p>
            </div>
            {PROJECT_NAV_ITEMS(projectId).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  isActive(item.href, item.exact)
                    ? "text-white"
                    : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
                style={
                  isActive(item.href, item.exact)
                    ? { background: "rgba(255,215,0,0.10)", borderColor: "rgba(255,215,0,0.30)", boxShadow: "0 0 12px rgba(255,215,0,0.14)" }
                    : {}
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {/* Privacy Mode badge */}
        {isLocalMode && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium text-emerald-400">Privacy Mode</span>
          </div>
        )}
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        {/* User info */}
        {session?.user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? ""}
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-white">
                {session.user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-white/40 truncate">{session.user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
