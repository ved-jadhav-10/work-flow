"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Code2,
  Loader2,
  AlertCircle,
  Cpu,
  Bug,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  Zap,
  Clock,
  History,
  Plus,
  Trash2,
} from "lucide-react";
import { developerApi } from "@/lib/api";
import GlassCard from "@/components/ui/GlassCard";

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface CodeComponent {
  name: string;
  purpose: string;
  lines?: string;
}

interface BugItem {
  description: string;
  severity: "critical" | "warning" | "info";
  line_hint?: string;
  fix?: string;
}

interface Inefficiency {
  description: string;
  suggestion: string;
}

type ActiveResult =
  | { type: "explain"; id: string; language: string; overview: string; components: CodeComponent[]; patterns: string[]; complexity: string; truncated: boolean; created_at: string }
  | { type: "debug"; id: string; language: string; bugs: BugItem[]; edge_cases: string[]; inefficiencies: Inefficiency[]; truncated: boolean; created_at: string }
  | { type: "readme"; id: string; language: string; readme: string; truncated: boolean; created_at: string };

interface HistoryItem {
  id: string;
  insight_type: string;
  language: string;
  overview: string;
  created_at: string;
}

const LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C", "Go",
  "Rust", "Ruby", "PHP", "Swift", "Kotlin", "C#", "SQL", "Bash", "Other",
];

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function SeverityBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border border-red-500/40",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40",
    info: "bg-blue-500/20 text-blue-400 border border-blue-500/40",
  };
  const Icon = s === "critical" ? AlertTriangle : s === "warning" ? AlertTriangle : Info;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[s] ?? map.info}`}>
      <Icon className="w-3 h-3" /> {s}
    </span>
  );
}

function InsightTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    explain: "bg-indigo-500/20 text-indigo-400",
    debug: "bg-red-500/20 text-red-400",
    readme: "bg-emerald-500/20 text-emerald-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[type] ?? "bg-gray-700 text-gray-300"}`}>
      {type}
    </span>
  );
}

