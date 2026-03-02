# Workflow — Where ideas bloom under starlight

> A persistent AI context layer for developers, students, and knowledge workers — built with Next.js 15 and FastAPI.

Workflow is an intelligent project workspace that maintains persistent context across documents, code, and conversations. Unlike traditional AI tools that forget between sessions, Workflow builds a vector-indexed knowledge base from everything you add and uses it to deliver context-aware AI assistance that evolves with your work.

## Vision

Most AI assistants suffer from **context amnesia** — every conversation starts from scratch. Workflow solves this with:

- **Persistent Memory** — Documents, code, and tasks feed a unified project context
- **Cross-Module Intelligence** — AI references your uploaded PDFs when explaining code
- **Smart Drift Detection** — Flags responses that violate project constraints
- **Hybrid Inference** — Cloud (Gemini) or local (Ollama), your choice
- **RAG-Powered Chat** — Every query is augmented with relevant project knowledge

---

## Landing Page

The public landing page (`/`) features a cinematic hero section with:

- **Vibrant background image** with CSS filters (`brightness-110`, `saturate-150`, `contrast-1.15`) and a radial vignette overlay that darkens only behind the heading text while keeping the edges vivid
- **Canvas-based animated starfield** — an HTML5 `<canvas>` particle system (`StarryBackground` component) with varying star sizes, sinusoidal twinkle, slow drift, and `mix-blend-mode: screen`
- **Playfair Display** italic accent for the "*ideas bloom*" tagline in gold (`#d4aa70`)
- Sections: Hero → How It Works → Features (Learning / Developer / Workflow cards) → Context Persistence → Privacy & Drift → CTA → Footer

---

## Features

### Authentication & User Management

- Email/password registration with bcrypt hashing
- GitHub OAuth via NextAuth v5 (Auth.js)
- Server-side session validation in Next.js middleware
- Protected routes with automatic redirect to `/login`

### Project System

- Create and manage multiple projects
- Define project goals and constraints
- Track decisions and open questions
- JSONB-based flexible metadata storage
- Full CRUD with user isolation

### Database Schema

PostgreSQL + pgvector (hosted on Neon):

| Table | Purpose |
|-------|---------|
| Users | Authentication and profiles |
| Projects | Core project metadata |
| Documents | PDF storage and analysis |
| Code Insights | Code explanations and suggestions |
| Tasks | Priority-based task management |
| Embeddings | Vector storage (768-dim via Gemini) |
| Chat Messages | Conversation history with context |

### LLM Abstraction Layer

- **Multi-Provider**: Gemini (primary), Groq (fallback), Ollama (local)
- **Automatic Fallback**: Switches on rate limits / failures
- **Unified Interface**: Single API across all providers
- **Latency Tracking**: Per-provider performance monitoring

### PDF Processing Pipeline

- Text extraction (PyMuPDF) with table extraction (pdfplumber)
- Intelligent chunking with overlap
- Embedding generation (`text-embedding-004`)
- Appwrite Storage integration

### Learning Module

- Drag-and-drop PDF upload with Framer Motion animations
- Glassmorphic document grid with concept pills
- Slide-out summary side-panel
- Smart summarisation: Short / Detailed / Exam-ready modes
- Key concept extraction with importance scores
- Implementation step generation
- Automatic vector embedding for RAG

### Developer Productivity Module

- Structured code explanation with component breakdowns
- Bug detection with severity levels
- README generation from code
- Multi-language syntax highlighting
- Code history tracking

### Workflow Automation Module

- Meeting transcript and email task extraction
- AI-classified priority (High / Medium / Low)
- Task status management and re-prioritisation
- Source attribution back to original text

---

## Architecture

### Tech Stack

#### Frontend — Next.js 15 (App Router)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19, TypeScript 5 |
| Auth | NextAuth v5 (Auth.js) — GitHub OAuth + Credentials |
| Styling | Tailwind CSS 4 (PostCSS plugin) |
| Animations | Framer Motion 12, HTML5 Canvas (starfield) |
| Fonts | Geist Sans/Mono, Playfair Display (via `next/font`) |
| HTTP | Axios + server-side fetch |
| Icons | lucide-react |
| Syntax | react-syntax-highlighter |

