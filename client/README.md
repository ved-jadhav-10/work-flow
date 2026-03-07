# Workflow — Client

> Next.js 15 (App Router) frontend for the Workflow AI platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19, TypeScript 5 |
| Auth | NextAuth v5 (Auth.js) — GitHub OAuth + Credentials |
| Styling | Tailwind CSS 4 (PostCSS plugin) |
| Animations | Framer Motion 12, HTML5 Canvas (starfield) |
| Fonts | Plus Jakarta Sans (via `next/font`) |
| HTTP | Native `fetch` with JWT auto-attachment |
| Icons | lucide-react |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local`:

```env
BACKEND_URL=http://localhost:8000
AUTH_SECRET=generate-a-random-secret
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

## Project Structure

```
src/
├── middleware.ts              # Auth route protection
├── app/
│   ├── layout.tsx             # Root layout (fonts, providers, starfield)
│   ├── page.tsx               # Landing page (hero, features, CTA)
│   ├── globals.css            # Tailwind v4 + Starlight Focus design tokens
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── api/auth/[...nextauth]/route.ts
│   └── dashboard/
│       ├── layout.tsx         # Dashboard shell
│       ├── page.tsx           # Projects grid + module stats
│       ├── settings/page.tsx  # Inference mode toggle
│       └── projects/
│           ├── new/page.tsx   # Create project form
│           └── [id]/
│               ├── page.tsx         # Project overview + editing
│               ├── chat/page.tsx    # RAG-powered chat with drift warnings
│               ├── learning/page.tsx
│               ├── developer/page.tsx
│               └── workflow/page.tsx
├── components/
│   ├── StarryBackground.tsx   # Canvas particle starfield
│   ├── layout/
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── DashboardLeftPanel.tsx
│   │   └── AppBackground.tsx  # Ambient glows + vignettes
│   ├── providers/
│   │   ├── Providers.tsx      # NextAuth SessionProvider
│   │   └── ErrorBoundary.tsx
│   └── ui/                    # GlassButton, GlassCard, GlassInput
├── lib/
│   ├── auth.ts                # NextAuth config (GitHub + Credentials)
│   ├── api.ts                 # Backend API client (all endpoints)
│   ├── inference.ts           # Local/cloud mode persistence
│   └── cn.ts                  # Class name utility
└── types/index.ts             # Shared TypeScript interfaces
```

## API Proxy

`next.config.ts` proxies all `/api/auth/{login,register,oauth,me}`, `/api/projects/*`, `/api/files/*`, and `/api/health` calls to the FastAPI backend, so the browser only talks to port 3000.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