function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-800/60 hover:bg-gray-800 transition-colors text-left"
      >
        {icon}
        <span className="font-medium text-sm flex-1">{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {open && <div className="p-4 bg-gray-900/40">{children}</div>}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function DeveloperPage() {
  const params = useParams();
  const projectId = (params?.id ?? "") as string;

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");

  const [loadingExplain, setLoadingExplain] = useState(false);
  const [loadingDebug, setLoadingDebug] = useState(false);
  const [loadingReadme, setLoadingReadme] = useState(false);

  const [result, setResult] = useState<ActiveResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const lineCount = code.split("\n").length;
  const isLong = lineCount > 600;

  // ── Load history ──────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const data: any = await developerApi.listInsights(projectId);
      setHistory(data.insights ?? []);
    } catch {
      /* non-fatal */
    } finally {
      setLoadingHistory(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Actions ───────────────────────────────────────────────────────────────

  function validate() {
    if (!code.trim()) {
      setError("Please paste some code before running an analysis.");
      return false;
    }
    setError("");
    return true;
  }

  async function runExplain() {
    if (!validate()) return;
    try {
      setLoadingExplain(true);
      const data: any = await developerApi.explain(projectId, { code, language });
      setResult({ type: "explain", ...data });
      setHistory((h) => [
        { id: data.id, insight_type: "explain", language, overview: data.overview, created_at: data.created_at },
        ...h,
      ]);
    } catch (e: any) {
      setError(e.message || "Explanation failed");
    } finally {
      setLoadingExplain(false);
    }
  }

  async function runDebug() {
    if (!validate()) return;
    try {
      setLoadingDebug(true);
      const data: any = await developerApi.debug(projectId, { code, language });
      setResult({ type: "debug", ...data });
      setHistory((h) => [
        {
          id: data.id,
          insight_type: "debug",
          language,
          overview: `${data.bugs?.length ?? 0} bug(s) found`,
          created_at: data.created_at,
        },
        ...h,
      ]);
    } catch (e: any) {
      setError(e.message || "Debug analysis failed");
    } finally {
      setLoadingDebug(false);
    }
  }

  async function runReadme() {
    if (!validate()) return;
    try {
      setLoadingReadme(true);
      const data: any = await developerApi.readme(projectId, { code, language });
      setResult({ type: "readme", ...data });
      setHistory((h) => [
        { id: data.id, insight_type: "readme", language, overview: "README generated", created_at: data.created_at },
        ...h,
      ]);
    } catch (e: any) {
      setError(e.message || "README generation failed");
    } finally {
      setLoadingReadme(false);
    }
  }

  async function copyReadme(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDeleteInsight(id: string) {
    try {
      await developerApi.deleteInsight(projectId, id);
      setHistory((h) => h.filter((item) => item.id !== id));
      if ((result as any)?.id === id) setResult(null);
    } catch (e: any) {
      setError(e.message || "Delete failed");
    }
  }

  const anyLoading = loadingExplain || loadingDebug || loadingReadme;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Code2 className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-bold">EasyCode</h1>
      </div>
      <p className="text-muted text-sm mb-6">
        Paste code to get AI-powered explanations, debugging, and README generation.
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl px-4 py-3 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            className="ml-auto text-red-200 hover:text-red-50"
            onClick={() => setError("")}
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: History ──────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white/80">
            <History className="w-4 h-4" /> History
          </div>

          {loadingHistory ? (
            <div className="flex items-center gap-2 text-muted-2 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : history.length === 0 ? (
            <p className="text-muted-2 text-sm py-4 text-center">
              No analyses yet — run one on the right.
            </p>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="group bg-surface-2 border border-border hover:border-white/20 rounded-2xl p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <InsightTypeBadge type={h.insight_type} />
                    <span className="text-xs text-muted-2">{h.language}</span>
                    <button
                      onClick={() => handleDeleteInsight(h.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-300 transition-all"
                      title="Delete insight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-white/80 truncate">{h.overview || "—"}</p>
                  <p className="text-xs text-muted-2 mt-1">
                    {new Date(h.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Input + Results ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Code input */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-surface-2 border border-border text-sm rounded-xl px-3 py-2 text-white/90 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l} className="bg-[#1a1a2e] text-white">
                    {l}
                  </option>
                ))}
              </select>
              <span
                className={`text-xs ${isLong ? "text-yellow-300" : "text-muted-2"}`}
              >
                {lineCount} line{lineCount !== 1 ? "s" : ""}
                {isLong && " · first 600 will be analysed"}
              </span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here…"
              spellCheck={false}
              className="w-full h-72 bg-surface-2 border border-border rounded-2xl p-4 text-sm font-mono text-white/90 resize-y focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 placeholder:text-muted-2"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={runExplain}
                disabled={anyLoading}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {loadingExplain ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Cpu className="w-4 h-4" />
                )}
                Explain
              </button>

              <button
                onClick={runDebug}
                disabled={anyLoading}
                className="flex items-center gap-2 px-5 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {loadingDebug ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bug className="w-4 h-4" />
                )}
                Debug
              </button>

              <button
                onClick={runReadme}
                disabled={anyLoading}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {loadingReadme ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                Generate README
              </button>

              {result && (
                <button
                  onClick={() => {
                    setResult(null);
                    setCode("");
                  }}
                  className="ml-auto flex items-center gap-1 px-3 py-2 text-xs text-white/70 hover:text-white border border-border hover:border-white/20 rounded-xl transition-colors"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              )}
            </div>
          </GlassCard>

          {/* Loading placeholder */}
          {anyLoading && !result && (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-400 border border-dashed border-gray-700 rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Analysing with AI…</span>
            </div>
          )}

          {/* ── Explain result ────────────────────────────────────────── */}
          {result?.type === "explain" && (
            <div className="space-y-3">
              {result.truncated && (
                <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Code was truncated to 600 lines for analysis.
                </div>
              )}

              <Section
                title="Overview"
                icon={<Cpu className="w-4 h-4 text-indigo-400" />}
              >
                <p className="text-sm text-gray-300 leading-relaxed">
                  {result.overview}
                </p>
              </Section>

              <Section
                title={`Components (${result.components.length})`}
                icon={<Code2 className="w-4 h-4 text-indigo-300" />}
              >
                {result.components.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No components identified.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 border-b border-gray-700 text-left">
                          <th className="pb-2 pr-4 font-medium">Name</th>
                          <th className="pb-2 pr-4 font-medium">Purpose</th>
                          <th className="pb-2 font-medium">Lines</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {result.components.map((c, i) => (
                          <tr key={i}>
                            <td className="py-2 pr-4 font-mono text-indigo-300 whitespace-nowrap">
                              {c.name}
                            </td>
                            <td className="py-2 pr-4 text-gray-300">
                              {c.purpose}
                            </td>
                            <td className="py-2 text-gray-500 whitespace-nowrap">
                              {c.lines ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>

              <Section
                title={`Patterns (${result.patterns.length})`}
                icon={<Zap className="w-4 h-4 text-yellow-400" />}
                defaultOpen={false}
              >
                {result.patterns.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No specific patterns identified.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {result.patterns.map((p, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-full text-xs"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              <Section
                title="Complexity"
                icon={<Clock className="w-4 h-4 text-purple-400" />}
                defaultOpen={false}
              >
                <p className="text-sm font-mono text-purple-300">
                  {result.complexity || "N/A"}
                </p>
              </Section>
            </div>
          )}

          {/* ── Debug result ──────────────────────────────────────────── */}
          {result?.type === "debug" && (
            <div className="space-y-3">
              {result.truncated && (
                <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Code was truncated to 600 lines for analysis.
                </div>
              )}

              <Section
                title={`Bugs (${result.bugs.length})`}
                icon={<Bug className="w-4 h-4 text-red-400" />}
              >
                {result.bugs.length === 0 ? (
                  <p className="text-sm text-emerald-400">✓ No bugs found.</p>
                ) : (
                  <div className="space-y-3">
                    {result.bugs.map((b, i) => (
                      <div
                        key={i}
                        className="bg-gray-900/60 border border-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-sm text-gray-200">{b.description}</p>
                          <SeverityBadge s={b.severity} />
                        </div>
                        {b.line_hint && (
                          <p className="text-xs text-gray-500 mb-1">
                            📍 {b.line_hint}
                          </p>
                        )}
                        {b.fix && (
                          <pre className="text-xs font-mono bg-gray-950 text-emerald-300 rounded p-2 mt-2 overflow-x-auto whitespace-pre-wrap">
                            💡 {b.fix}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section
                title={`Edge Cases (${result.edge_cases.length})`}
                icon={<AlertTriangle className="w-4 h-4 text-yellow-400" />}
                defaultOpen={false}
              >
                {result.edge_cases.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No unhandled edge cases identified.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {result.edge_cases.map((ec, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-300 flex items-start gap-2"
                      >
                        <span className="text-yellow-500 mt-0.5">⚠</span> {ec}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section
                title={`Inefficiencies (${result.inefficiencies.length})`}
                icon={<Zap className="w-4 h-4 text-orange-400" />}
                defaultOpen={false}
              >
                {result.inefficiencies.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No inefficiencies detected.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {result.inefficiencies.map((inef, i) => (
                      <div
                        key={i}
                        className="bg-gray-900/60 border border-gray-700 rounded-lg p-3"
                      >
                        <p className="text-sm text-gray-300 mb-1">
                          {inef.description}
                        </p>
                        <p className="text-xs text-orange-300">
                          💡 {inef.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* ── README result ─────────────────────────────────────────── */}
          {result?.type === "readme" && (
            <div className="space-y-3">
              {result.truncated && (
                <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Code was truncated to 600 lines for README generation.
                </div>
              )}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold">Generated README.md</h3>
                  </div>
                  <button
                    onClick={() => copyReadme(result.readme)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy Markdown"}
                  </button>
                </div>
                <pre className="text-sm text-gray-300 font-mono bg-gray-900/60 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                  {result.readme}
                </pre>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!result && !anyLoading && (
            <div className="border border-dashed border-white/15 rounded-2xl p-12 text-center text-muted-2 bg-surface-2 backdrop-blur-sm">
              <Code2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>
                Paste code above and click{" "}
                <strong className="text-white/70">Explain</strong>,{" "}
                <strong className="text-white/70">Debug</strong>, or{" "}
                <strong className="text-white/70">Generate README</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