#### Backend — FastAPI

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.115 (async) |
| Database | Neon PostgreSQL 16 + pgvector |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT (python-jose) + bcrypt |
| File Storage | Appwrite Cloud (private bucket) |
| AI | Gemini (`gemini-2.0-flash`), Groq (`llama-3.1-70b`), Ollama (`phi3:mini`) |
| PDF | PyMuPDF + pdfplumber |
| Testing | pytest + pytest-asyncio |

#### Infrastructure

- **Database**: Neon (managed PostgreSQL + pgvector)
- **File Storage**: Appwrite Cloud
- **Frontend Hosting**: Vercel (or any Node.js host)
- **Backend Hosting**: Render (Dockerised) — see `render.yaml`

### Project Structure

```
work-flow/
├── client/                          # Next.js 15 frontend
│   ├── src/
│   │   ├── middleware.ts            # Auth middleware (session check)
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout (fonts, providers)
│   │   │   ├── page.tsx             # Landing page (hero, features, CTA)
│   │   │   ├── globals.css          # Tailwind + custom keyframes
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── api/auth/[...nextauth]/route.ts
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx       # Dashboard shell (sidebar)
│   │   │       ├── page.tsx         # Projects grid
│   │   │       ├── settings/page.tsx
│   │   │       └── projects/
│   │   │           ├── new/page.tsx
│   │   │           └── [id]/
│   │   │               ├── layout.tsx
│   │   │               ├── page.tsx       # Project overview
│   │   │               ├── chat/page.tsx
│   │   │               ├── learning/page.tsx
│   │   │               ├── developer/page.tsx
│   │   │               └── workflow/page.tsx
│   │   ├── components/
│   │   │   ├── StarryBackground.tsx # Canvas particle starfield
│   │   │   ├── layout/Sidebar.tsx
│   │   │   └── providers/
│   │   │       ├── Providers.tsx     # NextAuth SessionProvider
│   │   │       └── ErrorBoundary.tsx
│   │   ├── lib/
│   │   │   ├── auth.ts              # NextAuth config (GitHub + Credentials)
│   │   │   ├── api.ts               # Backend API client
│   │   │   └── inference.ts         # LLM inference helpers
│   │   └── types/index.ts
│   ├── public/
│   │   └── hero-bg.jpg              # Landing page background
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # FastAPI backend
│   ├── main.py                      # App entry, CORS, routers
│   ├── config.py                    # Pydantic Settings (.env)
│   ├── database.py                  # SQLAlchemy engine + session
│   ├── models/                      # ORM models
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── document.py
│   │   ├── code_insight.py
│   │   ├── task.py
│   │   ├── embedding.py
│   │   └── chat_message.py
│   ├── schemas/                     # Pydantic request/response
│   │   ├── auth.py
│   │   ├── project.py
│   │   ├── learning.py
│   │   ├── developer.py
│   │   ├── chat.py
│   │   └── workflow.py
│   ├── routers/                     # API endpoints
│   │   ├── auth.py
│   │   ├── projects.py
│   │   ├── learning.py
│   │   ├── developer.py
│   │   ├── workflow.py
│   │   └── chat.py
│   ├── services/                    # Business logic
│   │   ├── llm_service.py
│   │   ├── pdf_service.py
│   │   ├── embedding_service.py
│   │   ├── rag_service.py
│   │   ├── context_engine.py
│   │   ├── drift_detector.py
│   │   ├── file_storage.py
│   │   ├── learning_service.py
│   │   ├── developer_service.py
│   │   ├── workflow_service.py
│   │   └── prompts/
│   │       ├── chat_prompts.py
│   │       ├── learning_prompts.py
│   │       ├── developer_prompts.py
│   │       └── workflow_prompts.py
│   ├── middleware/auth.py           # JWT validation dependency
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_project_tables.sql
│   │   └── 003_add_drift_and_routing.sql
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── render.yaml                      # Render deployment config
├── plan.md                          # 10-phase execution plan
└── package.json                     # Root workspace
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+ and pip
- **Neon** account (free-tier PostgreSQL with pgvector)
- **Appwrite** account (free-tier file storage)
- **API Keys**: Google AI Studio (Gemini), Groq (optional), GitHub OAuth App

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd work-flow

# Frontend
cd client
npm install

# Backend
cd ../server
python -m venv venv
.\venv\Scripts\Activate   # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Variables

**`server/.env`**

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=...
APPWRITE_API_KEY=...
APPWRITE_BUCKET_ID=...

GEMINI_API_KEY=...
GROQ_API_KEY=...

JWT_SECRET=generate-a-random-secret
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi3:mini
```

