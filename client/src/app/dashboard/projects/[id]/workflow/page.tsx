"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ListTodo,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronDown,
  Zap,
  Mail,
  Mic,
  Flag,
  Clock,
  User,
  BarChart3,
  Pencil,
  Check,
  X,
  Plus,
  Clipboard,
  Brain,
  StickyNote,
  ArrowUpDown,
  Lightbulb,
  GitBranch,
  RefreshCw,
} from "lucide-react";
import { workflowApi } from "@/lib/api";

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Task {
  id: string;
  project_id: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "done";
  source_text: string | null;
  created_at: string;
}

interface TaskListResponse {
  tasks: Task[];
  total: number;
  by_priority: { high: number; medium: number; low: number };
  by_status: { pending: number; done: number };
}

interface ExtractResponse {
  tasks: Task[];
  extracted_count: number;
  truncated: boolean;
  source_type: string;
}

interface ReprioritizeSuggestion {
  task_id: string;
  current_priority: string;
  suggested_priority: string;
  reason: string;
}

interface PracticalSuggestion {
  task_description: string;
  suggestion: string;
  type: "breakdown" | "dependency" | "improvement";
}

interface AnalyzeResponse {
  reprioritizations: ReprioritizeSuggestion[];
  suggestions: PracticalSuggestion[];
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    high: "bg-red-500/20 text-red-400 border border-red-500/40",
    medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40",
    low: "bg-blue-500/20 text-blue-400 border border-blue-500/40",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        map[p] ?? "bg-gray-700 text-gray-300"
      }`}
    >
      <Flag className="w-3 h-3" />
      {p}
    </span>
  );
}

function parseHints(sourceText: string | null) {
  if (!sourceText) return { assignee: null, deadline: null };
  const assigneeMatch = sourceText.match(/\[assignee: ([^\]]+)\]/);
  const deadlineMatch = sourceText.match(/\[deadline: ([^\]]+)\]/);
  return {
    assignee: assigneeMatch ? assigneeMatch[1] : null,
    deadline: deadlineMatch ? deadlineMatch[1] : null,
  };
}

/* ── Task Card ─────────────────────────────────────────────────────────────── */

function TaskCard({
  task,
  onToggle,
  onUpdatePriority,
  onUpdateDescription,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string, current: "pending" | "done") => void;
  onUpdatePriority: (id: string, priority: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.description);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { assignee, deadline } = parseHints(task.source_text);

  function handleSaveEdit() {
    if (editValue.trim() && editValue.trim() !== task.description) {
      onUpdateDescription(task.id, editValue.trim());
    }
    setEditing(false);
  }

  return (
    <div
      className={`group flex gap-3 p-4 rounded-xl border transition-all ${
        task.status === "done"
          ? "border-border bg-surface-2 opacity-60"
          : "border-border bg-surface-2 hover:border-border-strong"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, task.status)}
        className="mt-0.5 shrink-0 text-gray-400 hover:text-emerald-400 transition-colors"
        title={task.status === "done" ? "Mark as pending" : "Mark as done"}
      >
        {task.status === "done" ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
            />
            <button
              onClick={handleSaveEdit}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditing(false); setEditValue(task.description); }}
              className="p-1.5 rounded-xl bg-surface-2 text-white/60 hover:bg-surface-3 border border-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p
            className={`text-sm leading-relaxed ${
              task.status === "done" ? "line-through text-muted-2" : "text-white/90"
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Hints */}
        {(assignee || deadline) && (
          <div className="flex flex-wrap gap-3 mt-2">
            {assignee && (
              <span className="flex items-center gap-1 text-xs text-muted-2">
                <User className="w-3 h-3" /> {assignee}
              </span>
            )}
            {deadline && (
              <span className="flex items-center gap-1 text-xs text-muted-2">
                <Clock className="w-3 h-3" /> {deadline}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-start gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Priority picker */}
        <div className="relative">
          <button
            onClick={() => setShowPriorityMenu((v) => !v)}
            className="p-1.5 rounded-xl hover:bg-white/6 transition-colors"
            title="Change priority"
          >
            <ChevronDown className="w-4 h-4 text-white/60" />
          </button>
          {showPriorityMenu && (
            <div className="absolute right-0 top-8 z-10 bg-surface border border-border rounded-2xl shadow-xl py-1 min-w-25 backdrop-blur-md">
              {(["high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onUpdatePriority(task.id, p);
                    setShowPriorityMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/6 transition-colors flex items-center gap-2 ${
                    task.priority === p ? "text-white font-medium" : "text-white/70"
                  }`}
                >
                  <Flag className="w-3 h-3" /> {p}
                  {task.priority === p && <Check className="w-3 h-3 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit */}
        <button
          onClick={() => { setEditing(true); setShowPriorityMenu(false); }}
          className="p-1.5 rounded-xl hover:bg-white/6 transition-colors"
          title="Edit description"
        >
          <Pencil className="w-4 h-4 text-white/60" />
        </button>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
              title="Confirm delete"
            >
              <Check className="w-4 h-4 text-red-400" />
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="p-1.5 rounded-xl hover:bg-white/6 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-xl hover:bg-white/6 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4 text-white/60 hover:text-red-300" />
          </button>
        )}
      </div>

      {/* Priority badge (always visible) */}
      <div className="shrink-0 mt-0.5">
        <PriorityBadge p={task.priority} />
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */

export default function WorkflowPage() {
  const params = useParams();
  const projectId = (params?.id ?? "") as string;

  const [text, setText] = useState("");
  const [sourceType, setSourceType] = useState<"transcript" | "email" | "notes">("transcript");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    by_priority: { high: 0, medium: 0, low: 0 },
    by_status: { pending: 0, done: 0 },
  });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [lastExtracted, setLastExtracted] = useState<{
    count: number;
    truncated: boolean;
  } | null>(null);

  /* New state */
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [addingTask, setAddingTask] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "done">("all");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);

  // ── Load tasks ────────────────────────────────────────────────────────────

  const loadTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const data = (await workflowApi.listTasks(projectId)) as TaskListResponse;
      setTasks(data.tasks ?? []);
      setStats({
        total: data.total,
        by_priority: data.by_priority ?? { high: 0, medium: 0, low: 0 },
        by_status: data.by_status ?? { pending: 0, done: 0 },
      });
    } catch {
      /* non-fatal */
    } finally {
      setLoadingTasks(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ── Extract tasks ─────────────────────────────────────────────────────────

  async function handleExtract() {
    if (!text.trim()) {
      setError("Please paste a transcript or email before extracting.");
      return;
    }
    setError("");
    try {
      setExtracting(true);
      const data = (await workflowApi.extractTasks(projectId, {
        text,
        source_type: sourceType,
      })) as ExtractResponse;

      setLastExtracted({ count: data.extracted_count, truncated: data.truncated });

      // Reload tasks to get fresh list with correct counts
      await loadTasks();
    } catch (e: any) {
      setError(e.message || "Task extraction failed. Please try again.");
    } finally {
      setExtracting(false);
    }
  }

  // ── Task mutations ────────────────────────────────────────────────────────

  async function handleToggle(id: string, current: "pending" | "done") {
    const newStatus = current === "done" ? "pending" : "done";
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    setStats((s) => ({
      ...s,
      by_status: {
        pending: s.by_status.pending + (newStatus === "pending" ? 1 : -1),
        done: s.by_status.done + (newStatus === "done" ? 1 : -1),
      },
    }));
    try {
      await workflowApi.updateTask(projectId, id, { status: newStatus });
    } catch {
      // Revert
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: current } : t))
      );
      setStats((s) => ({
        ...s,
        by_status: {
          pending: s.by_status.pending + (current === "pending" ? 1 : -1),
          done: s.by_status.done + (current === "done" ? 1 : -1),
        },
      }));
    }
  }

  async function handleUpdatePriority(id: string, priority: string) {
    const prevTask = tasks.find((t) => t.id === id);
    const prevPriority = prevTask?.priority;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, priority: priority as Task["priority"] } : t
      )
    );
    try {
      await workflowApi.updateTask(projectId, id, { priority });
    } catch {
      if (prevPriority) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, priority: prevPriority } : t
          )
        );
      }
    }
  }

  async function handleUpdateDescription(id: string, description: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, description } : t))
    );
    try {
      await workflowApi.updateTask(projectId, id, { description });
    } catch (e: any) {
      setError(e.message || "Failed to update task");
      await loadTasks();
    }
  }

  async function handleDelete(id: string) {
    const deleted = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (deleted) {
      setStats((s) => ({
        total: Math.max(0, s.total - 1),
        by_priority: {
          ...s.by_priority,
          [deleted.priority]: Math.max(0, (s.by_priority[deleted.priority] ?? 0) - 1),
        },
        by_status: {
          ...s.by_status,
          [deleted.status]: Math.max(0, (s.by_status[deleted.status] ?? 0) - 1),
        },
      }));
    }
    try {
      await workflowApi.deleteTask(projectId, id);
    } catch {
      await loadTasks();
    }
  }

  // ── Manual task creation ──────────────────────────────────────────────────

  async function handleAddTask() {
    if (!newTaskDesc.trim()) return;
    setAddingTask(true);
    try {
      await workflowApi.createTask(projectId, {
        description: newTaskDesc.trim(),
        priority: newTaskPriority,
      });
      setNewTaskDesc("");
      setNewTaskPriority("medium");
      setShowAddForm(false);
      await loadTasks();
    } catch (e: any) {
      setError(e.message || "Failed to create task");
    } finally {
      setAddingTask(false);
    }
  }

  // ── AI Analysis ───────────────────────────────────────────────────────────

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const data = (await workflowApi.analyzeTasks(projectId)) as AnalyzeResponse;
      setAnalysis(data);
    } catch (e: any) {
      setError(e.message || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Export as markdown ────────────────────────────────────────────────────

  function handleExport() {
    const lines: string[] = ["# Tasks\n"];
    for (const p of ["high", "medium", "low"] as const) {
      const group = tasks.filter((t) => t.priority === p);
      if (group.length === 0) continue;
      lines.push(`## ${p.charAt(0).toUpperCase() + p.slice(1)} Priority\n`);
      for (const t of group) {
        const check = t.status === "done" ? "x" : " ";
        lines.push(`- [${check}] ${t.description}`);
      }
      lines.push("");
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  }

  // ── Apply reprioritisation suggestion ─────────────────────────────────────

  async function applyReprioritize(taskId: string, newPriority: string) {
    await handleUpdatePriority(taskId, newPriority);
    setAnalysis((prev) =>
      prev
        ? { ...prev, reprioritizations: prev.reprioritizations.filter((r) => r.task_id !== taskId) }
        : null
    );
  }

  // ── Group tasks by priority (with filter) ──────────────────────────────────

  const filteredTasks = filterTab === "all" ? tasks : tasks.filter((t) => t.status === filterTab);

  const grouped = (["high", "medium", "low"] as const).reduce(
    (acc, p) => {
      acc[p] = filteredTasks
        .filter((t) => t.priority === p)
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === "done" ? 1 : -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const charCount = text.length;
  const charLimit = 20000;
  const isOverLimit = charCount > charLimit;

  const progressPercent = stats.total > 0 ? Math.round((stats.by_status.done / stats.total) * 100) : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <ListTodo className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-bold">EasyAutomate</h1>
      </div>
      <p className="text-muted text-sm mb-8">
        Paste a meeting transcript or email thread to extract and manage actionable tasks.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── Left: Input Panel ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Source type toggle */}
          <div className="flex gap-2">
            {([
              { key: "transcript" as const, icon: Mic, label: "Transcript" },
              { key: "email" as const, icon: Mail, label: "Email" },
              { key: "notes" as const, icon: StickyNote, label: "Notes" },
            ]).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setSourceType(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  sourceType === key
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-surface-2 border-border text-white/70 hover:border-white/15"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                sourceType === "transcript"
                  ? "Paste your meeting transcript here…\n\nExample:\nAlice: We need to update the onboarding flow by Friday.\nBob: I'll handle the backend changes. Can someone review the designs?\nAlice: John, please review and send feedback by EOD tomorrow."
                  : sourceType === "email"
                  ? "Paste your email thread here…\n\nExample:\nFrom: Sarah\nTo: Team\n\nHi all, can you please update the API docs and deploy to staging by next Monday? Also, Bob please schedule a sync with the client."
                  : "Paste your notes here…\n\nExample:\n- Need to set up CI/CD pipeline for the new service\n- Research auth providers — decide between Auth0 and Clerk\n- Design review scheduled for Thursday, prepare mockups"
              }
              rows={16}
              className={`w-full bg-surface-2 border rounded-2xl px-4 py-3 text-sm text-white/90 placeholder:text-muted-2 resize-none focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-colors font-mono leading-relaxed ${
                isOverLimit ? "border-red-500/60" : "border-border"
              }`}
            />
            <div
              className={`absolute bottom-3 right-3 text-xs ${
                isOverLimit ? "text-red-300" : "text-white/40"
              }`}
            >
              {charCount.toLocaleString()} / {charLimit.toLocaleString()}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Extract button */}
          <button
            onClick={handleExtract}
            disabled={extracting || isOverLimit}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/10 border border-white/20 hover:bg-white/17 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-sm font-semibold transition-colors backdrop-blur-sm"
          >
            {extracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting tasks…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Extract Tasks
              </>
            )}
          </button>

          {/* Last extract result */}
          {lastExtracted && (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-sm text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Extracted <strong>{lastExtracted.count}</strong> task
                {lastExtracted.count !== 1 ? "s" : ""}.
                {lastExtracted.truncated && " (Input was truncated to fit context window.)"}
              </span>
            </div>
          )}

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="bg-surface border border-border rounded-2xl p-3 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 text-white/70 text-xs mb-1">
                <BarChart3 className="w-3 h-3" /> Total
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-3 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs mb-1">
                <CheckCircle2 className="w-3 h-3" /> Done
              </div>
              <div className="text-2xl font-bold text-white">{stats.by_status.done}</div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-3 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 text-yellow-400 text-xs mb-1">
                <Circle className="w-3 h-3" /> Pending
              </div>
              <div className="text-2xl font-bold text-white">{stats.by_status.pending}</div>
            </div>
          </div>

          {/* Priority breakdown */}
          {stats.total > 0 && (
            <div className="flex gap-4">
              {(["high", "medium", "low"] as const).map((p) => {
                const colorMap = {
                  high: "text-red-400",
                  medium: "text-yellow-400",
                  low: "text-blue-400",
                };
                return (
                  <div key={p} className="flex items-center gap-1.5 text-xs text-white/70">
                    <Flag className={`w-3 h-3 ${colorMap[p]}`} />
                    <span className={`font-medium ${colorMap[p]}`}>
                      {stats.by_priority[p] ?? 0}
                    </span>{" "}
                    {p}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Task List ──────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Progress bar */}
          {stats.total > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Progress</span>
                <span className="text-white font-medium">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-surface-2 border border-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-accent to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Toolbar: filter tabs + action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter tabs */}
            {(["all", "pending", "done"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  filterTab === tab
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-surface-2 border-border text-white/60 hover:border-white/15"
                }`}
              >
                {tab === "all" ? "All" : tab === "pending" ? "Pending" : "Done"}
                {tab === "all" && ` (${stats.total})`}
                {tab === "pending" && ` (${stats.by_status.pending})`}
                {tab === "done" && ` (${stats.by_status.done})`}
              </button>
            ))}

            <div className="flex-1" />

            {/* Add task */}
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/20 border border-accent/40 text-accent hover:bg-accent/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>

            {/* Export */}
            {tasks.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-2 border border-border text-white/60 hover:border-white/15 hover:text-white/80 transition-colors"
                title="Copy tasks as markdown"
              >
                {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                {copiedExport ? "Copied!" : "Export"}
              </button>
            )}

            {/* AI Analyze */}
            {stats.by_status.pending > 0 && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 transition-colors"
              >
                {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                {analyzing ? "Analyzing…" : "AI Analyze"}
              </button>
            )}
          </div>

          {/* Manual add task form */}
          {showAddForm && (
            <div className="flex gap-2 items-start bg-surface-2 border border-border rounded-2xl p-3">
              <input
                autoFocus
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleAddTask(); }}
                placeholder="Task description…"
                className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm text-white/90 placeholder:text-muted-2 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as "high" | "medium" | "low")}
                className="bg-surface border border-border rounded-xl px-2 py-2 text-xs text-white/80 focus:outline-none focus:border-accent/60"
              >
                <option value="high" className="bg-[#1a1a2e] text-white">High</option>
                <option value="medium" className="bg-[#1a1a2e] text-white">Medium</option>
                <option value="low" className="bg-[#1a1a2e] text-white">Low</option>
              </select>
              <button
                onClick={handleAddTask}
                disabled={addingTask || !newTaskDesc.trim()}
                className="px-3 py-2 rounded-xl bg-accent/20 border border-accent/40 text-accent text-sm font-medium hover:bg-accent/30 disabled:opacity-50 transition-colors"
              >
                {addingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewTaskDesc(""); }}
                className="px-2 py-2 rounded-xl bg-surface border border-border text-white/60 hover:bg-surface-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* AI Analysis Results */}
          {analysis && (analysis.reprioritizations.length > 0 || analysis.suggestions.length > 0) && (
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
                  <Brain className="w-4 h-4" /> AI Analysis
                </div>
                <button
                  onClick={() => setAnalysis(null)}
                  className="text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reprioritisations */}
              {analysis.reprioritizations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                    <ArrowUpDown className="w-3 h-3" /> Priority Suggestions
                  </div>
                  {analysis.reprioritizations.map((r, i) => {
                    const task = tasks.find((t) => t.id === r.task_id);
                    return (
                      <div key={i} className="flex items-start gap-3 bg-surface-2 rounded-xl p-3 text-xs">
                        <div className="flex-1 space-y-1">
                          <p className="text-white/80">{task?.description ?? r.task_id}</p>
                          <p className="text-white/50">{r.reason}</p>
                          <div className="flex items-center gap-2">
                            <PriorityBadge p={r.current_priority} />
                            <span className="text-white/40">→</span>
                            <PriorityBadge p={r.suggested_priority} />
                          </div>
                        </div>
                        <button
                          onClick={() => applyReprioritize(r.task_id, r.suggested_priority)}
                          className="shrink-0 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors text-xs font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Practical suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                    <Lightbulb className="w-3 h-3" /> Suggestions
                  </div>
                  {analysis.suggestions.map((s, i) => {
                    const typeIcon = s.type === "breakdown" ? <GitBranch className="w-3 h-3" /> : s.type === "dependency" ? <RefreshCw className="w-3 h-3" /> : <Lightbulb className="w-3 h-3" />;
                    const typeColor = s.type === "breakdown" ? "text-blue-400" : s.type === "dependency" ? "text-yellow-400" : "text-emerald-400";
                    return (
                      <div key={i} className="bg-surface-2 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={typeColor}>{typeIcon}</span>
                          <span className={`${typeColor} font-medium capitalize`}>{s.type}</span>
                          <span className="text-white/40">·</span>
                          <span className="text-white/60 truncate">{s.task_description}</span>
                        </div>
                        <p className="text-white/80 pl-5">{s.suggestion}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Task list */}
          {loadingTasks ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="border border-dashed border-white/15 rounded-2xl p-12 text-center bg-surface-2 backdrop-blur-sm">
              <ListTodo className="w-8 h-8 text-white/30 mx-auto mb-3" />
              <p className="text-muted-2 text-sm">
                No tasks yet. Paste a transcript or email and hit{" "}
                <strong className="text-white/70">Extract Tasks</strong>, or use{" "}
                <strong className="text-white/70">+ Add Task</strong> above.
              </p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="border border-dashed border-white/15 rounded-2xl p-8 text-center bg-surface-2 backdrop-blur-sm">
              <p className="text-muted-2 text-sm">
                No {filterTab} tasks.
              </p>
            </div>
          ) : (
            (["high", "medium", "low"] as const).map((priority) => {
              const group = grouped[priority];
              if (!group || group.length === 0) return null;
              const styleMap = {
                high: {
                  label: "High Priority",
                  border: "border-red-500/30",
                  text: "text-red-400",
                },
                medium: {
                  label: "Medium Priority",
                  border: "border-yellow-500/30",
                  text: "text-yellow-400",
                },
                low: {
                  label: "Low Priority",
                  border: "border-blue-500/30",
                  text: "text-blue-400",
                },
              };
              const s = styleMap[priority];
              return (
                <div key={priority}>
                  <div
                    className={`flex items-center gap-2 mb-3 pb-2 border-b ${s.border}`}
                  >
                    <Flag className={`w-4 h-4 ${s.text}`} />
                    <h3 className={`text-sm font-semibold ${s.text}`}>{s.label}</h3>
                    <span className="ml-auto text-xs text-gray-500">
                      {group.filter((t) => t.status === "done").length}/{group.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {group.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onUpdatePriority={handleUpdatePriority}
                        onUpdateDescription={handleUpdateDescription}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
