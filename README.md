# Workflow — Where ideas bloom under starlight

> **A persistent AI context layer for developers, students, and knowledge workers.**

Every AI tool today suffers from the same critical flaw: **context amnesia**. Ask ChatGPT to review your code at 2 PM and it has no memory of the PDF research you uploaded that morning. Switch to a coding assistant and your project constraints vanish. Each conversation starts from zero.

**Workflow fixes this.** It builds a vector-indexed knowledge base from every document, code snippet, and task in your project — then uses that accumulated context to deliver AI assistance that actually *understands* your work. Upload a research paper, then ask the chat a question weeks later — it remembers. Write code that contradicts your project constraints — it warns you.

---

## Why Workflow Matters

| Problem | Workflow's Solution |
|---------|-------------------|
| AI tools forget between sessions | **Persistent context** — every upload feeds a unified, searchable knowledge base |
| Switching tools means losing context | **Cross-module intelligence** — the AI references your PDFs when explaining code, and your code when extracting tasks |
| AI gives advice that contradicts your project rules | **Drift detection** — two-layer constraint enforcement flags violations in real time |
| Vendor lock-in to a single AI provider | **Multi-provider abstraction** — Gemini, Groq, or Ollama (local/private), switchable per request |
| No visibility into AI reasoning | **Source attribution** — every AI response cites which documents, code, or tasks it drew from |

---

## Features

### RAG-Powered Chat with Persistent Memory
The core differentiator. Every chat query is augmented with relevant project knowledge retrieved via vector similarity search (pgvector, 768-dimensional Gemini embeddings). Smart query routing classifies questions to the appropriate module (learning, developer, workflow, or general RAG). Every response includes source citations and module routing badges.

### Drift Detection & Constraint Enforcement
A two-layer system ensures AI responses stay within project boundaries:
- **Rule-based layer** — taxonomy matching against 120+ technologies across 13 categories
- **LLM-based layer** — semantic analysis of responses against user-defined project constraints

Violations surface as inline warnings with severity levels and the exact constraint violated. Users can "Accept" deviations to evolve project decisions over time.

### Learning Module — PDF Intelligence
Drag-and-drop PDF uploads with automatic text extraction (PyMuPDF), table extraction (pdfplumber), intelligent chunking, and vector embedding. AI-powered capabilities:
- **Smart Summarisation** — Short, Detailed, or Comprehensive summaries
- **Concept Extraction** — Key concepts with importance scores
- **Implementation Steps** — Actionable next steps generated from document content

### Developer Productivity Module
Paste any code snippet (16 languages supported) for:
- **Structured Explanation** — Component breakdowns with architecture analysis
- **Bug Detection** — Issues identified with severity levels and fix suggestions
- **README Generation** — Auto-generated documentation from code

All insights are stored, embedded, and recalled during future chat conversations.

### Workflow Automation Module
Paste meeting transcripts or emails to automatically extract:
- Prioritised tasks (High / Medium / Low)
- Status tracking with inline editing
- Source attribution back to the original text

### Multi-Provider LLM Abstraction
A unified inference layer that supports three providers with automatic failover:

| Provider | Model | Use Case |
|----------|-------|----------|
| **Google Gemini** | `gemini-2.0-flash` | Primary cloud inference |
| **Groq** | `llama-3.1-70b-versatile` | Fast fallback on rate limits |
| **Ollama** | `phi3:mini` | Fully local/private inference |

The system automatically switches providers on rate limits, timeouts, or connection failures — with per-provider latency tracking.

### Authentication & Project Isolation
- Email/password with bcrypt + GitHub OAuth via NextAuth v5
- JWT-based API authentication with server-side session validation
- Complete project isolation — every resource is scoped to its owner

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15 (App Router) | React framework with SSR, middleware, API routes |
| React | 19 | UI library with React Compiler support |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling with custom Starlight Focus design system |
| NextAuth (Auth.js) | v5 beta | Authentication (GitHub OAuth + Credentials) |
| Framer Motion | 12 | Animations (page transitions, drag-and-drop) |
| HTML5 Canvas | — | Custom animated starfield particle system |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.115 | Async Python REST API framework |
| SQLAlchemy | 2.0 | ORM with full model definitions |
| PostgreSQL + pgvector | 16 | Relational DB + 768-dim vector similarity search |
| Google Gemini SDK | latest | Primary LLM + embeddings (`text-embedding-004`) |
| Groq SDK | 0.11 | Fallback LLM provider |
| PyMuPDF + pdfplumber | — | PDF text + table extraction pipeline |
| Appwrite | 15.2 | Private file storage (cloud bucket) |
| python-jose + bcrypt | — | JWT authentication + password hashing |