**`client/.env.local`**

```env
BACKEND_URL=http://localhost:8000
AUTH_SECRET=generate-a-random-secret
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### 3. Database Setup

1. Enable pgvector in your Neon SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
2. Run the migration files in order:
   - `server/migrations/001_create_users.sql`
   - `server/migrations/002_create_project_tables.sql`
   - `server/migrations/003_add_drift_and_routing.sql`

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd client
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/api/health |

---

## Usage

1. **Register** — email/password or GitHub OAuth at `/register`
2. **Create a project** — set name, goal, and constraints from the dashboard
3. **Learning** — upload PDFs, generate summaries, extract concepts
4. **Developer** — paste code for explanations, bug detection, README generation
5. **Workflow** — paste transcripts to extract prioritised tasks
6. **Chat** — context-aware AI assistant referencing all project content

---

## Testing

```bash
cd server
pytest
```

Covers: LLM provider fallback, PDF extraction/chunking, embedding generation, vector similarity search.

---

## Status

| Phase | Feature | Status |
|-------|---------|--------|
| 0 | Environment Setup | ✅ Complete |
| 1 | Project Scaffold | ✅ Complete |
| 2 | Authentication (NextAuth v5) | ✅ Complete |
| 3 | Project System | ✅ Complete |
| 4 | LLM & PDF Services | ✅ Complete |
| 5 | Learning Module | ✅ Complete |
| 6 | Developer Module | ✅ Complete |
| 7 | Workflow Module | ✅ Complete |
| 8 | Context Engine & RAG | 🔜 Next |
| 9 | Drift Detection | 📋 Planned |
| 10 | Deployment & Polish | 📋 Planned |

---

## Roadmap

### Q1 2026

- ✅ Core auth, project management, and all three intelligence modules
- ✅ Next.js 15 migration with NextAuth v5
- ✅ Cinematic landing page with canvas starfield
- 🔜 Context Persistence Engine & RAG-powered chat

### Q2 2026

- Drift detection and constraint enforcement
- Smart query routing
- Hybrid inference (cloud / local toggle)
- Production deployment (Vercel + Render)

### Q3 2026

- Team collaboration features
- Advanced analytics dashboard
- Plugin system for custom modules

### Q4 2026

- Self-hosted option (Docker Compose)
- Enterprise features (SSO, audit logs)
- Fine-tuned domain-specific models

---

## Deployment

### Frontend — Vercel

```bash
cd client
npm run build   # produces .next/
# Deploy via Vercel CLI or Git integration
```

Set `BACKEND_URL`, `AUTH_SECRET`, and OAuth env vars in the Vercel dashboard.

### Backend — Render

A `render.yaml` is included at the repo root. Connect the GitHub repo to Render, set the environment variables listed above, and deploy.

### Post-Deploy Checklist

- [ ] Set `BACKEND_URL` to production backend URL
- [ ] Update CORS origins in FastAPI `main.py`
- [ ] Update GitHub OAuth redirect URI
- [ ] Verify all features in production
- [ ] Set up monitoring (Sentry, etc.)

---

## Acknowledgements

- **Next.js** & **React** for the frontend framework
- **FastAPI** for the async Python backend
- **Neon** for managed PostgreSQL with pgvector
- **Appwrite** for managed file storage
- **Google Gemini**, **Groq**, and **Ollama** for AI inference
- **Framer Motion** for animations
- **Tailwind CSS** for utility-first styling

---

## License

MIT — see `LICENSE` for details.

---

*Where ideas bloom under starlight.*
