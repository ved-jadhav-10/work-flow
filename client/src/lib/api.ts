/**
 * Central API client for all calls to the FastAPI backend.
 * Automatically attaches the backend JWT from the NextAuth session.
 *
 * In development the Next.js rewrite rules in next.config.ts proxy
 * /api/* → http://localhost:8000/api/* so the browser only ever talks
 * to port 3000.  In production set NEXT_PUBLIC_API_URL to the backend URL.
 */

import { INFERENCE_MODE_KEY, getInferenceMode } from "@/lib/inference";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function getBackendToken(): Promise<string | null> {
  // Dynamically import to avoid SSR issues
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  return (session as any)?.backendToken ?? null;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getBackendToken();
  const inferenceMode = getInferenceMode() === "local" ? "local" : undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (inferenceMode) {
    headers["X-Inference-Mode"] = inferenceMode;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}


// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  me: () => request("/api/auth/me"),
};

// ── Project response cache (stale-while-revalidate, 30 s TTL) ─────────────────
// Keeps the last-known data so navigating back to a project is instant.
const _projectCache = new Map<string, { data: unknown; expiresAt: number }>();
const _CACHE_TTL_MS = 30_000;

function _cacheGet<T>(key: string): T | undefined {
  const entry = _projectCache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  _projectCache.delete(key);
  return undefined;
}

function _cacheSet(key: string, data: unknown): void {
  _projectCache.set(key, { data, expiresAt: Date.now() + _CACHE_TTL_MS });
}

function _cacheDel(...keys: string[]): void {
  keys.forEach((k) => _projectCache.delete(k));
}

// ── Projects ──────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: async () => {
    const key = "projects:list";
    const hit = _cacheGet<unknown>(key);
    if (hit) return hit;
    const data = await request("/api/projects");
    _cacheSet(key, data);
    return data;
  },

  get: async (id: string) => {
    const key = `projects:${id}`;
    const hit = _cacheGet<unknown>(key);
    if (hit) return hit;
    const data = await request(`/api/projects/${id}`);
    _cacheSet(key, data);
    return data;
  },

  create: async (data: { name: string; goal: string; constraints: string[] }) => {
    const result = await request("/api/projects", { method: "POST", body: JSON.stringify(data) });
    _cacheDel("projects:list");
    return result;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const result = await request(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });
    _cacheDel(`projects:${id}`, "projects:list");
    return result;
  },

  delete: async (id: string) => {
    const result = await request(`/api/projects/${id}`, { method: "DELETE" });
    _cacheDel(`projects:${id}`, "projects:list");
    return result;
  },
};

// ── Learning ──────────────────────────────────────────────────────────────────

export const learningApi = {
  listDocuments: (projectId: string) =>
    request(`/api/projects/${projectId}/documents`),

  getDocument: (projectId: string, docId: string) =>
    request(`/api/projects/${projectId}/documents/${docId}`),

  uploadDocument: async (projectId: string, file: File) => {
    const token = await getBackendToken();
    const inferenceMode = getInferenceMode() === "local" ? "local" : undefined;
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(inferenceMode ? { "X-Inference-Mode": inferenceMode } : {}),
    };

    const res = await fetch(`${API_BASE}/api/projects/${projectId}/documents/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || "Upload failed");
    }

    return res.json();
  },

  summarize: (projectId: string, docId: string, level: string) =>
    request(`/api/projects/${projectId}/documents/${docId}/summarize`, {
      method: "POST",
      body: JSON.stringify({ level }),
    }),

  extractConcepts: (projectId: string, docId: string) =>
    request(`/api/projects/${projectId}/documents/${docId}/concepts`, {
      method: "POST",
    }),

  generateSteps: (projectId: string, docId: string) =>
    request(`/api/projects/${projectId}/documents/${docId}/steps`, {
      method: "POST",
    }),

  deleteDocument: (projectId: string, docId: string) =>
    request(`/api/projects/${projectId}/documents/${docId}`, { method: "DELETE" }),
};

// ── Developer ─────────────────────────────────────────────────────────────────

export const developerApi = {
  listInsights: (projectId: string) =>
    request(`/api/projects/${projectId}/code`),

  explain: (projectId: string, data: { code: string; language: string }) =>
    request(`/api/projects/${projectId}/code/explain`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  debug: (projectId: string, data: { code: string; language: string }) =>
    request(`/api/projects/${projectId}/code/debug`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  readme: (projectId: string, data: { code: string; language: string; project_name?: string }) =>
    request(`/api/projects/${projectId}/code/readme`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteInsight: (projectId: string, insightId: string) =>
    request(`/api/projects/${projectId}/code/${insightId}`, { method: "DELETE" }),
};

// ── Workflow ──────────────────────────────────────────────────────────────────

export const workflowApi = {
  listTasks: (projectId: string) =>
    request(`/api/projects/${projectId}/tasks`),

  extractTasks: (projectId: string, data: { text: string; source_type: "transcript" | "email" | "notes" }) =>
    request(`/api/projects/${projectId}/workflow/extract`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createTask: (projectId: string, data: { description: string; priority: "high" | "medium" | "low" }) =>
    request(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  analyzeTasks: (projectId: string) =>
    request(`/api/projects/${projectId}/workflow/analyze`, {
      method: "POST",
    }),

  updateTask: (projectId: string, taskId: string, data: Record<string, unknown>) =>
    request(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteTask: (projectId: string, taskId: string) =>
    request(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" }),
};

// ── Chat ──────────────────────────────────────────────────────────────────────

export const chatApi = {
  history: (projectId: string) =>
    request(`/api/projects/${projectId}/chat/history`),

  send: (projectId: string, message: string) =>
    request(`/api/projects/${projectId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};

// ── Health ────────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => fetch(`${API_BASE}/api/health`).then((r) => r.json()),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_documents: number;
  total_insights: number;
  total_tasks: number;
  total_chats: number;
  total_concepts: number;
  high_priority_tasks: number;
  recent_activity: {
    id: string;
    type: "document" | "insight" | "task" | "chat";
    label: string;
    project_id: string;
    project_name: string;
    created_at: string;
  }[];
}

export const dashboardApi = {
  stats: () => request<DashboardStats>("/api/dashboard/stats"),
};
