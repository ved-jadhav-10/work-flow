# Workflow AI MVP — Phase-Based Execution Plan

**TL;DR:** 10 sequential phases, each producing a testable, working increment. No phase starts until the previous one passes its verification checklist. Every phase ends with a functioning product — just with fewer features. The Persistent Context Engine (Phase 7) is the differentiator, deliberately placed after all feature modules exist so it has real data to work with. The architecture uses an LLM abstraction layer from day one, making the AWS migration a provider swap, not a rewrite.

---

## Phase 0: Tear Down & Prep

**Goal:** Clean slate. Dev environment ready. All accounts created. No code written yet.

- Delete the existing `client` and `server` directories entirely — they are not reusable
- Create accounts and collect credentials:
  - **Neon** — create a free PostgreSQL project → note `DATABASE_URL`
  - **Appwrite** — create project + storage bucket → note `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, `APPWRITE_BUCKET_ID`
  - **Google AI Studio** — generate a Gemini API key → note `GEMINI_API_KEY`
  - **Groq** — create account → generate API key → note `GROQ_API_KEY`
  - **GitHub** — create OAuth App for login → note `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Install global tooling on dev machine:
  - Node.js 20+, Python 3.11+, pip, venv, Git
  - Ollama (download from ollama.com, pull `phi3:mini` model — needed later in Phase 9)
- Create a `.env.example` file at repo root documenting every env var the project needs (no secrets committed)

### Verification
- [ ] All API keys/URLs collected and tested (Gemini: curl a test prompt; Neon: dashboard loads; GitHub OAuth: app settings show client ID)
- [ ] Ollama runs locally: `ollama run phi3:mini "hello"` returns a response
- [ ] Empty repo, ready for Phase 1

---

## Phase 1: Project Scaffold & Dev Environment

**Goal:** Both apps boot, talk to each other, and connect to Neon PostgreSQL. Zero features, but the skeleton compiles and runs.

### Frontend (React + Vite)
- Initialize with: `npm create vite@latest client -- --template react-ts`
- Install dependencies: `react-router-dom`, `react-syntax-highlighter`, `lucide-react`, `axios`, `tailwindcss`, `@tailwindcss/vite`
- Create folder structure:
  ```
  client/src/
    main.tsx                  # App entry point, mounts <App />
    App.tsx                   # Router setup with React Router
    pages/
      Landing.tsx             # Landing page (placeholder)
      Login.tsx               # Login page
      Register.tsx            # Register page
      Dashboard.tsx           # Dashboard home
      ProjectOverview.tsx     # Project detail with tabs
      Learning.tsx            # Learning module
      Developer.tsx           # Developer module
      Workflow.tsx            # Workflow module
      Chat.tsx                # Chat module
      Settings.tsx            # Settings page
    components/
      ui/                     # Reusable UI primitives
      layout/
        Sidebar.tsx           # Sidebar navigation
        DashboardLayout.tsx   # Dashboard shell (sidebar + main)
        ProjectLayout.tsx     # Project tab navigation
        AuthGuard.tsx         # Route protection (redirects to /login)
    context/
      AuthContext.tsx         # Auth state (JWT, user) via React Context
    lib/
      api.ts                  # Axios/fetch client (attaches JWT)
    types/
      index.ts                # Shared TypeScript interfaces
  ```
- Set up Tailwind CSS via Vite plugin
- Create `App.tsx` that wraps routes in `<AuthProvider>` and `<BrowserRouter>`

### Backend (FastAPI)
- Create Python virtual environment: `python -m venv venv`
- Install dependencies: `fastapi`, `uvicorn[standard]`, `sqlalchemy`, `python-multipart`, `pymupdf`, `pdfplumber`, `google-genai`, `groq`, `httpx`, `pydantic-settings`, `python-jose[cryptography]`, `bcrypt`, `appwrite`, `pgvector`, `pytest`, `pytest-asyncio`
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
- Frontend `Landing.tsx` calls `http://localhost:8000/api/health` and displays result
- Backend connects to Neon PostgreSQL via SQLAlchemy, runs test query on startup, logs confirmation

