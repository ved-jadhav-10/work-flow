import { Code2 } from "lucide-react";

export default function DeveloperPage() {
  return (
    <div className="p-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <Code2 className="w-6 h-6 text-indigo-400" />
        <h1 className="text-2xl font-bold">Developer Tools</h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">
        Paste code for explanation, debugging, and README generation.
      </p>
      <div className="border border-dashed border-gray-700 rounded-xl p-12 text-center">
        <p className="text-gray-500">Coming in Phase 5 — Code Analysis</p>
      </div>
    </div>
  );
}
