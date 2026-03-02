"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { projectsApi } from "@/lib/api";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";

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
        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <h1 className="text-2xl font-bold mb-1">Create New Project</h1>
      <p className="text-muted text-sm mb-8">
        A project groups your documents, code insights, tasks, and chat history
        under a shared AI context.
      </p>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <GlassCard className="p-6 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Project Name <span className="text-red-400">*</span>
          </label>
          <GlassInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Machine Learning Course Notes"
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
            className="w-full rounded-xl px-4 py-2.5 bg-surface-2 border border-border text-white placeholder:text-muted-2 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-colors resize-none"
          />
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Constraints / Guidelines
          </label>
          <p className="text-xs text-muted-2 mb-3">
            Rules the AI should respect (e.g. &quot;Use Python 3.11 only&quot;,
            &quot;Follow APA citation format&quot;)
          </p>
          <div className="flex gap-2 mb-3">
            <GlassInput
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
            />
            <button
              type="button"
              onClick={addConstraint}
              className="px-3 py-2.5 bg-surface-2 hover:bg-surface-3 rounded-xl text-white/80 border border-border transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {constraints.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {constraints.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-surface-2 border border-border rounded-full text-sm text-white/80"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => removeConstraint(i)}
                    className="hover:text-red-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <GlassButton
          type="submit"
          disabled={loading || !name.trim()}
          variant="primary"
          className="rounded-xl px-6 py-2.5"
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
        </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
