"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Github, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const name = `${firstName} ${lastName}`.trim();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Registration failed");
        setLoading(false);
        return;
      }

      let result;
      try {
        result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
      } catch (signInErr: any) {
        // Auth.js v5 throws instead of returning { error } on server failures
        const msg: string = signInErr?.message ?? "";
        if (msg.includes("DOCTYPE") || msg.includes("JSON") || msg.includes("AuthError")) {
          setError("Registered! But the auth service had an error. Please sign in manually.");
        } else {
          setError("Registered but sign-in failed. Please go to login.");
        }
        setLoading(false);
        return;
      }

      if (result?.error) {
        setError("Registered but sign-in failed. Please go to login.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      setError(
        msg.includes("fetch") || msg.includes("Failed") || msg.includes("ECONNREFUSED")
          ? "Cannot reach the server. Make sure the backend is running."
          : msg || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { n: 1, label: "Sign up your account" },
    { n: 2, label: "Set up your workspace" },
    { n: 3, label: "Set up your profile"   },
  ];

  return (
    <div className="relative min-h-screen flex" style={{ background: "#0b0f1a" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between px-12 py-12 w-[42%] shrink-0 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 110% 80% at 20% 60%, #0d1a3a 0%, #090e22 40%, #060b18 100%)",
        }}
      >
        {/* Subtle top-right glow */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,170,112,0.08) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <div className="relative w-40 h-12 shrink-0 rounded-xl">
            <Image
              src="/assets/workflow_logo_yellow.png"
              alt="Workflow Logo"
              width={200}
              height={60}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Middle copy */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Get Started<br />with Us
          </h1>
          <p className="text-white/65 text-[13px] leading-relaxed max-w-50">
            Complete these easy steps to register your account.
          </p>
        </div>

        {/* Steps */}
        <div className="flex gap-3">
          {steps.map(({ n, label }) => (
            <div
              key={n}
              className="flex-1 rounded-2xl p-4 flex flex-col gap-3 transition-all"
              style={
                n === 1
                  ? { background: "rgba(255,255,255,0.94)", color: "#0b0f1a" }
                  : { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={
                  n === 1
                    ? { background: "#0d1a3a", color: "#d4aa70" }
                    : { background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }
                }
              >
                {n}
              </div>
              <span
                className="text-[11px] font-medium leading-snug"
                style={{ color: n === 1 ? "#0b0f1a" : "rgba(255,255,255,0.55)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-7">

          {/* Heading */}
          <div className="text-center space-y-1.5">
            <h2 className="text-[22px] font-semibold text-white tracking-tight">Sign Up Account</h2>
            <p className="text-white/60 text-[13px]">Enter your personal data to create your account.</p>
          </div>

          {/* OAuth buttons */}
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
                action: () => signIn("github", { callbackUrl: "/dashboard" }),
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
            <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>Or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* First / Last name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name">
                <Input
                  type="text" placeholder="eg. John"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                />
              </Field>
              <Field label="Last Name">
                <Input
                  type="text" placeholder="eg. Francisco"
                  value={lastName} onChange={(e) => setLastName(e.target.value)}
                />
              </Field>
            </div>

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
                  required minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Must be at least 8 characters.
              </p>
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
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-white/70 hover:text-white transition-colors underline underline-offset-2">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── tiny helpers ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
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
      className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white placeholder:text-white/35 outline-none transition-all focus:border-white/25 ${className}`}
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
    />
  );
}
