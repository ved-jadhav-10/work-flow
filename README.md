# Workflow AI — Persistent AI Context Layer

> **Workflow AI**: A production-ready AI assistant that actually remembers your project context — across documents, code, and conversations.

Workflow AI is an intelligent project management and AI assistance platform that maintains persistent context across all your work. Unlike traditional AI tools that forget previous interactions, Workflow AI builds a comprehensive understanding of your projects, learning materials, code, and tasks — providing context-aware assistance that evolves with your work.

## 🎯 Vision

Most AI coding assistants suffer from **context amnesia** — every conversation starts from scratch. Workflow AI solves this by:

- **Persistent Memory**: Documents, code, and tasks feed a unified project context
- **Cross-Module Intelligence**: AI references your uploaded PDFs when explaining code
- **Smart Drift Detection**: Automatically flags responses that violate project constraints
- **Hybrid Inference**: Run on cloud (Gemini) or locally (Ollama) for privacy-first workflows
- **RAG-Powered Conversations**: Every query is augmented with relevant project knowledge

## 🚀 Features

### ✅ Currently Implemented

#### 1. **Authentication & User Management** (Phase 2)

- Email/password registration with bcrypt hashing
- GitHub OAuth integration
- JWT-based session management (custom React auth context)
- Protected routes via React Router guards
- User profile management with avatars

#### 2. **Project System** (Phase 3)

- Create and manage multiple projects
- Define project goals and constraints
- Track decisions and open questions
- JSONB-based flexible metadata storage
- Full CRUD operations with user isolation

#### 3. **Complete Database Schema**

All tables implemented with PostgreSQL + pgvector:

- **Users**: Authentication and profiles
- **Projects**: Core project metadata
- **Documents**: PDF storage and analysis
- **Code Insights**: Code explanations and suggestions
- **Tasks**: Priority-based task management
- **Embeddings**: Vector storage (768 dimensions via Gemini)
- **Chat Messages**: Conversation history with context tracking

#### 4. **LLM Abstraction Layer** (Phase 4)

- **Multi-Provider Support**: Gemini (primary), Groq (fallback), Ollama (local)
- **Automatic Fallback**: Switches providers on rate limits/failures
- **Unified Interface**: Single API for all LLM operations
- **Latency Tracking**: Performance monitoring per provider

#### 5. **PDF Processing Pipeline**

- PDF text extraction (PyMuPDF)
- Table extraction (pdfplumber)
- Intelligent chunking with overlap
- Embedding generation (text-embedding-004)
- Appwrite Storage integration

#### 6. **Learning Module** (Phase 5)

- **Document Upload**: Drag-and-drop PDF processing
- **Smart Summarization**: Short / Detailed / Exam-ready modes
- **Concept Extraction**: Key concepts with importance scores
- **Implementation Steps**: Actionable step-by-step plans
- **Vector Storage**: Automatic embedding generation for RAG

#### 7. **Developer Productivity Module** (Phase 6)

- **Code Explanation**: Structured analysis with components
- **Bug Detection**: Identifies issues with severity levels
- **README Generation**: Markdown documentation from code
- **Multi-Language Support**: Syntax highlighting and language detection
- **Code History**: Track previous insights

#### 8. **Workflow Automation** (Phase 7)

- **Task Extraction**: Parse meeting transcripts and emails
- **Priority Classification**: High / Medium / Low with AI reasoning
- **Task Management**: Update status, change priorities, delete tasks
- **Source Attribution**: Links tasks back to original text

### 🔮 Future Phases (Roadmap)

#### **Phase 8: Context Persistence Engine & RAG** (In Planning)

The core differentiator that ties everything together:

- **Unified Context API**: Aggregate data from all modules (docs, code, tasks)
- **Intelligent Retrieval**: Vector similarity search across all project content
- **Context-Aware Chat**: Every query augmented with relevant project knowledge
- **Source Attribution**: Show which documents/code influenced each response
- **Cross-Module Intelligence**: "How does my code implement concepts from my PDF?"
- **Context Health Score**: Visibility into knowledge graph completeness

**Key Features:**

```python
# Every AI response will be context-aware
response = query_with_context(
    project_id="...",
    query="What are my priorities?",
    # Automatically retrieves:
    # - Project goals and constraints
    # - Relevant document chunks
    # - Related code insights
    # - Open tasks by priority
)
```

#### **Phase 9: Drift Detection & Smart Features** (Planned)

Proactive intelligence that keeps your project on track:

- **Constraint Violation Detection**: AI responses that contradict project rules trigger warnings
- **Technology Stack Monitoring**: Flag mentions of disallowed frameworks/languages
- **Automatic Query Routing**: Detect intent and route to appropriate module
- **Decision Tracking**: AI-suggested decisions added to project context
- **False Positive Management**: Dismiss warnings that don't apply

**Example Drift Detection:**

```
Project Constraint: "React and TypeScript only"
User: "Should I use Vue for this component?"
AI Response: "Vue is a great choice for..."

⚠️ DRIFT WARNING: Response suggests Vue, but project is constrained to React
Violated Constraint: "React and TypeScript only"
Actions: [Dismiss] [Add to Decisions]
```

#### **Phase 10: Hybrid Inference & Production Deployment** (Planned)

Ship-ready platform with privacy-first local inference:

- **Cloud/Local Toggle**: Switch between Gemini and Ollama in settings
- **Privacy Mode**: Local inference with "data never leaves your machine" badge
- **Latency Comparison**: See cloud vs local performance in real-time
- **AMD Ryzen AI Ready**: Optimized for hardware acceleration
- **Production Landing Page**: Marketing site with demos
- **Full Deployment Pipeline**: Vercel (frontend) + Render (backend)
- **Error Handling Sweep**: Comprehensive validation and user feedback
- **Mobile Responsive**: Full tablet/phone support

**Settings Interface:**

```
Inference Mode: [Cloud ☁️] [Local 🔒]
Current Provider: Ollama (Local) - Privacy Mode Active
Avg Latency: 1.2s (Cloud: 0.4s)
Note: Local inference keeps all data on your machine
```

## 🏗️ Architecture

### Technology Stack

#### Frontend (React + Vite)

- **Framework**: React 18+ with Vite build tool
- **Routing**: React Router DOM v6 (client-side SPA)
- **Auth**: Custom AuthContext (JWT stored in localStorage, auto-attached to API calls)
- **UI**: Tailwind CSS 4 via Vite plugin
- **HTTP Client**: Fetch API with centralized client (api.ts)
- **Syntax Highlighting**: react-syntax-highlighter
- **Icons**: lucide-react

#### Backend (FastAPI)

- **Framework**: FastAPI 0.115 (async/await)
- **Database**: Neon PostgreSQL with pgvector
- **ORM**: SQLAlchemy 2.0
- **Auth**: JWT via python-jose + bcrypt
- **File Storage**: Appwrite Cloud (private bucket, SDK-based)
- **AI Providers**:
  - Google Gemini (gemini-2.0-flash, text-embedding-004)
  - Groq (llama-3.1-70b-versatile)
  - Ollama (phi3:mini for local inference)
- **PDF Processing**: PyMuPDF + pdfplumber
- **Testing**: pytest + pytest-asyncio

#### Infrastructure

- **Database**: Neon (PostgreSQL 16 + pgvector extension)
- **File Storage**: Appwrite Cloud (private bucket)
- **Deployment** (Planned):
  - Frontend: Any static host (Vercel, Netlify, Cloudflare Pages)
  - Backend: Render (Dockerized)
  - Database: Neon (managed)
  - Storage: Appwrite (managed)

### Project Structure