### Verification
- [ ] `cd client && npm run dev` → Vite dev server on `localhost:5173`
- [ ] `cd server && uvicorn main:app --reload` → FastAPI on `localhost:8000`, Swagger at `/docs`
- [ ] Frontend displays "Server is healthy"
- [ ] Backend logs confirm Neon DB connection
- [ ] No TypeScript errors, no Python import errors

---

## Phase 2: Authentication & User Management

**Goal:** Users can register, log in (GitHub OAuth + email/password), and access a protected dashboard. Unauthenticated users are redirected to login.

### Database
- Create `users` table: `id` (UUID, PK), `name`, `email` (unique), `hashed_password` (nullable), `provider` (github/credentials), `avatar_url`, `created_at`

### Backend
- `server/routers/auth.py`:
  - `POST /api/auth/register` — hash password with bcrypt, insert user, return JWT + user
  - `POST /api/auth/login` — validate credentials, return JWT (signed with `python-jose`)
  - `POST /api/auth/oauth` — accept GitHub OAuth data, upsert user, return JWT
  - `GET /api/auth/me` — protected, decode JWT, return current user
- `server/middleware/auth.py` — FastAPI dependency that validates JWT from `Authorization: Bearer` header, injects `current_user`

### Frontend
- `client/src/context/AuthContext.tsx` — React Context for auth state:
  - Stores JWT + user in state (persisted to `localStorage`)
  - `login()`, `register()`, `loginWithGithub()`, `logout()` methods
  - On mount, validates stored token via `GET /api/auth/me`
  - Exposes `isAuthenticated`, `user`, `token` to the app
- `client/src/components/layout/AuthGuard.tsx` — wrapper component that redirects to `/login` if not authenticated
- `Login.tsx` — email/password form, "Sign in with GitHub" button, link to register
- `Register.tsx` — name/email/password form, "Sign up with GitHub" button
- `DashboardLayout.tsx` — sidebar with logo, nav links, user avatar + logout
- React Router config in `App.tsx` — `/dashboard/*` routes wrapped in `<AuthGuard>`

### Verification
- [ ] Register with email/password → user in Neon DB with hashed password
- [ ] Login → redirected to `/dashboard`, JWT persists on refresh
- [ ] GitHub OAuth → new user created with `provider: "github"`, lands on dashboard
- [ ] Visit `/dashboard` without auth → redirected to `/login`
- [ ] Logout → token cleared → redirected to `/login`
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
- `Dashboard.tsx` — project cards grid, "New Project" button (route: `/dashboard`)
- `NewProject.tsx` — create form (name, goal, constraints as tag input) (route: `/dashboard/projects/new`)
- `ProjectOverview.tsx` — detail view with tab navigation (route: `/dashboard/projects/:id`)
- `ProjectLayout.tsx` — shared layout with tab links (Overview, Learning, Developer, Workflow, Chat)
- Overview tab: project name, goal, constraints (editable inline), decisions, open questions, stats

### Verification
- [ ] Create 3 projects → all appear in dashboard
- [ ] Edit constraints → save → refresh → persists
- [ ] Delete project → removed from list
- [ ] User A cannot see User B's projects
- [ ] All tables exist in Neon DB with correct columns

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
- `upload_file(file_bytes, filename, project_id) -> str` — Appwrite Storage, returns file ID
- `download_file(file_id) -> bytes` — retrieves file from Appwrite
- `get_file_metadata(file_id) -> dict` — file info from Appwrite
- `delete_file(file_id)` — removes from Appwrite storage

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

### Frontend — `client/src/pages/Learning.tsx`
- Upload: drag-and-drop + file picker, progress indicator, document list
- Document detail:
  - Summary panel: Short / Detailed / Exam-ready toggles, Generate button, loading spinner
  - Key concepts: cards with name, definition, importance badge
  - Implementation steps: numbered list with checkboxes
  - Each output shows generated timestamp + regenerate option

