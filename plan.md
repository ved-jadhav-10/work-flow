# Workflow AI MVP — Phase-Based Execution Plan

**TL;DR:** 10 sequential phases, each producing a testable, working increment. No phase starts until the previous one passes its verification checklist. Every phase ends with a functioning product — just with fewer features. The Persistent Context Engine (Phase 7) is the differentiator, deliberately placed after all feature modules exist so it has real data to work with. The architecture uses an LLM abstraction layer from day one, making the AWS migration a provider swap, not a rewrite.

---

## Phase 0: Tear Down & Prep

**Goal:** Clean slate. Dev environment ready. All accounts created. No code written yet.

- Delete the existing `client` and `server` directories entirely — they are not reusable
- Create accounts and collect credentials:
  - **Supabase** — create a free project → note `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - **Google AI Studio** — generate a Gemini API key → note `GEMINI_API_KEY`
  - **Groq** — create account → generate API key → note `GROQ_API_KEY`
  - **Google Cloud Console** — create OAuth 2.0 credentials for NextAuth (Google login) → note `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - **Vercel** — link GitHub repo (deploy later)
  - **Render** — create account (deploy later)
- Install global tooling on dev machine:
  - Node.js 20+, Python 3.11+, pip, venv, Git
  - Ollama (download from ollama.com, pull `phi3:mini` model — needed later in Phase 9)
- Create a `.env.example` file at repo root documenting every env var the project needs (no secrets committed)

### Verification
- [ ] All 6 API keys/URLs collected and tested (Gemini: curl a test prompt; Supabase: dashboard loads; Google OAuth: credentials page shows client ID)
- [ ] Ollama runs locally: `ollama run phi3:mini "hello"` returns a response
- [ ] Empty repo, ready for Phase 1

---

## Phase 1: Project Scaffold & Dev Environment

**Goal:** Both apps boot, talk to each other, and connect to Supabase. Zero features, but the skeleton compiles and runs.

### Frontend (Next.js)
- Initialize with: `npx create-next-app@latest client --typescript --tailwind --app --src-dir`
- Install dependencies: `next-auth@beta`, `@supabase/supabase-js`, `react-syntax-highlighter`, `lucide-react`, `axios`
- Create folder structure:
  ```
  client/src/
    app/
      layout.tsx              # Root layout with providers
      page.tsx                # Landing page (placeholder)
      dashboard/
        layout.tsx            # Dashboard shell (sidebar + main)
        page.tsx              # Dashboard home (placeholder)
      api/auth/[...nextauth]/route.ts
    components/
      ui/                     # Reusable UI primitives
      layout/                 # Sidebar, Navbar, etc.
    lib/
      supabase.ts             # Supabase client
      auth.ts                 # NextAuth config
    types/
      index.ts                # Shared TypeScript interfaces
  ```
- Set up Tailwind with a consistent design token system (colors, spacing, typography)
- Create a root `layout.tsx` that wraps the app in a `SessionProvider`

### Backend (FastAPI)
- Create Python virtual environment: `python -m venv venv`
- Install dependencies: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `alembic`, `supabase`, `python-multipart`, `pymupdf`, `pdfplumber`, `google-generativeai`, `groq`, `httpx`, `pydantic-settings`, `python-jose[cryptography]`, `bcrypt`, `pytest`, `pytest-asyncio`
- Create folder structure:
  ```
  server/
    main.py                   # FastAPI app, CORS, router registration
    config.py                 # Pydantic Settings class (reads .env)
    database.py               # SQLAlchemy engine + session factory
    models/                   # SQLAlchemy ORM models (empty for now)
      __init__.py
    schemas/                  # Pydantic request/response models (empty for now)
      __init__.py
    services/                 # Business logic (empty for now)
      __init__.py
    routers/                  # API route files (empty for now)
      __init__.py
    middleware/
      __init__.py
    tests/
      __init__.py
  ```
- `main.py`: FastAPI app with CORS (allow `localhost:3000`), register `GET /api/health` → `{"status": "ok"}`
- `config.py`: Use `pydantic-settings` to load all env vars with validation

### Wiring
- Frontend `page.tsx` calls `http://localhost:8000/api/health` and displays result
- Backend connects to Supabase PostgreSQL, runs test query on startup, logs confirmation