### Infrastructure

| Component | Service |
|-----------|---------|
| Database | Neon (managed PostgreSQL with pgvector) |
| File Storage | Appwrite Cloud (private bucket) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render (Dockerised — `render.yaml` included) |

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        Next.js 15 Frontend                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ Learning │ │Developer │ │ Workflow │ │   Chat   │ │  Auth  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘  │
│       │             │            │             │           │       │
│       └─────────────┴────────────┴─────────────┴───────────┘       │
│                    API Proxy (next.config.ts rewrites)             │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────┴─────────────────────────────────────┐
│                        FastAPI Backend                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Router Layer (6 routers)                 │   │
│  │   auth · projects · learning · developer · workflow · chat │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│  ┌──────────────────────────┴──────────────────────────────────┐   │
│  │                   Service Layer (11 services)               │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐   │   │
│  │  │ LLM Service │ │Context Engine│ │  Drift Detector    │   │   │
│  │  │ (3 providers│ │ (RAG + vector│ │  (rule + LLM-based │   │   │
│  │  │  + fallback)│ │  retrieval)  │ │   constraint check)│   │   │
│  │  └─────────────┘ └──────────────┘ └────────────────────┘   │   │
│  │  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌────────────┐  │   │
│  │  │PDF Service│ │ Embedding │ │   RAG    │ │File Storage│  │   │
│  │  │(extract + │ │ (Gemini   │ │ (vector  │ │ (Appwrite) │  │   │
│  │  │ chunk)    │ │  768-dim) │ │  search) │ │            │  │   │
│  │  └───────────┘ └───────────┘ └──────────┘ └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                               │                                    │
│              ┌────────────────┼────────────────┐                   │
│              ▼                ▼                 ▼                   │
│     ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐        │
│     │   Neon DB     │ │   Appwrite   │ │  Gemini / Groq   │        │
│     │ PostgreSQL +  │ │  Cloud File  │ │  / Ollama APIs   │        │
│     │   pgvector    │ │   Storage    │ │                  │        │
│     └──────────────┘ └──────────────┘ └──────────────────┘        │
└────────────────────────────────────────────────────────────────────┘
```

### Database Schema

PostgreSQL with pgvector extension — 7 tables with full referential integrity:

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `users` | id (UUID), email, hashed_password, provider | Authentication (credentials + OAuth) |
| `projects` | id, user_id (FK), name, goal, constraints (JSONB) | Isolated project workspaces |
| `documents` | id, project_id (FK), raw_text, summary, key_concepts (JSONB) | PDF intelligence |
| `code_insights` | id, project_id (FK), code_snippet, explanation, components (JSONB) | Developer module history |
| `tasks` | id, project_id (FK), description, priority, status, source_text | Workflow automation |
| `embeddings` | id, project_id (FK), source_type, content_chunk, embedding (Vector 768) | RAG vector store |
| `chat_messages` | id, project_id (FK), role, content, context_used (JSONB), drift_warnings (JSONB) | Persistent chat with metadata |

---

## Getting Started

### Prerequisites

- Node.js 20+ · Python 3.12+ · Neon account · Appwrite account · Gemini API key

### Quick Start

```bash
# Clone
git clone https://github.com/ved-jadhav-10/work-flow.git
cd work-flow

# Frontend
cd client && npm install

# Backend
cd ../server
python -m venv venv
.\venv\Scripts\Activate   # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

### Environment Setup

**`server/.env`**
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=...
APPWRITE_API_KEY=...
APPWRITE_BUCKET_ID=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
JWT_SECRET=generate-a-random-secret
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

