# DemoForge — Startup Vision Materializer

Founders describe ANY idea and DemoForge brings it to life as a fully interactive, emotionally resonant UI demo in ~30 seconds — powered by Claude AI.

**No templates. No categories. Just your vision.**

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + Tailwind v4 |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| AI | Claude Messages API |

## Setup

### 1. Supabase

Create a Supabase project and run `supabase_schema.sql` in the SQL editor.

### 2. Backend

```bash
cd backend
cp .env.example .env        # fill in your keys
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env        # fill in your keys
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8000`.

## Project Structure

```
DemoForge/
├── backend/
│   ├── main.py                 # FastAPI entry, CORS, auth middleware
│   ├── middleware/auth.py      # Supabase JWT verification
│   ├── routes/demos.py         # /api/demos/* endpoints
│   ├── services/claude.py      # Claude API + system prompt
│   ├── services/supabase_client.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/              # Landing, Auth, Generate, Dashboard, SharedDemo
│   │   ├── components/         # Navbar, VibeSelector, LoadingOrb, BrowserChrome,
│   │   │                         VisionBrief, DemoCard
│   │   └── lib/                # supabase.js, api.js
│   ├── index.html
│   └── package.json
├── supabase_schema.sql
└── README.md
```
# demoforge