### Verification
- [ ] `cd client && npm run dev` → Next.js on `localhost:3000`
- [ ] `cd server && uvicorn main:app --reload` → FastAPI on `localhost:8000`, Swagger at `/docs`
- [ ] Frontend displays "Server is healthy"
- [ ] Backend logs confirm Supabase DB connection
- [ ] No TypeScript errors, no Python import errors

---

## Phase 2: Authentication & User Management

**Goal:** Users can register, log in (Google OAuth + email/password), and access a protected dashboard. Unauthenticated users are redirected to login.

### Database
- Create `users` table: `id` (UUID, PK), `name`, `email` (unique), `hashed_password` (nullable), `provider` (google/credentials), `avatar_url`, `created_at`

### Backend
- `server/routers/auth.py`:
  - `POST /api/auth/register` — hash password with bcrypt, insert user, return user object
  - `POST /api/auth/login` — validate credentials, return JWT (signed with `python-jose`)
  - `GET /api/auth/me` — protected, decode JWT, return current user
- `server/middleware/auth.py` — FastAPI dependency that validates JWT, injects `current_user`

### Frontend
- `client/src/lib/auth.ts` — NextAuth config:
  - Google OAuth provider
  - Credentials provider → calls `POST /api/auth/login`, stores JWT in session
  - JWT strategy; callbacks attach backend JWT to NextAuth session
- `login/page.tsx` — email/password form, "Sign in with Google", link to register
- `register/page.tsx` — name/email/password form, "Sign up with Google"
- `dashboard/layout.tsx` — sidebar with logo, nav links, user avatar + logout
- `client/src/middleware.ts` — protect all `/dashboard/*`, redirect to `/login` if no session

### Verification
- [ ] Register with email/password → user in Supabase with hashed password
- [ ] Login → redirected to `/dashboard`, session persists on refresh
- [ ] Google OAuth → new user created with `provider: "google"`, lands on dashboard
- [ ] Visit `/dashboard` without auth → redirected to `/login`
- [ ] Logout → session cleared → redirected to `/login`
- [ ] `GET /api/auth/me` with valid JWT → 200; invalid → 401

---

## Phase 3: Project System & Data Model

**Goal:** Users can create, view, edit, and delete projects. The full `ProjectContext` schema exists in the database. No AI yet — just CRUD.

### Database (Alembic migration)
| Table | Key Columns |
|---|---|
| `projects` | `id`, `user_id` (FK), `name`, `goal`, `constraints` (JSONB), `decisions` (JSONB), `open_questions` (JSONB), timestamps |
| `documents` | `id`, `project_id` (FK), `filename`, `file_url`, `doc_type`, `raw_text`, `summary`, `key_concepts` (JSONB), `implementation_steps` (JSONB) |
| `code_insights` | `id`, `project_id` (FK), `code_snippet`, `language`, `explanation`, `components` (JSONB), `suggestions` (JSONB) |
| `tasks` | `id`, `project_id` (FK), `description`, `priority` (high/medium/low), `status` (pending/done), `source_text` |
| `embeddings` | `id`, `project_id` (FK), `source_type`, `source_id`, `content_chunk`, `embedding` (vector(768)) |
| `chat_messages` | `id`, `project_id` (FK), `role` (user/assistant), `content`, `context_used` (JSONB) |

### Backend
- SQLAlchemy ORM models in `server/models/` (one file per table)
- Pydantic schemas in `server/schemas/project.py`: `ProjectCreate`, `ProjectUpdate`, `ProjectResponse`, `ProjectListResponse`
- `server/routers/projects.py`:
  - `POST /api/projects` — create project
  - `GET /api/projects` — list user's projects
  - `GET /api/projects/{id}` — get project with context stats
  - `PUT /api/projects/{id}` — update name, goal, constraints, decisions, open questions
  - `DELETE /api/projects/{id}` — delete project
  - All endpoints scoped to `current_user`

### Frontend
- `dashboard/page.tsx` — project cards grid, "New Project" button
- `dashboard/projects/new/page.tsx` — create form (name, goal, constraints as tag input)
- `dashboard/projects/[id]/page.tsx` — detail view with tabs: Overview, Learning, Developer, Workflow, Chat (placeholders)
- `dashboard/projects/[id]/layout.tsx` — tab navigation
- Overview tab: project name, goal, constraints (editable inline), decisions, open questions, stats

