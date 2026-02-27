import { BookOpen } from "lucide-react";

export default function LearningPage() {
  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-6 h-6 text-indigo-400" />
        <h1 className="text-2xl font-bold">Learning Hub</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">
        Upload documents, generate summaries, and extract key concepts.
      </p>
      <div className="border border-dashed border-gray-700 rounded-xl p-12 text-center">
        <p className="text-gray-500">Coming in Phase 4 — Document Processing</p>
      </div>
    </div>
  );
}
