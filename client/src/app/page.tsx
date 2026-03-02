import Link from "next/link";
import React from "react";
import {
  BookOpen,
  Code2,
  ListTodo,
  Brain,
  ArrowRight,
  Lock,
  GitBranch,
  Sparkles,
} from "lucide-react";
import AppBackground from "@/components/layout/AppBackground";

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <AppBackground variant="hero" className="overflow-x-hidden">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[740px] flex flex-col overflow-hidden">

        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/hero-bg.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Deep vignette for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 36%, rgba(4,8,20,0.72) 0%, rgba(4,8,20,0.28) 58%, transparent 100%)",
          }}
        />

        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#060d1f]/70 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#060d1f] via-[#060d1f]/70 to-transparent" />

        {/* Warm gold glow behind text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 40% 30% at 50% 44%, rgba(212,170,112,0.08) 0%, transparent 70%)",
          }}
        />

        {/* ── Nav ── */}
        <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-lg font-semibold tracking-tight text-white">Workflow</span>
            <span
              className="w-1.5 h-1.5 rounded-full mt-0.5"
              style={{ background: "#d4aa70", boxShadow: "0 0 6px rgba(212,170,112,0.8)" }}
            />
          </div>

          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/55 font-medium">
            {[
              { label: "How it works", href: "#how-it-works" },
              { label: "Features",     href: "#features"     },
              { label: "Privacy",      href: "#privacy"      },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                className="hover:text-white/90 transition-colors duration-200 tracking-wide">{label}</a>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-2 text-[13px] text-white/60 hover:text-white transition-colors duration-200 font-medium">
              Sign in
            </Link>
            <Link href="/register"
              className="px-5 py-2 text-[13px] font-medium rounded-full transition-all duration-200"
              style={{
                background: "rgba(212,170,112,0.12)",
                border: "1px solid rgba(212,170,112,0.30)",
                color: "#d4aa70",
              }}>
              Get started
            </Link>
          </div>
        </nav>

        {/* ── Hero copy ── */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 pb-28">
          {/* Tag pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-8"
            style={{
              background: "rgba(212,170,112,0.08)",
              border: "1px solid rgba(212,170,112,0.22)",
              color: "#d4aa70",
            }}>
            <Sparkles className="w-3 h-3" /> AI-powered workspace
          </div>

          <h1
            className="font-light leading-[1.08] max-w-2xl mx-auto mb-6 tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5.2rem)" }}>
            <span className="text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)]">
              Where{" "}
            </span>
            <em
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontStyle: "italic",
                background: "linear-gradient(135deg, #d4aa70 0%, #f0d098 50%, #c49a5a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 12px rgba(212,170,112,0.35))",
              }}>
              ideas bloom
            </em>
            <span className="text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)]">
              {" "}under starlight.
            </span>
          </h1>

          <p className="text-white/55 max-w-sm mx-auto mb-10 text-[14px] leading-[1.75] tracking-wide">
            Tools for thinkers, dreamers, and makers —
            AI that holds your full context, always.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/register"
              className="px-7 py-3 rounded-full text-[13px] font-semibold text-[#060d1f] transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #d4aa70 0%, #f0c97a 100%)",
                boxShadow: "0 4px 24px rgba(212,170,112,0.35)",
              }}>
              Start Creating
            </Link>
            <Link href="#how-it-works"
              className="px-7 py-3 rounded-full text-[13px] font-medium text-white/75 hover:text-white transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-28">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-14 justify-center">
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to right, transparent, rgba(212,170,112,0.35))" }} />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#d4aa70" }}>How it works</span>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to left, transparent, rgba(212,170,112,0.35))" }} />
        </div>

        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight mb-3">
            Three steps to a smarter workspace
          </h2>
          <p className="text-white/40 text-sm">From raw idea to AI-augmented clarity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}>
          {[
            {
              step: "01",
              title: "Create a Project",
              desc: "Define your goal and constraints once. Workflow remembers everything permanently.",
              color: "#d4aa70",
            },
            {
              step: "02",
              title: "Add Your Content",
              desc: "Upload PDFs, paste code snippets, extract tasks from meeting transcripts.",
              color: "#a389c8",
            },
            {
              step: "03",
              title: "AI Remembers All",
              desc: "Ask anything. The AI searches your full context to give grounded, accurate answers.",
              color: "#60a5fa",
            },
          ].map(({ step, title, desc, color }, i) => (
            <div
              key={step}
              className="relative px-8 py-10 flex flex-col gap-4"
              style={{ background: "rgba(6,13,31,0.80)" }}>
              {/* Step number */}
              <span
                className="text-[3rem] font-black leading-none select-none"
                style={{ color, opacity: 0.18 }}>{step}</span>
              {/* Accent line */}
              <div className="w-8 h-[2px] rounded-full" style={{ background: color, opacity: 0.6 }} />
              <h3 className="font-semibold text-white text-[15px]">{title}</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">{desc}</p>
              {/* Connector arrow (not on last) */}
              {i < 2 && (
                <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10
                                w-6 h-6 rounded-full items-center justify-center"
                  style={{ background: "#060d1f", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <ArrowRight className="w-3 h-3 text-white/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════ */}
      <section id="features" className="max-w-5xl mx-auto px-6 pb-28">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-14 justify-center">
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to right, transparent, rgba(212,170,112,0.35))" }} />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#d4aa70" }}>Features</span>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to left, transparent, rgba(212,170,112,0.35))" }} />
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight mb-3">
            Three modules, one brain
          </h2>
          <p className="text-white/40 text-sm">Each module shares the same persistent context</p>
        </div>

        <div className="space-y-4">
          <FeatureRow
            icon={<BookOpen className="w-4 h-4" />}
            iconColor="#60a5fa"
            label="Learning Intelligence"
            title="Turn documents into structured knowledge"
            description="Upload PDFs, lecture notes, or any text. Generate exam-ready summaries, extract key concepts, and build step-by-step guides — all persisted to your project context."
            bullets={["Short, detailed, or exam-ready summaries","Key concept extraction","Implementation step generation","RAG retrieval across all documents"]}
          />
          <FeatureRow
            icon={<Code2 className="w-4 h-4" />}
            iconColor="#a389c8"
            label="Developer Productivity"
            title="Understand and improve your code"
            description="Paste any snippet for a full architectural breakdown, bug detection, and auto-generated README docs. Every insight is cross-referenced with your project documents."
            bullets={["Deep code explanation","Bug detection and fix suggestions","Automatic README generation","Code × document cross-context querying"]}
          />
          <FeatureRow
            icon={<ListTodo className="w-4 h-4" />}
            iconColor="#d4aa70"
            label="Workflow Automation"
            title="Extract tasks from any communication"
            description="Paste a meeting transcript or email thread and let AI extract action items with priority classification. Query tasks in the context-aware chat."
            bullets={["Transcript and email task extraction","Priority classification","Assignee and deadline hints","Task-aware AI advice"]}
          />
        </div>
      </section>

      {/* ══ CONTEXT PERSISTENCE ═══════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div
          className="relative rounded-3xl p-10 sm:p-14 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(10,18,38,0.95) 0%, rgba(6,13,31,0.95) 100%)",
            border: "1px solid rgba(212,170,112,0.15)",
            boxShadow: "0 0 80px rgba(212,170,112,0.06) inset",
          }}>
          {/* Corner glow */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,170,112,0.08) 0%, transparent 70%)" }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row gap-12 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(212,170,112,0.12)", border: "1px solid rgba(212,170,112,0.25)" }}>
                  <Brain className="w-5 h-5" style={{ color: "#d4aa70" }} />
                </div>
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#d4aa70" }}>Context Persistence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-4 leading-snug">
                The AI that knows your project<br className="hidden sm:block" /> as well as you do
              </h2>
              <p className="text-white/45 text-[13px] leading-relaxed max-w-sm">
                Every other AI tool starts from zero. Workflow builds a vector-indexed knowledge base from everything you add and uses it to give contextually accurate answers.
              </p>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 gap-2">
              {[
                "Persistent vector embeddings (pgvector)",
                "Cross-module context aggregation",
                "Smart drift detection",
                "Constraint violation alerts",
                "Hybrid cloud + local inference",
                "Zero context loss between sessions",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] text-white/65"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#d4aa70", opacity: 0.7 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRIVACY / DRIFT ═══════════════════════════════════════════════ */}
      <section id="privacy" className="max-w-5xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: <Lock className="w-5 h-5" />,
              color: "#6ee7b7",
              bg: "rgba(110,231,183,0.08)",
              border: "rgba(110,231,183,0.18)",
              title: "Privacy Mode",
              desc: "Toggle to local inference via Ollama. All AI processing runs on your machine — no data sent to external servers.",
            },
            {
              icon: <GitBranch className="w-5 h-5" />,
              color: "#fbbf24",
              bg: "rgba(251,191,36,0.08)",
              border: "rgba(251,191,36,0.18)",
              title: "Drift Detection",
              desc: 'Set project constraints (e.g. "React and TypeScript only"). If the AI ever suggests something that violates them, a real-time warning fires.',
            },
          ].map(({ icon, color, bg, border, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-7"
              style={{
                background: "rgba(6,13,31,0.80)",
                border: `1px solid ${border}`,
              }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: bg, border: `1px solid ${border}`, color }}>
                {icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-[15px]">{title}</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-2xl mx-auto px-6 pb-32 text-center">
        <div
          className="rounded-3xl py-14 px-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(10,18,38,0.95) 0%, rgba(6,13,31,0.95) 100%)",
            border: "1px solid rgba(212,170,112,0.15)",
          }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,170,112,0.07) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase mb-6"
              style={{ background: "rgba(212,170,112,0.08)", border: "1px solid rgba(212,170,112,0.22)", color: "#d4aa70" }}>
              <Sparkles className="w-2.5 h-2.5" /> Free to start
            </div>
            <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight mb-4">
              Ready to build?
            </h2>
            <p className="text-white/40 mb-9 text-sm leading-relaxed">
              Create your first project in under a minute.<br />No credit card required.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[13px] font-semibold text-[#060d1f] transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #d4aa70 0%, #f0c97a 100%)",
                boxShadow: "0 4px 28px rgba(212,170,112,0.30)",
              }}>
              Get started for free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="px-6 py-9" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-[12px] text-white/25 font-medium tracking-wide">Workflow</span>
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: "#d4aa70", opacity: 0.5 }}
            />
            <span className="text-[12px] text-white/20">Where ideas bloom under starlight</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-white/25">
            <Link href="/login"     className="hover:text-white/60 transition-colors">Sign in</Link>
            <Link href="/register"  className="hover:text-white/60 transition-colors">Get started</Link>
            <a href="#how-it-works" className="hover:text-white/60 transition-colors">How it works</a>
            <a href="#features"     className="hover:text-white/60 transition-colors">Features</a>
          </div>
        </div>
      </footer>
    </AppBackground>
  );
}

/* ── Feature row ─────────────────────────────────────────────────────────────
   Horizontal accordion-style card — icon + label + text on left, bullet
   pills on right.                                                             */
function FeatureRow({
  icon, iconColor, label, title, description, bullets,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div
      className="rounded-2xl p-7 sm:p-8 flex flex-col sm:flex-row gap-8 items-start transition-all duration-300 hover:border-white/10"
      style={{
        background: "rgba(6,13,31,0.75)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>

      {/* Left — text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `${iconColor}14`,
              border: `1px solid ${iconColor}30`,
              color: iconColor,
            }}>
            {icon}
          </div>
          <span
            className="text-[10px] font-semibold tracking-[0.16em] uppercase"
            style={{ color: iconColor, opacity: 0.85 }}>
            {label}
          </span>
        </div>
        <h3 className="text-[17px] font-semibold text-white mb-2 leading-snug">{title}</h3>
        <p className="text-white/40 text-[13px] leading-relaxed">{description}</p>
      </div>

      {/* Right — bullets as pill tags */}
      <div className="flex-1 flex flex-wrap gap-2 content-start pt-1">
        {bullets.map((b) => (
          <span
            key={b}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium text-white/55"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}