### Verification
- [ ] Create 3 projects → all appear in dashboard
- [ ] Edit constraints → save → refresh → persists
- [ ] Delete project → removed from list
- [ ] User A cannot see User B's projects
- [ ] All tables exist in Supabase with correct columns

---

## Phase 4: LLM Abstraction Layer & PDF Processing

**Goal:** Backend can call Gemini/Groq/Ollama through a unified interface and extract text from PDFs. This is plumbing every subsequent phase depends on.

### `server/services/llm_service.py`
- Abstract base: `class LLMProvider` with `async def generate(prompt, system_prompt, temperature, max_tokens) -> str`
- `class GeminiProvider` — `google-generativeai` SDK, model `gemini-2.0-flash`
- `class GroqProvider` — `groq` SDK, model `llama-3.1-70b-versatile`
- `class OllamaProvider` — calls `http://localhost:11434/api/generate` via `httpx`
- `class LLMService` — holds primary + fallback providers; on 429/timeout → try fallback; logs provider + latency
- Factory: `get_llm_service(mode: str = "cloud")`

### `server/services/pdf_service.py`
- `extract_text(file_bytes, filename) -> str` — PyMuPDF
- `extract_tables(file_bytes) -> list[str]` — pdfplumber, returns markdown tables
- `chunk_text(text, chunk_size=500, overlap=50) -> list[str]` — overlapping chunks by token count
- Edge cases: encrypted PDFs (clear error), empty pages (skip), >100 pages (warn but process)

### `server/services/embedding_service.py`
- `generate_embedding(text) -> list[float]` — Gemini `text-embedding-004` (768 dimensions)
- `generate_embeddings_batch(texts) -> list[list[float]]`
- `similarity_search(project_id, query_embedding, top_k=5) -> list[dict]` — pgvector `<=>` operator

### `server/services/file_storage.py`
- `upload_file(file_bytes, filename, project_id) -> str` — Supabase Storage, returns public URL
- `delete_file(file_url)` — removes from storage

### Tests
- `test_llm_service.py` — mock API responses, test fallback, test timeout
- `test_pdf_service.py` — real small PDF, verify extraction + chunking
- `test_embedding_service.py` — mock API, verify 768 dimensions

### Verification
- [ ] LLMService returns response for "Summarize the concept of recursion"
- [ ] LLMService falls back to Groq when Gemini mock returns 429
- [ ] PDF extraction returns clean text from sample PDF
- [ ] Chunking produces overlapping chunks of correct size
- [ ] Embedding returns 768-dimensional vector
- [ ] Similarity search returns results ordered by relevance
- [ ] `cd server && pytest` — all tests pass

---

## Phase 5: Learning Module

**Goal:** Users upload PDFs into a project and get structured summaries, key concepts, and implementation steps. All outputs stored and visible.

### Backend — `server/routers/learning.py`
| Endpoint | Action |
|---|---|
| `POST /api/projects/{id}/documents/upload` | Extract text → store file → create document record → chunk → embed → store embeddings |
| `POST /api/projects/{id}/documents/{doc_id}/summarize` | `{level: "short"\|"detailed"\|"exam-ready"}` → LLM → store → return |
| `POST /api/projects/{id}/documents/{doc_id}/concepts` | Extract key concepts → store → return |
| `POST /api/projects/{id}/documents/{doc_id}/steps` | Generate implementation steps → store → return |
| `GET /api/projects/{id}/documents` | List all documents |
| `GET /api/projects/{id}/documents/{doc_id}` | Get document with all outputs |

### System Prompts — `server/services/prompts/learning_prompts.py`
- `SUMMARIZE_SHORT` — 3-5 sentence summary, main argument + conclusions
- `SUMMARIZE_DETAILED` — comprehensive with headers, major points, evidence
- `SUMMARIZE_EXAM` — key definitions, theorems, common exam questions, mnemonics
- `EXTRACT_CONCEPTS` — top 10 concepts with name, definition, importance (1-5), analogy
- `IMPLEMENTATION_STEPS` — actionable ordered step-by-step plan

All prompts enforce structured JSON output.

