"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  ChevronDown,
  ChevronRight,
  FileText,
  Code2,
  ListTodo,
  Clock,
  Cpu,
  AlertTriangle,
  X,
  BookOpen,
  GitBranch,
  CheckSquare,
  Brain,
  PlusCircle,
} from "lucide-react";
import { chatApi, projectsApi } from "@/lib/api";
import type { ChatMessage, ContextReference, DriftWarning } from "@/types";

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function ChatPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Auto-scroll ─────────────────────────────────────────────────────────

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── Load history ────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data: any = await chatApi.history(projectId);
      setMessages(data.messages ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load chat history");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Send message ────────────────────────────────────────────────────────

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    // Optimistic: show user message immediately
    const optimisticUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      project_id: projectId,
      role: "user",
      content: text,
      context_used: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const data: any = await chatApi.send(projectId, text);

      // Replace optimistic msg with real user message + add assistant response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== optimisticUserMsg.id);
        const realUserMsg: ChatMessage = {
          id: `user-${data.message_id}`,
          project_id: projectId,
          role: "user",
          content: text,
          context_used: [],
          created_at: new Date().toISOString(),
        };
        const assistantMsg: ChatMessage = {
          id: data.message_id,
          project_id: projectId,
          role: "assistant",
          content: data.answer,
          context_used: data.context_used ?? [],
          drift_warnings: data.drift_warnings ?? [],
          routed_module: data.routed_module ?? "rag",
          provider: data.provider,
          latency_ms: data.latency_ms,
          created_at: new Date().toISOString(),
        };
        return [...filtered, realUserMsg, assistantMsg];
      });
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id));
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading chat…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <MessageSquare className="w-5 h-5 text-indigo-400" />
        <div>
          <h1 className="text-lg font-semibold">AI Chat</h1>
          <p className="text-gray-500 text-xs">
            Context-aware assistant — powered by your project data
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-3 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-red-400 hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !sending && <EmptyState />}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-800 px-6 py-4">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your project…"
            disabled={sending}
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none disabled:opacity-50 text-sm"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">
          Shift + Enter for new line · Responses use your project context
        </p>
      </div>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16">
      <div className="w-16 h-16 rounded-full bg-indigo-600/10 flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-indigo-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        Start a conversation
      </h2>
      <p className="text-gray-400 text-sm max-w-md mb-6">
        Ask questions about your project, uploaded documents, code insights, or
        tasks. The AI uses your full project context to give relevant answers.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
        <SuggestionChip text="What are my current priorities?" />
        <SuggestionChip text="Summarize what I've learned so far" />
        <SuggestionChip text="How does my code relate to my documents?" />
        <SuggestionChip text="Are there any constraint violations?" />
      </div>
    </div>
  );
}

function SuggestionChip({ text }: { text: string }) {
  return (
    <div className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg">
      {text}
    </div>
  );
}

