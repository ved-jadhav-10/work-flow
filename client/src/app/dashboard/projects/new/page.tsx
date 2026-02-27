"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { projectsApi } from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);
  const [constraintInput, setConstraintInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addConstraint() {
    const trimmed = constraintInput.trim();
    if (trimmed && !constraints.includes(trimmed)) {
      setConstraints([...constraints, trimmed]);
      setConstraintInput("");
    }
  }

  function removeConstraint(index: number) {
    setConstraints(constraints.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError("");
      const project: any = await projectsApi.create({
        name: name.trim(),
        goal: goal.trim(),
        constraints,
      });
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 text-white max-w-2xl">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <h1 className="text-2xl font-bold mb-1">Create New Project</h1>
      <p className="text-gray-400 text-sm mb-8">
        A project groups your documents, code insights, tasks, and chat history
        under a shared AI context.
      </p>

      {error && (
        <div className="mb-6 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Machine Learning Course Notes"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            required
          />
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium mb-2">Goal</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What are you trying to achieve with this project?"
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Constraints / Guidelines
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Rules the AI should respect (e.g. &quot;Use Python 3.11 only&quot;,
            &quot;Follow APA citation format&quot;)
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={constraintInput}
              onChange={(e) => setConstraintInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addConstraint();
                }
              }}
              placeholder="Add a constraint and press Enter"
              className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={addConstraint}
              className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {constraints.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {constraints.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => removeConstraint(i)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Project
            </>
          )}
        </button>
      </form>
    </div>
  );
}