### Verification
- [ ] Upload 10-page PDF → file in Appwrite Storage, document record with `raw_text`, embeddings stored in Neon
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

### Frontend — `client/src/pages/Developer.tsx`
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

### Frontend — `client/src/pages/Workflow.tsx`
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

### Frontend — `client/src/pages/Chat.tsx`
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
- `client/src/pages/Settings.tsx` (route: `/dashboard/settings`):
  - Inference mode toggle: Cloud (Gemini) / Local (Ollama)
  - Frontend sends `X-Inference-Mode: "local"` header → backend selects `OllamaProvider`
  - Latency display on every AI response (cloud vs local)
  - "Privacy Mode" badge when local inference active
  - Frame: "Your data never leaves your machine. Production-ready for AMD Ryzen AI acceleration."

### Landing Page — `client/src/pages/Landing.tsx`
- Hero: "CognifyOS — Persistent AI Context Layer" with tagline + CTA
- 3 feature sections: Learning Intelligence, Developer Productivity, Workflow Automation
- How it works: 3-step visual (Create Project → Add Content → AI Remembers Everything)
- Context persistence explainer (the differentiator)
- CTA → Sign up / Login
- Responsive, polished, minimal

### Error Handling Sweep
- Global React `ErrorBoundary` component wrapping the dashboard layout
- FastAPI exception handlers for 400, 401, 403, 404, 422, 500
- Rate limit feedback: if 429, show "AI is busy, retrying..." + auto-fallback
- File upload: 10 MB size limit, type validation, Appwrite storage failures
- Network errors: offline detection, retry with exponential backoff

### Deployment
| Service | Steps |
|---|---|
| **Frontend** | Build with `npm run build` → deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages) → set `VITE_API_URL` env var |
| **Backend → Render** | Create `Dockerfile` for FastAPI, set env vars (API keys, Neon DB URL, Appwrite creds, JWT secret), add `render.yaml`, deploy |
| **Neon** | Already hosted — no action needed |
| **Appwrite** | Already hosted — no action needed |

Post-deploy:
- Set `VITE_API_URL` to backend's production URL
- Update CORS in FastAPI to allow production frontend domain
- Update GitHub OAuth redirect URI to production domain
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
| Complete auth flow | Register, login, logout, session persistence, GitHub OAuth — all work |
| Project CRUD | Create, edit constraints, delete — data integrity |
| PDF → Summary → Chat | Upload to Appwrite, summarize, query content — context persists |
| Code → Explain → Chat | Paste, explain, ask follow-up — context persists |
| Transcript → Tasks → Chat | Paste, extract, query priorities — context persists |
| Cross-module context | Query referencing docs + code + tasks — AI uses all three |
| Drift detection | Constraint violation flagged in real-time |
| Hybrid inference | Toggle cloud/local — both work, latency displayed |
| Deployed URLs | Frontend + backend fully functional on production hosts |
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






Phase 7: Workflow Module
Goal: Users paste meeting transcripts or emails into a project, get structured task lists with priority classification. Tasks are stored and manageable.

Steps

Create server/services/prompts/workflow_prompts.py with EXTRACT_TASKS system prompt. Pattern: follow existing prompt files like learning_prompts.py and developer_prompts.py. The prompt accepts {source_type} (transcript/email) and instructs the LLM to return a JSON array of [{description, priority, assignee_hint, deadline_hint}].

Create server/services/workflow_service.py with:

async def extract_tasks(project_id, text, source_type, db) — calls get_llm_service().generate() with the workflow prompt, parses resulting JSON array, creates Task ORM instances (model already exists at task.py), saves to Neon via SQLAlchemy db.add_all() + db.commit(), returns the created tasks. Follow the JSON-retry pattern used in learning_service.py (strip markdown fences, json.loads, fallback).
async def list_tasks(project_id, db, priority_filter, status_filter) — query Task table with optional filters.
async def update_task(task_id, project_id, data, db) — update status/priority/description.
async def delete_task(task_id, project_id, db) — delete from DB.
Create server/schemas/workflow.py with Pydantic models:

