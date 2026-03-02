// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  provider: "credentials" | "github";
  created_at: string;
}

// ── Project ───────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  user_id: string;
  name: string;
  goal: string;
  constraints: string[];
  decisions: string[];
  open_questions: string[];
  created_at: string;
  updated_at: string;
  // aggregates returned from API
  document_count?: number;
  task_count?: number;
  insight_count?: number;
}

export interface ProjectCreate {
  name: string;
  goal: string;
  constraints: string[];
}

export interface ProjectUpdate {
  name?: string;
  goal?: string;
  constraints?: string[];
  decisions?: string[];
  open_questions?: string[];
}

// ── Document ──────────────────────────────────────────────────────────────────

export type SummaryLevel = "short" | "detailed" | "exam-ready";

export interface Document {
  id: string;
  project_id: string;
  filename: string;
  file_url: string;
  doc_type: "pdf" | "text";
  summary?: string;
  summary_level?: SummaryLevel;
  key_concepts?: Concept[];
  implementation_steps?: string[];
  created_at: string;
}

export interface Concept {
  name: string;
  definition: string;
  importance: number; // 1–5
  analogy?: string;
}

// ── Code Insight ──────────────────────────────────────────────────────────────

export interface CodeInsight {
  id: string;
  project_id: string;
  code_snippet: string;
  language: string;
  explanation?: string;
  components?: CodeComponent[];
  patterns?: string[];
  suggestions?: CodeSuggestion[];
  created_at: string;
}

export interface CodeComponent {
  name: string;
  purpose: string;
  lines?: string;
}

export interface CodeSuggestion {
  description: string;
  severity: "critical" | "warning" | "info";
  fix?: string;
}

// ── Task ──────────────────────────────────────────────────────────────────────

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "done";

export interface Task {
  id: string;
  project_id: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_hint?: string;
  deadline_hint?: string;
  source_text?: string;
  created_at: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  project_id: string;
  role: MessageRole;
  content: string;
  context_used?: ContextReference[];
  drift_warnings?: DriftWarning[];
  routed_module?: string;   // learning | developer | workflow | rag
  provider?: string;
  latency_ms?: number;
  created_at: string;
}

export interface ContextReference {
  source_type: "document" | "code" | "task";
  source_id: string;
  chunk_preview: string;
}

export interface DriftWarning {
  type: string;
  severity: "high" | "medium" | "low";
  description: string;
  constraint_violated: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
