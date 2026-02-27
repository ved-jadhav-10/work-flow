-- Phase 3: Create all project-related tables
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Projects
CREATE TABLE IF NOT EXISTS projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    goal            TEXT NOT NULL DEFAULT '',
    constraints     JSONB NOT NULL DEFAULT '[]'::jsonb,
    decisions       JSONB NOT NULL DEFAULT '[]'::jsonb,
    open_questions  JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects (user_id);

-- 2. Documents
CREATE TABLE IF NOT EXISTS documents (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename              TEXT NOT NULL,
    file_url              TEXT,
    doc_type              TEXT NOT NULL DEFAULT 'text',   -- 'pdf' | 'text'
    raw_text              TEXT,
    summary               TEXT,
    key_concepts          JSONB DEFAULT '[]'::jsonb,
    implementation_steps  JSONB DEFAULT '[]'::jsonb,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents (project_id);

-- 3. Code Insights
CREATE TABLE IF NOT EXISTS code_insights (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code_snippet  TEXT NOT NULL,
    language      TEXT NOT NULL DEFAULT 'python',
    explanation   TEXT,
    components    JSONB DEFAULT '[]'::jsonb,
    suggestions   JSONB DEFAULT '[]'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_code_insights_project_id ON code_insights (project_id);

-- 4. Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description   TEXT NOT NULL,
    priority      TEXT NOT NULL DEFAULT 'medium',   -- 'high' | 'medium' | 'low'
    status        TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'done'
    source_text   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks (project_id);

-- 5. Embeddings (requires pgvector extension from Phase 1)
CREATE TABLE IF NOT EXISTS embeddings (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source_type    TEXT NOT NULL,    -- 'document' | 'code' | 'task'
    source_id      UUID NOT NULL,
    content_chunk  TEXT NOT NULL,
    embedding      vector(768),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_embeddings_project_id ON embeddings (project_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_source ON embeddings (source_type, source_id);

-- 6. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role          TEXT NOT NULL,     -- 'user' | 'assistant'
    content       TEXT NOT NULL,
    context_used  JSONB DEFAULT '[]'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages (project_id);
