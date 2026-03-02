/**
 * Central API client for all calls to the FastAPI backend.
 * Automatically attaches the backend JWT from the NextAuth session.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getBackendToken(): Promise<string | null> {
  // Dynamically import to avoid SSR issues
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  return (session as any)?.backendToken ?? null;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  inferenceMode?: string
): Promise<T> {
  const token = await getBackendToken();

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

// ── Inference mode ───────────────────────────────────────────────────────────
// Reads from localStorage (set by Settings page). Falls back to 'cloud'.

const INFERENCE_MODE_KEY = "inference_mode";

function _getInferenceMode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(INFERENCE_MODE_KEY) ?? undefined;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  me: () => request("/api/auth/me"),
};

// ── Projects ──────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: () => request("/api/projects"),

  get: (id: string) => request(`/api/projects/${id}`),

  create: (data: { name: string; goal: string; constraints: string[] }) =>
    request("/api/projects", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Record<string, unknown>) =>
    request(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string) =>
    request(`/api/projects/${id}`, { method: "DELETE" }),
};

// ── Learning ──────────────────────────────────────────────────────────────────

export const learningApi = {
  listDocuments: (projectId: string) =>
    request(`/api/projects/${projectId}/documents`),

  getDocument: (projectId: string, docId: string) =>
    request(`/api/projects/${projectId}/documents/${docId}`),

  uploadDocument: async (projectId: string, file: File) => {
    const token = await getBackendToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/projects/${projectId}/documents/upload`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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

  extractTasks: (projectId: string, data: { text: string; source_type: "transcript" | "email" }) =>
    request(`/api/projects/${projectId}/workflow/extract`, {
      method: "POST",
      body: JSON.stringify(data),
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

  send: (projectId: string, message: string, mode?: string) =>
    request(`/api/projects/${projectId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }, mode ?? _getInferenceMode()),
};

// ── Health ────────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => fetch(`${API_BASE}/api/health`).then((r) => r.json()),
};
