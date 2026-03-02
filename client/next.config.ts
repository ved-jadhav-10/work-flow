import type { NextConfig } from "next";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

// ── Monorepo: load root .env as fallback ─────────────────────────────────────
// Next.js only reads .env* from this directory (client/).
// If the developer keeps a single .env in the workspace root, load it here
// so all vars (NEXTAUTH_SECRET, BACKEND_URL, etc.) are available.
const rootEnv = resolve(process.cwd(), "../.env");
if (existsSync(rootEnv)) {
  for (const line of readFileSync(rootEnv, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    // Don't override vars already set (e.g. from client/.env.local)
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
