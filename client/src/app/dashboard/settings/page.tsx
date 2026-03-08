"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Cloud,
  Cpu,
  Lock,
  Zap,
  CheckCircle2,
  Loader2,
  Globe,
  Server,
} from "lucide-react";
import {
  type InferenceMode,
  getInferenceMode,
  setInferenceMode,
} from "@/lib/inference";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const [mode, setMode] = useState<InferenceMode>("cloud");
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    ok: boolean;
    latency?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    setMode(getInferenceMode());
  }, []);

  function handleModeChange(newMode: InferenceMode) {
    setMode(newMode);
    setInferenceMode(newMode);
    setConnectionResult(null);
  }

  const testConnection = useCallback(async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    const start = Date.now();
    try {
      const endpoint =
        mode === "local"
          ? "http://localhost:11434/api/tags"
          : `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/health`;

      const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      const latency = Date.now() - start;
      setConnectionResult({ ok: res.ok, latency });
    } catch (err: any) {
      setConnectionResult({
        ok: false,
        error: mode === "local"
          ? "Could not reach Ollama. Make sure it's running: ollama serve"
          : err.message,
      });
    } finally {
      setTestingConnection(false);
    }
  }, [mode]);

  const isLocal = mode === "local";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted text-sm mt-1">
          Configure AI inference preferences for your workspace.
        </p>
      </div>

      {/* Privacy Mode Banner */}
      {isLocal && (
        <div className="flex items-start gap-3 p-4 bg-emerald-950/25 border border-emerald-700/50 rounded-2xl backdrop-blur-sm">
          <Lock className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-emerald-300 font-medium text-sm">
              Privacy Mode Active
            </p>
            <p className="text-emerald-300/70 text-xs mt-0.5">
              Your data never leaves your machine. All inference runs locally via
              Ollama. Production-ready for AMD Ryzen AI acceleration.
            </p>
          </div>
        </div>
      )}

      {/* Inference Mode Card */}
      <GlassCard className="overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-sm text-white/90">
            AI Inference Mode
          </h2>
          <p className="text-muted-2 text-xs mt-0.5">
            Choose where your AI requests are processed.
          </p>
        </div>

        <div className="p-5 space-y-3">
          {/* Cloud option */}
          <ModeOption
            selected={mode === "cloud"}
            onSelect={() => handleModeChange("cloud")}
            icon={<Cloud className="w-5 h-5 text-indigo-400" />}
            title="Cloud (Gemini)"
            description="Fastest, highest quality. Powered by Google Gemini with Groq fallback. Requires API keys."
            badge="Recommended"
            badgeColor="text-indigo-300 bg-indigo-900/40 border-indigo-700/50"
          />

          {/* Local option */}
          <ModeOption
            selected={mode === "local"}
            onSelect={() => handleModeChange("local")}
            icon={<Server className="w-5 h-5 text-emerald-400" />}
            title="Local (Ollama)"
            description="Fully offline inference using phi3:mini. No API key needed. Data stays on your machine."
            badge="Privacy Mode"
            badgeColor="text-emerald-300 bg-emerald-900/40 border-emerald-700/50"
          />
        </div>

        {/* Test connection */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-3">
            <GlassButton
              onClick={testConnection}
              disabled={testingConnection}
              variant="secondary"
              className="rounded-xl px-4 py-2 border-border-strong"
            >
              {testingConnection ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-yellow-400" />
              )}
              Test Connection
            </GlassButton>

            {connectionResult && (
              <span
                className={`flex items-center gap-1.5 text-sm ${
                  connectionResult.ok ? "text-green-400" : "text-red-400"
                }`}
              >
                {connectionResult.ok ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                    {connectionResult.latency != null && (
                      <span className="text-muted-2 text-xs">
                        · {connectionResult.latency}ms
                      </span>
                    )}
                  </>
                ) : (
                  <>✕ {connectionResult.error ?? "Connection failed"}</>
                )}
              </span>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Provider info */}
      <GlassCard className="p-5 space-y-3">
        <h2 className="font-semibold text-sm text-white/90">Provider Details</h2>
        <InfoRow
          icon={<Globe className="w-4 h-4 text-indigo-400" />}
          label="Cloud primary"
          value="Gemini 2.0 Flash"
        />
        <InfoRow
          icon={<Globe className="w-4 h-4 text-amber-400" />}
          label="Cloud fallback"
          value="Groq llama-3.1-70b-versatile"
        />
        <InfoRow
          icon={<Cpu className="w-4 h-4 text-emerald-400" />}
          label="Local model"
          value="Ollama phi3:mini (3.8B)"
        />
        <InfoRow
          icon={<Lock className="w-4 h-4 text-emerald-400" />}
          label="Local setup"
          value='Download ollama.com → run "ollama pull phi3:mini" → ollama serve'
        />
      </GlassCard>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

function ModeOption({
  selected,
  onSelect,
  icon,
  title,
  description,
  badge,
  badgeColor,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all backdrop-blur-sm ${
        selected
          ? "border-accent/40 bg-white/6"
          : "border-border bg-surface-2 hover:border-white/15"
      }`}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-white">{title}</span>
          <span
            className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${badgeColor}`}
          >
            {badge}
          </span>
        </div>
        <p className="text-muted-2 text-xs mt-0.5 leading-snug">{description}</p>
      </div>
      <div
        className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 transition-colors ${
          selected
            ? "border-accent bg-accent"
            : "border-white/30"
        }`}
      />
    </button>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-2">{label}</span>
        <p className="text-sm text-white/80 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