```
work-flow/
├── client/                    # React + Vite frontend (SPA)
│   ├── src/
│   │   ├── main.tsx          # App entry point
│   │   ├── App.tsx           # React Router setup
│   │   ├── pages/            # Page components
│   │   │   ├── Landing.tsx           # Public landing page
│   │   │   ├── Login.tsx             # Login page
│   │   │   ├── Register.tsx          # Registration page
│   │   │   ├── Dashboard.tsx         # Projects grid
│   │   │   ├── NewProject.tsx        # Create project form
│   │   │   ├── ProjectOverview.tsx   # Project detail with tabs
│   │   │   ├── Learning.tsx          # Document module
│   │   │   ├── Developer.tsx         # Code module
│   │   │   ├── Workflow.tsx          # Task module
│   │   │   ├── Chat.tsx              # AI conversation
│   │   │   └── Settings.tsx          # Inference settings
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI primitives
│   │   │   └── layout/           # Sidebar, AuthGuard, layouts
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # JWT auth state (React Context)
│   │   ├── lib/
│   │   │   └── api.ts            # Centralized API client
│   │   └── types/
│   │       └── index.ts          # TypeScript definitions
│   ├── public/               # Static assets
│   └── vite.config.ts
│
├── server/                    # FastAPI backend
│   ├── main.py               # App entry, CORS, router registration
│   ├── config.py             # Environment variables (Pydantic)
│   ├── database.py           # SQLAlchemy setup
│   ├── models/               # ORM models
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── document.py
│   │   ├── code_insight.py
│   │   ├── task.py
│   │   ├── embedding.py
│   │   └── chat_message.py
│   ├── schemas/              # Pydantic request/response models
│   │   ├── auth.py
│   │   ├── project.py
│   │   ├── learning.py
│   │   └── developer.py
│   ├── routers/              # API endpoints
│   │   ├── auth.py           # POST /register, /login, GET /me
│   │   ├── projects.py       # CRUD for projects
│   │   ├── learning.py       # Document processing
│   │   ├── developer.py      # Code analysis
│   │   └── workflow.py       # Task extraction (Phase 7)
│   ├── services/             # Business logic
│   │   ├── llm_service.py    # Multi-provider LLM abstraction
│   │   ├── pdf_service.py    # PDF extraction and chunking
│   │   ├── embedding_service.py  # Vector generation
│   │   ├── file_storage.py   # Appwrite Storage wrapper
│   │   ├── learning_service.py   # Document orchestration
│   │   ├── developer_service.py  # Code analysis orchestration
│   │   └── prompts/          # System prompts
│   │       ├── learning_prompts.py
│   │       └── developer_prompts.py
│   ├── middleware/
│   │   └── auth.py           # JWT validation dependency
│   ├── migrations/           # SQL migration files
│   │   ├── 001_create_users.sql
│   │   └── 002_create_project_tables.sql
│   ├── tests/
│   │   ├── test_llm_service.py
│   │   ├── test_pdf_service.py
│   │   └── test_embedding_service.py
│   └── requirements.txt
│
├── plan.md                   # 10-phase execution plan
└── package.json              # Root workspace config
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+ and pip
- **Neon Account** (free tier PostgreSQL with pgvector)
- **Appwrite Account** (free tier for file storage)
- **API Keys**:
  - Google AI Studio (Gemini API)
  - Groq API (optional, for fallback)
  - GitHub OAuth App (for social login)

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd work-flow

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate
pip install -r requirements.txt
```

### 2. Environment Setup

Create `server/.env` (or use root `.env`):

```bash
# ── Database (Neon PostgreSQL) ───────────────
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# ── Appwrite (File Storage) ──────────────────
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-appwrite-project-id
APPWRITE_API_KEY=your-appwrite-api-key
APPWRITE_BUCKET_ID=your-bucket-id

# ── Google Gemini API ─────────────────────────
GEMINI_API_KEY=your-gemini-api-key

# ── Groq API (Fallback) ──────────────────────
GROQ_API_KEY=your-groq-api-key

# ── Auth ──────────────────────────────────────
JWT_SECRET=generate-a-random-secret
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret

# ── Ollama (Local Inference — optional) ──────
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi3:mini
```

Create `client/.env`:

```bash
VITE_API_URL=http://localhost:8000
```

### 3. Database Setup

Run migrations against your Neon PostgreSQL database:

1. Go to your **Neon Dashboard** → SQL Editor (or use `psql` with your `DATABASE_URL`)
2. **Enable pgvector**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run `server/migrations/001_create_users.sql`
4. Run `server/migrations/002_create_project_tables.sql`

### 4. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd server
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

Visit:

- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## 📖 Usage

### 1. Authentication

- Register with email/password or sign in with GitHub
- Access the dashboard at `/dashboard`

### 2. Create a Project

- Click "New Project" from the dashboard
- Set project name, goal, and constraints
- Add decisions and open questions as you work

### 3. Learning Module

- Navigate to your project → "Learning" tab
- Upload PDF documents (study materials, documentation)
- Generate summaries (Short, Detailed, or Exam-ready)
- Extract key concepts with importance scores
- Get implementation steps for complex topics

### 4. Developer Module

- Go to "Developer" tab
- Paste code snippets
- Get structured explanations with component breakdowns
- Debug: identify bugs, edge cases, and improvements
- Generate README files from code

### 5. Workflow Module

- Go to "Workflow" tab
- Paste meeting transcripts or email threads
- Extract tasks with AI-assigned priorities
- Manage task status (pending/done)
- Update priorities as needs change

### 6. Coming Soon: Context-Aware Chat (Phase 8)

- Chat tab will provide AI assistance that references ALL your project content
- Ask: "How does my code implement concepts from the PDF I uploaded?"
- AI automatically retrieves relevant chunks from documents, code, and tasks
- See which sources influenced each response

## 🧪 Testing

Run backend tests:

