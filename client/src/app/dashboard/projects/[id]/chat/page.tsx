"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { chatApi } from "@/lib/api";
import type { ChatMessage, ContextReference } from "@/types";

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
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
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
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
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
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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

            {message.context_used && message.context_used.length > 0 && (
              <ContextSection refs={message.context_used} />
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