### `server/services/learning_service.py`
- Orchestrates prompt flow, parses LLM responses (retry once on malformed JSON)

### Frontend — `dashboard/projects/[id]/learning/page.tsx`
- Upload: drag-and-drop + file picker, progress indicator, document list
- Document detail:
  - Summary panel: Short / Detailed / Exam-ready toggles, Generate button, loading spinner
  - Key concepts: cards with name, definition, importance badge
  - Implementation steps: numbered list with checkboxes
  - Each output shows generated timestamp + regenerate option

### Verification
- [ ] Upload 10-page PDF → file in Supabase Storage, document record with `raw_text`, embeddings stored
- [ ] Generate short summary → appears in ≤8s, stored, persists on refresh
- [ ] All 3 summary levels generated and distinct
- [ ] Concepts extracted with definitions
- [ ] Implementation steps ordered and actionable
- [ ] 50+ page PDF handled without crash
- [ ] Non-PDF upload → clear error message

---

## Phase 6: Developer Productivity Module

**Goal:** Users paste code into a project and get explanations, component identification, improvement suggestions, and README generation.

### Backend — `server/routers/developer.py`
| Endpoint | Action |
|---|---|
| `POST /api/projects/{id}/code/explain` | `{code, language}` → LLM → store `code_insights` record → return explanation |
| `POST /api/projects/{id}/code/debug` | Identify bugs, edge cases, inefficiencies → return structured suggestions |
| `POST /api/projects/{id}/code/readme` | Generate README markdown → return |
| `GET /api/projects/{id}/code` | List all code insights |

### System Prompts — `server/services/prompts/developer_prompts.py`
- `EXPLAIN_CODE` — JSON: `{overview, components: [{name, purpose, lines}], patterns, complexity}`
- `DEBUG_CODE` — JSON: `{bugs: [{description, severity, line_hint, fix}], edge_cases, inefficiencies}`
- `GENERATE_README` — full README.md with title, description, installation, usage, API reference

### Frontend — `dashboard/projects/[id]/developer/page.tsx`
- Code input: large textarea + language dropdown + action buttons (Explain, Debug, Generate README)
- Explanation: collapsible sections (Overview, Components table, Patterns, Complexity)
- Debug: issues list with severity badges (critical/warning/info)
- README: rendered markdown preview + raw copy button
- History: previous code insights clickable to view

### Verification
- [ ] 50-line Python function → structured explanation with components stored in DB
- [ ] Code with obvious bug → bug identified with fix suggestion
- [ ] README generated from small project code → copy button works
- [ ] History panel shows previous insights
- [ ] Empty input → clear error
- [ ] 500+ line input → handled correctly

---

## Phase 7: Workflow Module

**Goal:** Users paste meeting transcripts or emails into a project and get structured task lists with priority classification.

### Backend — `server/routers/workflow.py`
| Endpoint | Action |
|---|---|
| `POST /api/projects/{id}/workflow/extract` | `{text, source_type: "transcript"\|"email"}` → LLM → store tasks → return |
| `GET /api/projects/{id}/tasks` | List tasks, filterable by priority/status |
| `PUT /api/projects/{id}/tasks/{task_id}` | Update status or priority |
| `DELETE /api/projects/{id}/tasks/{task_id}` | Remove task |

### System Prompts — `server/services/prompts/workflow_prompts.py`
- `EXTRACT_TASKS` — JSON array: `[{description, priority: 'high'|'medium'|'low', assignee_hint, deadline_hint}]`

### Frontend — `dashboard/projects/[id]/workflow/page.tsx`
- Input: textarea + source type toggle (Transcript / Email) + "Extract Tasks" button
- Task list: grouped by priority (High → Medium → Low), priority badge, assignee/deadline hints, checkbox
- Task management: edit description, change priority dropdown, delete with confirmation
- Stats bar: total, completed, pending by priority

### Verification
- [ ] Meeting transcript → 5-8 tasks extracted with priority, stored in DB
- [ ] Email thread → action items extracted correctly
- [ ] Mark task done → status updates
- [ ] Change priority → reflects immediately
- [ ] Delete task → removed from DB
- [ ] Empty input → clear error

---

## Phase 8: Context Persistence Engine & RAG

**Goal:** Core differentiator. Every module's outputs feed a unified project context. New queries are automatically augmented with relevant context from all modules.

