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
  by_priority: Record<string, number>;
  by_status: Record<string, number>;
}

interface ExtractResponse {
  tasks: Task[];
  extracted_count: number;
  truncated: boolean;
  source_type: string;
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
          ? "border-gray-700/50 bg-gray-800/20 opacity-60"
          : "border-gray-700 bg-gray-800/40 hover:border-gray-600"
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
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSaveEdit}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditing(false); setEditValue(task.description); }}
              className="p-1.5 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p
            className={`text-sm leading-relaxed ${
              task.status === "done" ? "line-through text-gray-500" : "text-gray-200"
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Hints */}
        {(assignee || deadline) && (
          <div className="flex flex-wrap gap-3 mt-2">
            {assignee && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" /> {assignee}
              </span>
            )}
            {deadline && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
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
            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            title="Change priority"
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showPriorityMenu && (
            <div className="absolute right-0 top-8 z-10 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-1 min-w-25">
              {(["high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onUpdatePriority(task.id, p);
                    setShowPriorityMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                    task.priority === p ? "text-white font-medium" : "text-gray-400"
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
          className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          title="Edit description"
        >
          <Pencil className="w-4 h-4 text-gray-400" />
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
              className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
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
  const projectId = params.id as string;

  const [text, setText] = useState("");
  const [sourceType, setSourceType] = useState<"transcript" | "email">("transcript");
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

  // ── Group tasks by priority ───────────────────────────────────────────────

  const grouped = (["high", "medium", "low"] as const).reduce(
    (acc, p) => {
      acc[p] = tasks
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 text-white max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <ListTodo className="w-6 h-6 text-indigo-400" />
        <h1 className="text-2xl font-bold">Workflow</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">
        Paste a meeting transcript or email thread to extract and manage actionable tasks.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── Left: Input Panel ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Source type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setSourceType("transcript")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                sourceType === "transcript"
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              <Mic className="w-4 h-4" /> Transcript
            </button>
            <button
              onClick={() => setSourceType("email")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                sourceType === "email"
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
              }`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                sourceType === "transcript"
                  ? "Paste your meeting transcript here…\n\nExample:\nAlice: We need to update the onboarding flow by Friday.\nBob: I'll handle the backend changes. Can someone review the designs?\nAlice: John, please review and send feedback by EOD tomorrow."
                  : "Paste your email thread here…\n\nExample:\nFrom: Sarah\nTo: Team\n\nHi all, can you please update the API docs and deploy to staging by next Monday? Also, Bob please schedule a sync with the client."
              }
              rows={16}
              className={`w-full bg-gray-800/60 border rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors font-mono leading-relaxed ${
                isOverLimit ? "border-red-500" : "border-gray-700"
              }`}
            />
            <div
              className={`absolute bottom-3 right-3 text-xs ${
                isOverLimit ? "text-red-400" : "text-gray-600"
              }`}
            >
              {charCount.toLocaleString()} / {charLimit.toLocaleString()}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Extract button */}
          <button
            onClick={handleExtract}
            disabled={extracting || isOverLimit}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-colors"
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
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-400">
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
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mb-1">
                <BarChart3 className="w-3 h-3" /> Total
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs mb-1">
                <CheckCircle2 className="w-3 h-3" /> Done
              </div>
              <div className="text-2xl font-bold text-white">{stats.by_status.done}</div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3 text-center">
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
                  <div key={p} className="flex items-center gap-1.5 text-xs text-gray-400">
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
        <div className="flex flex-col gap-6">
          {loadingTasks ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="border border-dashed border-gray-700 rounded-xl p-12 text-center">
              <ListTodo className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No tasks yet. Paste a transcript or email and hit{" "}
                <strong className="text-gray-400">Extract Tasks</strong>.
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