**`client/.env.local`**
```env
BACKEND_URL=http://localhost:8000
AUTH_SECRET=generate-a-random-secret
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### Database Setup

```sql
-- Run in Neon SQL Editor, then execute migration files in order
CREATE EXTENSION IF NOT EXISTS vector;
```

### Run

```bash
# Terminal 1 — Backend
cd server && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd client && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Health Check | http://localhost:8000/api/health |

---

## How It Works

1. **Register** — email/password or GitHub OAuth
2. **Create a project** — define name, goal, and constraints
3. **Feed the knowledge base** — upload PDFs (Learning), paste code (Developer), paste transcripts (Workflow)
4. **Chat with full context** — the AI draws from everything you've added, cites its sources, and warns when it drifts from your constraints
5. **Iterate** — every new upload strengthens the context; every accepted drift evolves your project decisions

---

## API Reference

All endpoints are documented via FastAPI's auto-generated Swagger UI at `/docs`.

| Module | Endpoints |
|--------|----------|
| **Auth** | `POST /register` · `POST /login` · `POST /oauth` · `GET /me` |
| **Projects** | `POST /` · `GET /` · `GET /{id}` · `PUT /{id}` · `DELETE /{id}` |
| **Learning** | `POST /upload` · `GET /` · `POST /{doc_id}/summarize` · `POST /{doc_id}/concepts` · `POST /{doc_id}/steps` |
| **Developer** | `POST /explain` · `POST /debug` · `POST /readme` · `GET /` · `DELETE /{id}` |
| **Workflow** | `POST /extract` · `GET /tasks` · `PUT /tasks/{id}` · `DELETE /tasks/{id}` |
| **Chat** | `POST /chat` · `GET /history` |

All endpoints accept an `X-Inference-Mode` header (`cloud` / `local` / `groq`) to control which LLM provider handles the request.

---

## Deployment

### Frontend — Vercel

```bash
cd client && npm run build
# Deploy via Vercel CLI or Git integration
```

### Backend — Render

A `render.yaml` is included at the repo root. Connect the GitHub repo to Render, set environment variables, and deploy. The backend is fully Dockerised (Python 3.12, multi-stage build, non-root user).

---

## Testing

```bash
cd server && pytest
```

Covers LLM provider fallback chains, PDF extraction and chunking, embedding generation, and vector similarity search.

---

## Project Structure

```
work-flow/
├── client/                     # Next.js 15 frontend
│   ├── src/
│   │   ├── middleware.ts       # Auth route protection
│   │   ├── app/                # App Router pages
│   │   ├── components/         # StarryBackground, Sidebar, Glass UI
│   │   ├── lib/                # auth, api client, inference mode
│   │   └── types/              # Shared TypeScript interfaces
│   └── public/                 # Logo, hero background
│
├── server/                     # FastAPI backend
│   ├── main.py                 # App entry + CORS + routers
│   ├── config.py               # Pydantic Settings
│   ├── database.py             # SQLAlchemy engine
│   ├── models/                 # 7 ORM models
│   ├── schemas/                # 6 Pydantic schema files
│   ├── routers/                # 6 API route files
│   ├── services/               # 11 business logic services
│   │   └── prompts/            # Structured LLM prompts
│   ├── middleware/             # JWT auth dependency
│   ├── migrations/             # 3 SQL migration files
│   ├── tests/                  # pytest test suite
│   ├── Dockerfile              # Multi-stage production build
│   └── requirements.txt
│
├── render.yaml                 # Render deployment config
└── package.json                # Root workspace scripts
```

---

## Team

Ved Jadhav
Aditya Rajput
Palash Kurkute
Harshil Biyani
Ansh Dudhe

---

## Acknowledgements

[Next.js](https://nextjs.org) · [React](https://react.dev) · [FastAPI](https://fastapi.tiangolo.com) · [Neon](https://neon.tech) · [Appwrite](https://appwrite.io) · [Google Gemini](https://ai.google.dev) · [Groq](https://groq.com) · [Ollama](https://ollama.com) · [Framer Motion](https://www.framer.com/motion) · [Tailwind CSS](https://tailwindcss.com)

---

## License

MIT

---

*Where ideas bloom under starlight.*