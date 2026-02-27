"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  FileText,
  Code2,
  ListTodo,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { projectsApi } from "@/lib/api";
import type { Project } from "@/types";

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Editable fields
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);
  const [constraintInput, setConstraintInput] = useState("");
  const [decisionInput, setDecisionInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function loadProject() {
    try {
      setLoading(true);
      const data: any = await projectsApi.get(projectId);
      setProject(data);
      setName(data.name);
      setGoal(data.goal);
      setConstraints(data.constraints ?? []);
      setDecisions(data.decisions ?? []);
      setOpenQuestions(data.open_questions ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      const updated: any = await projectsApi.update(projectId, {
        name,
        goal,
        constraints,
        decisions,
        open_questions: openQuestions,
      });
      setProject(updated);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function addItem(
    list: string[],
    setList: (v: string[]) => void,
    input: string,
    setInput: (v: string) => void
  ) {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput("");
    }
  }

  function removeItem(list: string[], setList: (v: string[]) => void, index: number) {
    setList(list.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-white">
        <p className="text-red-400">{error || "Project not found"}</p>
        <Link href="/dashboard" className="text-indigo-400 hover:underline text-sm mt-2 block">
          Back to Projects
        </Link>
      </div>
    );
  }

  const QUICK_LINKS = [
    {
      href: `/dashboard/projects/${projectId}/learning`,
      label: "Learning",
      icon: FileText,
      count: project.document_count ?? 0,
      desc: "Documents & summaries",
    },
    {
      href: `/dashboard/projects/${projectId}/developer`,
      label: "Developer",
      icon: Code2,
      count: project.insight_count ?? 0,
      desc: "Code insights",
    },
    {
      href: `/dashboard/projects/${projectId}/workflow`,
      label: "Workflow",
      icon: ListTodo,
      count: project.task_count ?? 0,
      desc: "Tasks & actions",
    },
    {
      href: `/dashboard/projects/${projectId}/chat`,
      label: "Chat",
      icon: MessageSquare,
      count: null,
      desc: "Context-aware AI chat",
    },
  ];

  return (
    <div className="p-8 text-white max-w-3xl">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Projects
      </Link>

      {error && (
        <div className="mb-6 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Title + save */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent border-b border-transparent hover:border-gray-700 focus:border-indigo-500 focus:outline-none pb-1 transition-colors"
          />
          <p className="text-gray-500 text-xs mt-2">
            Created {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-indigo-600/50 transition-colors"
          >
            <link.icon className="w-5 h-5 text-indigo-400 mb-2" />
            <p className="text-sm font-medium">{link.label}</p>
            <p className="text-xs text-gray-500">
              {link.count !== null ? `${link.count} items` : link.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Goal */}
      <section className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Goal</label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          placeholder="What is this project about?"
        />
      </section>

      {/* Constraints */}
      <TagSection
        label="Constraints"
        items={constraints}
        input={constraintInput}
        setInput={setConstraintInput}
        onAdd={() => addItem(constraints, setConstraints, constraintInput, setConstraintInput)}
        onRemove={(i) => removeItem(constraints, setConstraints, i)}
        placeholder="Add constraint"
      />

      {/* Decisions */}
      <TagSection
        label="Decisions"
        items={decisions}
        input={decisionInput}
        setInput={setDecisionInput}
        onAdd={() => addItem(decisions, setDecisions, decisionInput, setDecisionInput)}
        onRemove={(i) => removeItem(decisions, setDecisions, i)}
        placeholder="Record a design decision"
      />

      {/* Open Questions */}
      <TagSection
        label="Open Questions"
        items={openQuestions}
        input={questionInput}
        setInput={setQuestionInput}
        onAdd={() => addItem(openQuestions, setOpenQuestions, questionInput, setQuestionInput)}
        onRemove={(i) => removeItem(openQuestions, setOpenQuestions, i)}
        placeholder="Add an unresolved question"
      />
    </div>
  );
}

// ── Reusable tag list section ────────────────────────────────────────────────

function TagSection({
  label,
  items,
  input,
  setInput,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  items: string[];
  input: string;
  setInput: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  placeholder: string;
}) {
  return (
    <section className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300"
            >
              {item}
              <button onClick={() => onRemove(i)} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
