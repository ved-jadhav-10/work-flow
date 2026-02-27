"use client";

import { useEffect, useState } from "react";
import { Plus, FolderOpen, FileText, Code2, ListTodo, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { projectsApi } from "@/lib/api";
import type { Project } from "@/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const data: any = await projectsApi.list();
      setProjects(data.projects ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete project");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">
            Each project maintains its own persistent AI context
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Project grid or empty state */}
      {projects.length === 0 ? (
        <div className="border border-dashed border-gray-700 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-200 mb-1">No projects yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first project to start building persistent AI context
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-indigo-600/50 transition-colors"
            >
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-1 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                  {project.goal || "No goal set"}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {project.document_count ?? 0} docs
                  </span>
                  <span className="flex items-center gap-1">
                    <Code2 className="w-3 h-3" />
                    {project.insight_count ?? 0} insights
                  </span>
                  <span className="flex items-center gap-1">
                    <ListTodo className="w-3 h-3" />
                    {project.task_count ?? 0} tasks
                  </span>
                </div>
              </Link>
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(project.id, project.name);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
