# TrackWise

An AI job-application tracker built to solve a real problem: keeping a job hunt
organized while knowing which roles are actually worth your time. Paste a job
posting and TrackWise reads it, scores how well it fits your resume, spots your
skill gaps, and drafts a tailored cover letter. Then you move each application
through a five-stage pipeline.

**Stack:** Next.js 14 (App Router) · JavaScript · Supabase (Postgres + pgvector +
Auth) · Groq (Llama 3.3 70B) · Transformers.js (local embeddings) · Tailwind CSS.

---

## What makes it more than a CRUD app

- **Semantic fit scoring.** Your resume and each job posting are turned into
  384-dimension vectors and compared with cosine similarity, stored in Postgres
  via `pgvector`. That's real vector search, not keyword matching.
- **Local embeddings.** Embeddings run on the server with Transformers.js
  (`all-MiniLM-L6-v2`) — no embedding API key, no rate limits, and your resume
  text never leaves your infrastructure.
- **Provider-agnostic LLM layer.** All generation goes through one wrapper
  (`src/lib/groq.js`) hitting an OpenAI-compatible endpoint. If a free-tier model
  disappears, you swap two env vars — no code change.
- **Structured extraction.** Messy job posts become validated JSON (skills,
  seniority, salary) with a retry on malformed output.

---

## Getting started

### 1. Prerequisites
- Node.js 18.18+ and npm
- A free [Supabase](https://supabase.com) project
- A free [Groq API key](https://console.groq.com/keys)

### 2. Install
```bash
npm install
```
> First run downloads the ~90MB embedding model once, then caches it.

### 3. Set up the database
In your Supabase project, open **SQL Editor** and run the contents of
[`supabase/schema.sql`](./supabase/schema.sql). This enables `pgvector`, creates
the tables, and turns on Row Level Security so users only ever see their own data.

### 4. Configure environment
```bash
cp .env.example .env.local
```
Fill in your Supabase URL + anon key (Project Settings → API) and your Groq key.

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000, create an account, add your resume, then add a job.

---

## How it works

```
Add job (paste JD)
   │
   ▼
Groq: extract structured fields ──► parsed JSON (skills, seniority, salary)
   │
   ▼
Transformers.js: embed JD ─────────► 384-dim vector ──► pgvector
   │
   ▼
cosine(JD, resume) ────────────────► fit score 0–100 (the ring on each card)

On demand, per application:
   Gap analysis  → Groq compares required skills vs resume
   Cover letter  → Groq drafts from resume + role, stored in cover_letters
```

Updating your resume re-scores every saved application automatically.

## Project structure
```
src/
  app/
    login/                 Auth screen
    dashboard/             Board (server fetch + client orchestration)
    api/                   Route handlers (Node runtime)
      applications/        List, create (parse+embed+score), update, delete
      resume/              Save resume, embed, re-score board
      analyze/             Gap analysis
      cover-letter/        Generate + persist
  components/              Board, cards, fit ring, modals, drawer
  lib/
    groq.js                Provider-agnostic LLM wrapper
    embeddings.js          Local embeddings + cosine + scoring
    prompts.js             All prompt builders in one place
    supabase/              Browser + server clients
supabase/schema.sql        Database + RLS
```

## Deploying (free tier)
- **App:** push to GitHub, import into [Vercel](https://vercel.com), add the same
  env vars. API routes use the Node runtime for the embedding model.
- **Data:** your Supabase project is already live.

## Ideas to extend
- Drag-and-drop columns (swap the card's move buttons for `@hello-pangea/dnd`).
- "Similar jobs" using a pgvector nearest-neighbor query on the stored vectors.
- Analytics: response rate, fit-score distribution, time-in-stage.
- Fetch-from-URL job import (respecting each site's terms).

## Notes on free-tier limits
Groq's free tier is generous but shared; heavy bursts may hit a rate limit. The
LLM wrapper is the single place to add backoff or re-point to another
OpenAI-compatible provider (OpenRouter, Cerebras) if a model is retired.