ExtractTasksRequest(text: str, source_type: Literal["transcript", "email"])
TaskUpdate(status: Optional[TaskStatus], priority: Optional[TaskPriority], description: Optional[str])
TaskResponse (mirrors the Task ORM model)
Create server/routers/workflow.py with endpoints:

POST /api/projects/{project_id}/workflow/extract — accepts ExtractTasksRequest, calls extract_tasks(), returns created tasks
GET /api/projects/{project_id}/tasks — query params priority, status, calls list_tasks()
PUT /api/projects/{project_id}/tasks/{task_id} — accepts TaskUpdate, calls update_task()
DELETE /api/projects/{project_id}/tasks/{task_id} — calls delete_task()
All endpoints use get_current_user dependency from auth.py and get_db from database.py. Verify the project belongs to the user (follow pattern in projects.py).
Register the router in main.py — uncomment/add from routers import workflow and app.include_router(workflow.router).

Build the frontend Workflow tab at client/src/pages/Workflow.tsx (currently a stub):

Input section: Large textarea with source-type toggle (Transcript / Email), "Extract Tasks" button. Loading state during LLM processing.
Task list: Grouped by priority (High → Medium → Low), each task shows description, priority badge (color-coded), optional assignee/deadline hints, checkbox to mark done.
Task management: Inline edit description, change priority via dropdown, delete with confirmation dialog.
Stats bar: Total tasks, completed count, pending by priority.
Uses workflowApi from api.ts (stubs already exist with correct endpoint paths). Types Task, TaskPriority, TaskStatus already defined in index.ts.
Verification

Paste a meeting transcript → extract 5–8 tasks → each has priority → tasks appear in list → persisted in Neon DB
Paste an email thread → extract action items correctly
Mark task done → status updates, moves to completed section
Change priority → reflects immediately
Delete task → removed from list and DB
Empty input → clear error message
Refresh page → tasks reload from DB
Phase 8a: Context Persistence Engine & RAG Pipeline (Backend)
Goal: Build the backend infrastructure that aggregates all project data into a unified context and implements RAG for context-augmented AI responses.

Steps

Create server/services/context_engine.py with:

async def get_full_context(project_id, db) -> dict — query Project (goal, constraints, decisions, open_questions), last 5 Document summaries, last 5 CodeInsight explanations, open Task items. All via SQLAlchemy queries against Neon. Return structured dict.
async def build_context_prompt(project_id, user_query, db) -> str — call get_full_context() + retrieve_relevant_chunks(), construct the augmented prompt string with sections: === PROJECT CONTEXT ===, === RELEVANT KNOWLEDGE === (from vector search), === RECENT ACTIVITY ===, === USER QUERY ===.
async def update_context(project_id, update_type, data, db) — called by other modules to add decisions/context. Updates the Project record's decisions or open_questions JSONB fields.
async def retrieve_relevant_chunks(project_id, query, db, top_k=5) -> list[dict] — generate query embedding via generate_embedding() from embedding_service.py, then call similarity_search() (already implemented — uses pgvector <=> cosine distance), return top-k chunks with source attribution (source_type, source_id, chunk_preview).
Create server/services/rag_service.py with:

async def query_with_context(project_id, user_query, user_id, db) -> dict — orchestrates the full RAG pipeline:
Call build_context_prompt() from context engine
Call get_llm_service().generate() with the augmented prompt
Store user message + AI response as ChatMessage records in Neon (model at chat_message.py)
Populate context_used JSONB on the assistant message with source references
Return {answer, context_used: [{source_type, source_id, chunk_preview}], provider, latency_ms}
Create server/routers/chat.py with:

POST /api/projects/{project_id}/chat — accepts {message: str}, calls query_with_context(), returns response
GET /api/projects/{project_id}/chat/history — query ChatMessage table ordered by created_at, return list
Both use get_current_user + get_db dependencies, verify project ownership
Create server/schemas/chat.py (if needed) with ChatRequest(message: str), ChatResponse(answer, context_used, provider, latency_ms), ChatMessageResponse.

