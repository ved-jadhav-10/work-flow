import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
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

      {/* Empty state — will be replaced with real list in Phase 3 */}
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
    </div>
  );
}