```bash
cd server
pytest
```

Test coverage includes:

- LLM service with provider fallback
- PDF extraction and chunking
- Embedding generation
- Vector similarity search

## 📊 Current Status

| Phase | Feature              | Status      |
| ----- | -------------------- | ----------- |
| 0     | Environment Setup    | ✅ Complete |
| 1     | Project Scaffold     | ✅ Complete |
| 2     | Authentication       | ✅ Complete |
| 3     | Project System       | ✅ Complete |
| 4     | LLM & PDF Services   | ✅ Complete |
| 5     | Learning Module      | ✅ Complete |
| 6     | Developer Module     | ✅ Complete |
| 7     | Workflow Module      | ✅ Complete |
| 8     | Context Engine & RAG | 🔜 Next     |
| 9     | Drift Detection      | 📋 Planned  |
| 10    | Deployment & Polish  | 📋 Planned  |

**Current Phase**: Phases 1-7 fully implemented. Phase 8 (Context Engine) is the next major milestone.

## 🎯 What Makes This Different?

### 1. **True Persistence**

Unlike ChatGPT or Claude, Workflow AI doesn't forget. Every document, code snippet, and task becomes part of your project's knowledge graph.

### 2. **Cross-Module Intelligence**

The Learning Module knows about your code. The Developer Module references your documents. The Workflow Module understands your project goals.

### 3. **Constraint-Aware AI**

Define "React only" or "Python 3.11+" — the AI respects and enforces your technical decisions.

### 4. **Hybrid Inference** (Coming in Phase 10)

Cloud performance when you need it. Local privacy when you want it. Your choice, same interface.

### 5. **Built for Real Workflows**

Not a chat toy. Designed for students managing coursework, developers building projects, and teams coordinating work.

## 🛠️ Development

### Code Quality

- **Frontend**: TypeScript strict mode, ESLint, Prettier (coming)
- **Backend**: Type hints, Black formatting (coming), Pylint
- **Testing**: pytest for backend, Vitest for frontend (planned)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/context-engine

# Make changes, commit
git add .
git commit -m "feat: implement RAG pipeline"

# Push and create PR
git push origin feature/context-engine
```

### Environment Variables

Never commit secrets! Use `.env.example` as a template.

## 🚢 Deployment (Phase 10)

### Frontend (Static Host)

```bash
# Build production bundle
cd client
npm run build
# Deploy the dist/ folder to Vercel, Netlify, or Cloudflare Pages
```

Set `VITE_API_URL` environment variable to your production backend URL.

### Backend (Render)

1. Create `Dockerfile` in `server/`
2. Add `render.yaml` at root
3. Connect GitHub repo to Render
4. Set environment variables
5. Deploy

### Post-Deployment Checklist

- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Update CORS in FastAPI to allow production frontend domain
- [ ] Update GitHub OAuth redirect URI to production URL
- [ ] Test all features in production
- [ ] Set up monitoring (Sentry, LogRocket, etc.)

## 🤝 Contributing

This project follows a **phase-based development model**. Each phase builds on the previous one, ensuring stability.

### Current Development Focus

**Phase 8: Context Persistence Engine & RAG**

Want to contribute? Check `plan.md` for detailed implementation specs.

## 📋 Roadmap

### Q1 2026

- ✅ Core authentication and project management
- ✅ Learning, Developer, and Workflow modules
- 🔜 Context Persistence Engine (Phase 8)
- 🔜 RAG-powered conversations

### Q2 2026

- Drift detection and constraint enforcement
- Smart query routing
- Hybrid inference (cloud/local toggle)
- Production deployment

### Q3 2026

- Mobile app (React Native)
- Team collaboration features
- Advanced analytics dashboard
- Plugin system for custom modules

### Q4 2026

- Self-hosted option (Docker Compose)
- Enterprise features (SSO, audit logs)
- AMD Ryzen AI hardware acceleration
- Fine-tuned models for specific domains

## 📄 License

MIT License — see `LICENSE` file for details

## 🙏 Acknowledgments

- **React** & **Vite** for the blazing-fast frontend tooling
- **FastAPI** for the best Python web framework
- **Neon** for managed PostgreSQL with pgvector
- **Appwrite** for managed file storage
- **Google** for Gemini API
- **Groq** for fast LLM inference
- **Ollama** for local LLM runtime

## 📞 Support

- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: [your-email] (for security issues only)

---

**Built with ❤️ for developers, students, and knowledge workers who deserve AI that actually remembers.**

_Project Status: Active Development | Current Phase: 7/10 Complete_