### `server/services/context_engine.py`
- `get_full_context(project_id) -> ProjectContext` — aggregates from all tables (goal, constraints, decisions, recent summaries, code insights, open tasks)
- `build_context_prompt(project_id, user_query) -> str`:
  ```
  === PROJECT CONTEXT ===
  Project: {name}
  Goal: {goal}
  Constraints: {bullet list}
  Key Decisions: {bullet list}

  === RELEVANT KNOWLEDGE ===
  {top-k chunks from vector similarity search}

  === RECENT ACTIVITY ===
  Documents: {recent summary titles}
  Code Insights: {recent explanation summaries}
  Open Tasks: {task descriptions}

  === USER QUERY ===
  {user_query}
  ```
- `update_context(project_id, update_type, data)` — called by all modules post-generation
- `retrieve_relevant_chunks(project_id, query, top_k=5)` — embed query → pgvector search → return chunks with source attribution

### `server/services/rag_service.py`
- `query_with_context(project_id, user_query, user_id) -> dict`:
  1. Generate query embedding
  2. Retrieve top-k relevant chunks
  3. Build augmented prompt
  4. Call LLM
  5. Store in `chat_messages` with `context_used` metadata
  6. Return `{answer, context_used: [{source_type, source_id, chunk_preview}], provider, latency_ms}`

### `server/routers/chat.py`
- `POST /api/projects/{id}/chat` — `{message}` → `query_with_context` → return response
- `GET /api/projects/{id}/chat/history` — return previous messages

### Module Retrofitting
After each module generates output → call `update_context`:
- Document summarization → add summary to context
- Code explanation → add key insight to context
- Task extraction → add task list to context

### Frontend — `dashboard/projects/[id]/chat/page.tsx`
- Conversational layout (user messages right, AI left)
- Input bar at bottom with send button
- Each AI response: expandable "Context Used" section (documents, code insights, tasks referenced)
- Typing indicator during processing
- History loads on page open

### Updated Overview Tab
- Context health: "X documents, Y code insights, Z tasks feeding your AI context"
- Recent decisions (auto-extracted + manual)
- "Add Decision" and "Add Open Question" buttons

### Verification
- [ ] Upload React hooks PDF → summarize → ask "What did I learn about hooks?" → AI references document
- [ ] Paste React code → explain → ask "How does my code relate to my document?" → AI connects both
- [ ] Extract tasks from transcript → ask "What are my priorities?" → AI references tasks
- [ ] RAG retrieves correct chunks (not just summary)
- [ ] Project constraint "Python only" → ask "Should I use TypeScript?" → response acknowledges constraint
- [ ] `context_used` in response correctly attributes sources
- [ ] Chat history persists across sessions

---

## Phase 9: Drift Detection & Smart Features

**Goal:** System actively detects when AI outputs contradict project constraints, and provides intelligent query routing.

### `server/services/drift_detector.py`
- `check_drift(project_id, llm_response) -> list[DriftWarning]`:
  - Load project constraints
  - Rule-based checks: tech mentions not in constraints (keyword matching against tech taxonomy), architecture changes, language violations
  - LLM-based check: ask Gemini Flash "Does this response violate any of these constraints? → `{violates: bool, reason: str}`"
  - Return `[{type, severity, description, constraint_violated}]`
- Integrate into `rag_service.py`: run drift check after every LLM response, append warnings

### Drift UI
- Yellow warning banner on responses that trigger drift detection
- Shows: constraint violated, what the AI said
- User actions: Dismiss (false positive) or "Add to Decisions"

### Smart Query Routing
- Auto-detect user intent in chat:
  - "Summarize this PDF" → Learning module
  - "Explain this code" → Developer module
  - "What are my tasks?" → Workflow module
  - General → RAG pipeline
- Display subtle module badge on each response ("Answered via: Learning Module")

### Verification
- [ ] Constraint "React and TypeScript only" → ask about Vue → drift warning fires
- [ ] Ask about Python in a JavaScript-constrained project → flagged
- [ ] Dismiss a drift warning → does not reappear
- [ ] "Summarize my uploaded document" → routes to learning context, shows "Learning Module" badge
- [ ] "What bugs are in my code?" → routes to developer context

---