Register chat router in main.py.

Verification

POST /api/projects/{id}/chat with a question → returns answer + context_used + provider + latency_ms
GET /api/projects/{id}/chat/history → returns messages in order
Upload a document, summarize it, then ask about it in chat → RAG retrieves relevant chunks from embeddings (not just summary)
Ask a question about project constraints → response references constraint data
Chat messages persist in Neon across sessions
Phase 8b: Chat UI & Module Retrofitting
Goal: Build the Chat frontend and wire all existing modules (Learning, Developer, Workflow) to feed the context engine, so context grows as the user works.

Steps

Build the Chat tab at client/src/pages/Chat.tsx (currently a stub):

Message list: User messages right-aligned, AI messages left-aligned, auto-scroll to bottom.
Input bar: Fixed at bottom, text input + send button, disabled during processing.
Context attribution: Each AI response has an expandable "Context Used" section showing which documents, code insights, and tasks were referenced (use ContextReference type from index.ts).
Typing indicator: Show during LLM processing (optimistic UI — show user message immediately, then stream/show AI response).
History: Load chat history on page mount via chatApi.history() from api.ts.
Provider + latency: Show small badge on AI messages with provider name and response time.
Update client/src/pages/ProjectOverview.tsx (project overview) to show:

Context health bar: "X documents, Y code insights, Z tasks feeding your AI context" (aggregate counts already returned by projects API).
Recent decisions: List from project.decisions, with "Add Decision" + "Add Open Question" buttons.
Retrofit Learning module — in learning_service.py, after summarise(), extract_concepts(), and generate_steps() complete, call update_context() from context engine to store key insights as decisions/context. This ensures documents feed the RAG pipeline. (Embeddings are already generated on upload — this step adds structured context.)

Retrofit Developer module — in developer_service.py, after explain() and debug() complete, call update_context() with the key insight summary. Also generate embeddings for code explanations (call generate_embeddings_batch() + store Embedding records with source_type="code_insight").

Retrofit Workflow module — in workflow_service.py (built in Phase 7), after extract_tasks() completes, call update_context() with the task list summary.

Verification

Upload PDF → summarize → switch to Chat → ask "What did I learn about X?" → AI references the document summary
Paste code → explain → ask in chat "How does my code relate to my document?" → AI connects both
Extract tasks → ask "What are my priorities?" → AI references tasks
RAG retrieves correct chunks (not just summaries) from pgvector
Create project with constraint "Python only" → ask "Should I use TypeScript?" → response acknowledges constraint
context_used in response correctly attributes sources
Chat history persists across page reloads / sessions
Project overview shows context health and editable decisions
Phase 9: Drift Detection & Smart Features
Goal: System actively detects when AI outputs contradict project constraints, and chat auto-routes queries to the right module.

Steps

Create server/services/drift_detector.py with:

async def check_drift(project_id, llm_response, db) -> list[DriftWarning]:
Load project constraints from Project model in Neon
Rule-based checks: keyword matching — technology mentions not in constraints (maintain a tech taxonomy dict), architecture mismatches, language violations
LLM-based check (lightweight): call get_llm_service().generate() with Gemini Flash, prompt: "Does this response violate any of these constraints: {constraints}? Respond JSON: {violates: bool, reason: str}"
Return [{type, severity, description, constraint_violated}]
Integrate into server/services/rag_service.py — after every LLM response in query_with_context(), run check_drift(), append warnings to the ChatMessage record's context_used or a new drift_warnings field. Return warnings in API response.

Add drift_warnings JSONB column to chat_messages table if not already present — check 002_create_project_tables.sql and chat_message.py. Create a new migration server/migrations/003_add_drift_warnings.sql if needed.

Build smart query routing in server/services/rag_service.py:

Before RAG, detect intent from user query using keyword heuristics or a lightweight LLM classification call
"Summarize this PDF" → route to Learning context (prioritize document chunks)
"Explain this code" → route to Developer context (prioritize code insight chunks)
"What are my tasks?" → route to Workflow context (prioritize task data)
General → full RAG pipeline
Add routed_module field to response
Update Chat UI in client/src/pages/Chat.tsx:

Drift warning banner: Yellow/amber banner on AI responses that trigger drift detection. Shows which constraint was violated and what the AI said. User can dismiss (false positive) or "Add to Decisions" (acknowledge the deviation — calls project update API to append to decisions array).
Module routing badge: Small chip on each AI response showing "Answered via: Learning / Developer / Workflow / RAG".
Use DriftWarning type already defined in index.ts.
Verification

Set constraint "React and TypeScript only" → ask "How would I build this in Vue?" → response WITH drift warning
Ask about Python in a JavaScript-constrained project → drift flagged
Dismiss a drift warning → does not reappear (dismissed state persisted or local)
"Add to Decisions" → decision added to project, visible on overview page
Ask "Summarize my uploaded document" → routes to learning context, shows "Learning Module" badge
Ask "What bugs are in my code?" → routes to developer context
Phase 10: Hybrid Inference, Error Handling & Polish
Goal: Production-ready application with local inference demo, robust error handling, and deployment preparation. No landing page changes.

Steps

Hybrid Inference UI — Create client/src/pages/Settings.tsx:

Inference mode toggle: Cloud (Gemini) / Local (Ollama) / Groq. Stores preference in localStorage or user session.
When "Local" selected, frontend sends X-Inference-Mode: local header with API requests (infrastructure already in api.ts — the request() function accepts inferenceMode parameter).
Backend reads header, selects provider via get_llm_service(mode=...) — already implemented in llm_service.py.
Show latency comparison: display response time on every AI response across all modules.
"Privacy Mode" badge in sidebar when local inference is active.
Frame: "Your data never leaves your machine."
Add Settings link to Sidebar.tsx.

Error handling sweep (backend) — in main.py:

Global FastAPI exception handlers for 400, 401, 403, 404, 422, 500 with consistent JSON error format.
Rate limit (429) handling: if LLM provider returns 429, auto-fallback is already implemented in LLMService._try_providers(), but add user-facing message.
File upload validation: enforce 10 MB limit (currently 20 MB in pdf_service.py), type validation, Appwrite storage failure handling.
Error handling sweep (frontend):

Global React ErrorBoundary component wrapping the DashboardLayout.
Network error detection in api.ts: offline detection, retry with exponential backoff for transient failures.
User-friendly error messages for LLM busy (429), upload too large, auth expired.
Missing CRUD operations:

Add document delete endpoint in learning.py — delete document record from Neon + delete file from Appwrite via delete_file() in file_storage.py + delete associated embeddings.
Add code insight delete endpoint in developer.py.
Deployment prep (target TBD):

Create Dockerfile for FastAPI backend
Document env vars needed: DATABASE_URL (Neon), APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_BUCKET_ID, GEMINI_API_KEY, GROQ_API_KEY, JWT_SECRET
Update CORS in config.py to accept production frontend domain
Update GitHub OAuth redirect URI for production
Update VITE_API_URL for production
Verification

Test	Expected
Complete auth flow	Register, login, logout, session persistence, GitHub OAuth
Project CRUD	Create, edit constraints, delete — data integrity in Neon
PDF → Summary → Chat	Upload to Appwrite, summarize, query about content — context persists
Code → Explain → Chat	Paste, explain, ask follow-up — context persists
Transcript → Tasks → Chat	Extract, query priorities — context persists
Cross-module context	Question referencing docs + code + tasks — AI uses all three
Drift detection	Constraint violation flagged in real-time
Hybrid inference	Toggle Cloud/Local/Groq — all work, latency displayed
Delete document	Removed from Neon DB + Appwrite storage + embeddings cleaned
Error boundary	React errors caught gracefully, not white screen
Network failure	Retry with backoff, user sees "Retrying..." message
429 from LLM	Auto-fallback to next provider, user sees "AI busy, trying fallback..."
Mobile responsive	Dashboard usable on tablet/phone
