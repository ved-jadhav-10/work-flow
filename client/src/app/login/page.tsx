"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Github, Eye, EyeOff } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
      }
    } catch (err: any) {
      // Auth.js v5 can throw instead of returning { error } on server failures
      const msg: string = err?.message ?? "";
      if (msg.includes("DOCTYPE") || msg.includes("JSON") || msg.includes("AuthError")) {
        setError("Authentication service error. Please ensure the backend is running.");
      } else if (msg.includes("CredentialsSignin") || msg.includes("credentials")) {
        setError("Invalid email or password");
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex" style={{ background: "#0b0f1a" }}>
      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between px-12 py-12 w-[42%] shrink-0 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 110% 80% at 20% 60%, #0d1a3a 0%, #090e22 40%, #060b18 100%)",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,170,112,0.08) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-white font-semibold text-[17px] tracking-tight">Workflow</span>
          <span
            className="w-1.5 h-1.5 rounded-full mt-0.5"
            style={{ background: "#d4aa70", boxShadow: "0 0 6px rgba(212,170,112,0.8)" }}
          />
        </div>

        {/* Copy */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Welcome<br />Back
          </h1>
          <p className="text-white/45 text-[13px] leading-relaxed max-w-[210px]">
            Sign in to pick up right where you left off.
          </p>
        </div>

        {/* Decorative card */}
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: "rgba(255,255,255,0.94)" }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: "#0d1a3a", color: "#d4aa70" }}
          >
            ✓
          </div>
          <p className="text-[13px] font-medium text-[#0b0f1a] leading-snug">
            Your AI context is waiting — pick up right where you left off.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-7">

          <div className="text-center space-y-1.5">
            <h2 className="text-[22px] font-semibold text-white tracking-tight">Sign In</h2>
            <p className="text-white/40 text-[13px]">Enter your credentials to access your account.</p>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Google",
                icon: (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                ),
              },
              {
                label: "Github",
                icon: <Github className="w-4 h-4 shrink-0" />,
                action: () => signIn("github", { callbackUrl }),
              },
            ].map(({ label, icon, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white/75 transition-all hover:text-white hover:border-white/20"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.30)" }}>Or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
              <Input
                type="email" placeholder="eg. johnfrans@gmail.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            {error && (
              <p className="text-[12px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#fff", color: "#0b0f1a", marginTop: "8px" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-white/70 hover:text-white transition-colors underline underline-offset-2">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

/* ── helpers ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white placeholder:text-white/20 outline-none transition-all focus:border-white/25 ${className}`}
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
    />
  );
}
