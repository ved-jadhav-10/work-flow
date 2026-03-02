import Link from "next/link";
import {
  BookOpen,
  Code2,
  ListTodo,
  Brain,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  GitBranch,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg">Workflow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 mb-6">
          Persistent AI Context Layer
        </span>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          CognifyOS
        </h1>
        <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-4">
          Your AI that actually remembers.
        </p>
        <p className="text-gray-500 text-base max-w-xl mx-auto mb-10">
          Stop re-explaining your project to every AI tool. Workflow keeps
          persistent context across your documents, code, and tasks — and uses
          it to give you answers that are actually relevant.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-colors border border-white/10 text-sm"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">How it works</h2>
          <p className="text-gray-400 text-sm">Three steps to a smarter AI workspace</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Create a Project",
              desc: "Define your goal and constraints once. Workflow remembers them permanently.",
              accent: "text-indigo-400",
            },
            {
              step: "02",
              title: "Add Your Content",
              desc: "Upload PDFs, paste code snippets, extract tasks from meeting transcripts.",
              accent: "text-violet-400",
            },
            {
              step: "03",
              title: "AI Remembers Everything",
              desc: "Ask anything. The AI searches your full context — documents, code, tasks — to give grounded answers.",
              accent: "text-fuchsia-400",
            },
          ].map(({ step, title, desc, accent }) => (
            <div
              key={step}
              className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
              <span className={`text-3xl font-black opacity-20 ${accent}`}>{step}</span>
              <h3 className="mt-2 font-semibold text-white">{title}</h3>
              <p className="mt-1 text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature sections ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24 space-y-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Everything you need</h2>
          <p className="text-gray-400 text-sm">Three intelligence modules, one persistent context</p>
        </div>

        <FeatureCard
          icon={<BookOpen className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-950/50 border-blue-800/40"
          label="Learning Intelligence"
          title="Turn documents into structured knowledge"
          description="Upload PDFs, lecture notes, or any text. Generate exam-ready summaries, extract key concepts with definitions, and build step-by-step implementation guides — all persisted to your project context."
          bullets={[
            "Short, detailed, or exam-ready summaries",
            "Key concept extraction with analogies",
            "Implementation step generation",
            "RAG retrieval across all uploaded documents",
          ]}
        />

        <FeatureCard
          icon={<Code2 className="w-5 h-5 text-green-400" />}
          iconBg="bg-green-950/50 border-green-800/40"
          label="Developer Productivity"
          title="Understand and improve your code"
          description="Paste any code snippet to get a full architectural explanation, identify bugs and security issues, and auto-generate README documentation. Every insight is stored and cross-referenced with your documents."
          bullets={[
            "Deep code explanation with component breakdown",
            "Bug detection and fix suggestions",
            "Automatic README generation",
            "Code x document cross-context querying",
          ]}
          reversed
        />

        <FeatureCard
          icon={<ListTodo className="w-5 h-5 text-amber-400" />}
          iconBg="bg-amber-950/50 border-amber-800/40"
          label="Workflow Automation"
          title="Extract tasks from any communication"
          description="Paste a meeting transcript or email thread and let AI extract structured action items with priority classification. Manage and track tasks, then query them in the context-aware chat."
          bullets={[
            "Transcript and email task extraction",
            "High / medium / low priority classification",
            "Assignee and deadline hints",
            "Task-aware AI prioritisation advice",
          ]}
        />
      </section>

      {/* ── Differentiator ───────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-linear-to-br from-indigo-950/60 to-gray-900 border border-indigo-800/40 rounded-2xl p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-indigo-300 font-semibold text-sm">Context Persistence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            The AI that knows your project as well as you do
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Every other AI tool starts from zero. Workflow builds a vector-indexed knowledge base
            from everything you add — documents, code insights, tasks, decisions, constraints —
            and uses it to give contextually accurate answers. Ask a question and it retrieves the
            most relevant chunks across all your content, then generates a grounded response.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Persistent vector embeddings (pgvector)",
              "Cross-module context aggregation",
              "Smart drift detection",
              "Constraint violation alerts",
              "Hybrid cloud + local inference",
              "Zero context loss between sessions",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy / Hybrid ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Privacy Mode</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Toggle to local inference via Ollama. All AI processing runs on your
              machine — no data sent to external servers. Production-ready for AMD Ryzen AI
              acceleration.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="w-9 h-9 rounded-xl bg-orange-950/60 border border-orange-800/40 flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Drift Detection</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Set project constraints (e.g. "React and TypeScript only"). If the AI ever
              suggests something that violates them, a real-time warning fires — with the
              option to mark it as a decision.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="max-w-xl mx-auto px-6 pb-28 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to build?</h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Create your first project in under a minute. No credit card required.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors text-sm"
        >
          Get started for free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800 px-6 py-6 text-center text-xs text-gray-600">
        Workflow — Persistent AI Context Layer
      </footer>
    </main>
  );
}

/* ── Feature card component ─────────────────────────────────────────────────── */

function FeatureCard({
  icon,
  iconBg,
  label,
  title,
  description,
  bullets,
  reversed = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  reversed?: boolean;
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row gap-8 items-start ${
        reversed ? "sm:flex-row-reverse" : ""
      }`}
    >
      {/* Text */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center ${iconBg}`}
          >
            {icon}
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        <ul className="space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Visual card */}
      <div className="flex-1 w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-2.5 min-w-0">
        {bullets.map((b, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 bg-gray-950/60 border border-gray-800 rounded-lg text-sm"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-700/40 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-indigo-400">{i + 1}</span>
            </div>
            <span className="text-gray-400 text-xs">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

