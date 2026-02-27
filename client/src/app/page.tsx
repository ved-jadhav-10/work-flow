import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        {/* Badge */}
        <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
          Persistent AI Context Layer
        </span>

        {/* Heading */}
        <h1 className="text-5xl font-bold tracking-tight">Workflow</h1>
        <p className="text-xl text-gray-400 leading-relaxed">
          Eliminate productivity loss caused by context switching across AI platforms.
          Accelerate learning and developer workflows through structured intelligence generation.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/10"
          >
            Sign In
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center pt-8">
          {[
            "Learning Intelligence",
            "Developer Productivity",
            "Workflow Automation",
            "Persistent Context",
            "Drift Detection",
            "Hybrid Inference",
          ].map((f) => (
            <span
              key={f}
              className="px-3 py-1 text-sm bg-white/5 text-gray-300 rounded-full border border-white/10"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