## Phase 10: Hybrid Inference, Landing Page, Deployment & Polish

**Goal:** Ship it. Working deployed product with local inference demo mode and a presentable landing page.

### Hybrid Inference
- `dashboard/settings/page.tsx`:
  - Inference mode toggle: Cloud (Gemini) / Local (Ollama)
  - Frontend sends `mode: "local"` header → backend selects `OllamaProvider`
  - Latency display on every AI response (cloud vs local)
  - "Privacy Mode" badge when local inference active
  - Frame: "Your data never leaves your machine. Production-ready for AMD Ryzen AI acceleration."

### Landing Page — `client/src/app/page.tsx`
- Hero: "CognifyOS — Persistent AI Context Layer" with tagline + CTA
- 3 feature sections: Learning Intelligence, Developer Productivity, Workflow Automation
- How it works: 3-step visual (Create Project → Add Content → AI Remembers Everything)
- Context persistence explainer (the differentiator)
- CTA → Sign up / Login
- Responsive, polished, minimal

### Error Handling Sweep
- Global error boundary in Next.js
- FastAPI exception handlers for 400, 401, 403, 404, 422, 500
- Rate limit feedback: if 429, show "AI is busy, retrying..." + auto-fallback
- File upload: 10 MB size limit, type validation, storage failures
- Network errors: offline detection, retry with exponential backoff

### Deployment
| Service | Steps |
|---|---|
| **Frontend → Vercel** | Connect GitHub repo, set env vars (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`, Google OAuth creds), deploy |
| **Backend → Render** | Create `Dockerfile` for FastAPI, set env vars (API keys, Supabase creds, JWT secret), add `render.yaml`, deploy |
| **Supabase** | Already hosted — no action needed |

Post-deploy:
- Set `NEXT_PUBLIC_API_URL` to Render's URL
- Update CORS in FastAPI to allow Vercel domain
- Update Google OAuth redirect URI to Vercel domain
- Update `NEXTAUTH_URL` to Vercel domain
- Run full test suite against production URLs

### Demo Script
| Flow | Steps |
|---|---|
| **Learning** | Create "ML Study" project → upload ML lecture PDF → generate exam-ready summary → ask "What are the key formulas?" → AI retrieves from document context |
| **Developer** | Same project → paste neural network code → explain → ask "How does this code implement the concepts from my notes?" → AI connects document + code |
| **Workflow** | Paste team meeting transcript → extract tasks → ask "Given my project goal, which task should I prioritize?" → AI uses goal + constraints + tasks |
| **Drift** | Add constraint "TensorFlow only" → ask "Should I use PyTorch?" → drift warning fires |
| **Hybrid** | Toggle to local inference → ask same question → response from Ollama → latency comparison shown |

### Final Verification

| Test | Expected |
|---|---|
| Complete auth flow | Register, login, logout, session persistence, Google OAuth — all work |
| Project CRUD | Create, edit constraints, delete — data integrity |
| PDF → Summary → Chat | Upload, summarize, query content — context persists |
| Code → Explain → Chat | Paste, explain, ask follow-up — context persists |
| Transcript → Tasks → Chat | Paste, extract, query priorities — context persists |
| Cross-module context | Query referencing docs + code + tasks — AI uses all three |
| Drift detection | Constraint violation flagged in real-time |
| Hybrid inference | Toggle cloud/local — both work, latency displayed |
| Deployed URLs | Frontend + backend fully functional on Vercel + Render |
| Mobile responsive | Dashboard usable on tablet/phone |

---

## Phase Summary

| Phase | Deliverable | Status |
|---|---|---|
| 0 | Tear Down & Prep | ⬜ |
| 1 | Project Scaffold & Dev Environment | ⬜ |
| 2 | Authentication & User Management | ⬜ |
| 3 | Project System & Data Model | ⬜ |
| 4 | LLM Abstraction Layer & PDF Processing | ⬜ |
| 5 | Learning Module | ⬜ |
| 6 | Developer Productivity Module | ⬜ |
| 7 | Workflow Module | ⬜ |
| 8 | Context Persistence Engine & RAG | ⬜ |
| 9 | Drift Detection & Smart Features | ⬜ |
| 10 | Hybrid Inference, Landing Page & Deployment | ⬜ |