/* ── Message bubble ───────────────────────────────────────────────────────── */

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-gray-700" : "bg-indigo-600/20"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-300" />
        ) : (
          <Bot className="w-4 h-4 text-indigo-400" />
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-gray-800/60 border border-gray-700 text-gray-100 rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} />
          )}
        </div>

        {/* Metadata for assistant messages */}
        {!isUser && (
          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
            {message.provider && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-[10px] text-gray-400">
                <Cpu className="w-3 h-3" />
                {message.provider}
                {message.latency_ms != null && (
                  <>
                    <Clock className="w-3 h-3 ml-1" />
                    {Math.round(message.latency_ms)}ms
                  </>
                )}
              </span>
            )}

            {message.routed_module && (
              <ModuleBadge module={message.routed_module} />
            )}

            {message.context_used && message.context_used.length > 0 && (
              <ContextSection refs={message.context_used} />
            )}

            {message.drift_warnings && message.drift_warnings.length > 0 && (
              <DriftWarningBanner
                warnings={message.drift_warnings}
                projectId={message.project_id}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Markdown (simplified) ────────────────────────────────────────────────── */

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-gray-900 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-gray-300"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="font-semibold text-white mt-3 mb-1 text-sm">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="font-semibold text-white mt-3 mb-1">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="font-bold text-white mt-3 mb-1 text-lg">
          {line.slice(2)}
        </h2>
      );
    } else if (line.match(/^[-*]\s/)) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-gray-200">
          <InlineFormat text={line.slice(2)} />
        </li>
      );
    } else if (line.match(/^\d+\.\s/)) {
      const text = line.replace(/^\d+\.\s/, "");
      elements.push(
        <li key={i} className="ml-4 list-decimal text-gray-200">
          <InlineFormat text={text} />
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-gray-200">
          <InlineFormat text={line} />
        </p>
      );
    }
  });

  if (inCodeBlock && codeLines.length) {
    elements.push(
      <pre
        key="code-end"
        className="bg-gray-900 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-gray-300"
      >
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 bg-gray-900 rounded text-indigo-300 text-xs font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (
          part.startsWith("*") &&
          part.endsWith("*") &&
          !part.startsWith("**")
        ) {
          return (
            <em key={i} className="italic text-gray-300">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ── Module routing badge ──────────────────────────────────────────────────── */

const MODULE_META: Record<
  string,
  { label: string; icon: ReactElement; color: string }
> = {
  learning: {
    label: "Learning",
    icon: <BookOpen className="w-3 h-3" />,
    color: "text-blue-400 border-blue-800 bg-blue-950/40",
  },
  developer: {
    label: "Developer",
    icon: <Code2 className="w-3 h-3" />,
    color: "text-green-400 border-green-800 bg-green-950/40",
  },
  workflow: {
    label: "Workflow",
    icon: <CheckSquare className="w-3 h-3" />,
    color: "text-amber-400 border-amber-800 bg-amber-950/40",
  },
  rag: {
    label: "Full Context",
    icon: <Brain className="w-3 h-3" />,
    color: "text-indigo-400 border-indigo-800 bg-indigo-950/40",
  },
};

function ModuleBadge({ module }: { module: string }) {
  const meta = MODULE_META[module] ?? MODULE_META["rag"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-full text-[10px] font-medium ${meta.color}`}
    >
      {meta.icon}
      Answered via: {meta.label}
    </span>
  );
}

/* ── Drift warning banner ─────────────────────────────────────────────────── */

function DriftWarningBanner({
  warnings,
  projectId,
}: {
  warnings: DriftWarning[];
  projectId: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [addingIdx, setAddingIdx] = useState<number | null>(null);
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());

  if (dismissed || warnings.length === 0) return null;

  async function handleAddToDecisions(warning: DriftWarning, idx: number) {
    setAddingIdx(idx);
    try {
      const project: any = await projectsApi.get(projectId);
      const current: string[] = project.decisions ?? [];
      const entry = `[Drift] ${warning.description}`;
      if (!current.includes(entry)) {
        await projectsApi.update(projectId, {
          decisions: [...current, entry],
        });
      }
      setAddedIndices((prev) => new Set(prev).add(idx));
    } catch {
      // silently fail — user can still see the warning
    } finally {
      setAddingIdx(null);
    }
  }

  return (
    <div className="mt-2 w-full max-w-[75%] rounded-xl border border-amber-700/60 bg-amber-950/30 px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          Constraint Drift Detected
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-300 transition-colors"
          aria-label="Dismiss drift warnings"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {warnings.map((w, i) => (
        <div
          key={i}
          className="text-[11px] space-y-0.5 border-t border-amber-800/40 pt-1.5 first:border-t-0 first:pt-0"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-amber-300 leading-snug flex-1">
              {w.description}
            </span>
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide ${
                w.severity === "high"
                  ? "bg-red-900/60 text-red-300"
                  : w.severity === "medium"
                  ? "bg-amber-900/60 text-amber-300"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              {w.severity}
            </span>
          </div>
          {w.constraint_violated && (
            <p className="text-amber-600 text-[10px]">
              Constraint: <span className="italic">{w.constraint_violated}</span>
            </p>
          )}
          <div className="pt-1">
            {addedIndices.has(i) ? (
              <span className="text-green-400 text-[10px]">
                ✓ Added to Decisions
              </span>
            ) : (
              <button
                onClick={() => handleAddToDecisions(w, i)}
                disabled={addingIdx === i}
                className="inline-flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-300 disabled:opacity-50 transition-colors"
              >
                {addingIdx === i ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <PlusCircle className="w-3 h-3" />
                )}
                Add to Decisions
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Context attribution section ──────────────────────────────────────────── */

function ContextSection({ refs }: { refs: ContextReference[] }) {
  const [expanded, setExpanded] = useState(false);

  const sourceIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="w-3 h-3 text-blue-400" />;
      case "code":
        return <Code2 className="w-3 h-3 text-green-400" />;
      case "task":
        return <ListTodo className="w-3 h-3 text-amber-400" />;
      default:
        return <FileText className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        {refs.length} source{refs.length !== 1 ? "s" : ""} used
      </button>

      {expanded && (
        <div className="mt-1.5 space-y-1">
          {refs.map((ref, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2.5 py-1.5 bg-gray-900/60 border border-gray-800 rounded-lg text-[11px]"
            >
              {sourceIcon(ref.source_type)}
              <div className="min-w-0">
                <span className="text-gray-400 capitalize font-medium">
                  {ref.source_type}
                </span>
                <p className="text-gray-500 truncate">{ref.chunk_preview}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
