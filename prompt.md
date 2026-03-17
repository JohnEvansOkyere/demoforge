You're absolutely right. That was thinking small. DemoForge shouldn't be a template picker — it should be a **vision materializer**. Someone dreams up a mental health app, a dating platform for farmers, a ride-hailing concept, a school management system, a crypto wallet, a food delivery clone — and it comes to life *exactly as they imagined it*. No categories. No constraints. Pure vision.

Here's the rewritten Cursor prompt:

---

```
Build a full-stack web application called DemoForge — a startup vision materializer. 
Founders describe ANY idea in their head, and DemoForge brings it to life as a 
fully interactive, emotionally resonant UI demo in 30 seconds, powered by Claude AI.

This is not a template picker. There are no preset categories. 
If someone imagines it, DemoForge builds it.
A mental health journaling app? Built.
A peer-to-peer lending platform for market women in Accra? Built.
A gamified fitness tracker for teenagers? Built.
A livestock marketplace for northern Ghana farmers? Built.
Claude reads the idea, understands the domain, the emotion, the users — 
and generates a UI that FEELS like the real product.

---

## PHILOSOPHY

The UI generated must be EMOTIONAL, not functional-only.
- A mental health app should feel calm, safe, warm
- A fintech dashboard should feel powerful, precise, trustworthy  
- A social app for creatives should feel expressive, vibrant, alive
- A logistics tool should feel efficient, structured, fast
- A children's learning app should feel playful, bright, joyful

Claude must infer the emotional register of every idea and design accordingly.
Colors, typography, spacing, micro-interactions — all must serve the feeling.

---

## TECH STACK

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI (Python)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (email/password + Google OAuth)
- Deployment-ready: include .env.example

---

## CORE USER FLOW

1. User lands on marketing homepage
2. Signs up / logs in (or tries one free demo without account)
3. Describes their idea in free-form text — as detailed or brief as they want
4. Optional: adds a "vibe" / emotional tone (optional tag: calm / bold / playful / 
   professional / futuristic / warm / minimal)
5. Clicks "Bring it to life"
6. Claude AI generates a complete, custom interactive HTML UI — no templates
7. Demo renders live in a browser-chrome iframe
8. A Vision Brief appears (what this demo communicates, who it's for, 
   what to validate, emotional signals to watch for)
9. User can regenerate with a tweak, copy shareable link, or save

---

## THE GENERATOR — MOST IMPORTANT PART

The generator page is the heart of the product. It must feel like a 
creative studio, not a form.

Layout:
- Full dark background (#080808)
- Large, generous textarea center-stage with glowing amber focus ring
- Placeholder text rotates through examples every 4 seconds:
    "A meditation app for burnt-out tech workers in Lagos..."
    "A peer-to-peer crop trading platform for Ghanaian farmers..."
    "A gamified savings app that turns money goals into quests..."
    "A telemedicine platform for rural communities in East Africa..."
    "A social portfolio platform for African designers and artists..."
    "A loyalty rewards app for local barbershops..."
- Optional vibe selector below textarea — 7 pill tags:
  Calm | Bold | Playful | Professional | Futuristic | Warm | Minimal
  (selecting one subtly affects Claude's design direction)
- One big CTA button: "✦ Bring it to life"
- Below button in small muted text: 
  "No templates. No categories. Just your vision."

Loading state:
- Full screen takeover, dark background
- Large pulsing amber orb / ring animation (not a boring spinner)
- Messages cycle every 2s with typewriter effect:
    "Understanding your vision..."
    "Choosing the right emotional palette..."
    "Designing the layout..."
    "Bringing your users to life..."
    "Adding the details that matter..."
    "Making it feel real..."
- Show the user's idea text fading in below in italic

Output state (right side or below on mobile):
- Browser chrome wrapper (macOS style: traffic lights + fake URL bar)
- iframe: height 600px, sandbox="allow-scripts allow-same-origin"
- Below iframe — Vision Brief card:
    WHAT THIS DEMO COMMUNICATES (1-2 sentences)
    WHO THIS IS FOR (user persona description)
    WHAT TO VALIDATE (3 bullet points — key assumptions to test)
    EMOTIONAL SIGNALS TO WATCH (2-3 — what feeling users should have)
    RED FLAGS (2 — signs the concept needs rethinking)
- Action bar: "↺ Tweak & Regenerate" | "🔗 Share Demo" | "💾 Save"

---

## CLAUDE SYSTEM PROMPT — USE EXACTLY THIS

"""
You are DemoForge, a world-class UI/UX designer and frontend engineer 
who specializes in bringing startup visions to life through emotionally 
resonant interactive demos.

Given any startup idea, you generate a complete, custom, interactive HTML 
demo that feels like a real product — not a generic template.

You must:
1. Understand the DOMAIN (fintech, health, social, logistics, education, etc.)
2. Understand the USERS (who they are, what they feel, what they need)
3. Understand the EMOTION the product should evoke
4. Design a UI that serves all three

Your output is ONLY a raw JSON object — no markdown, no backticks, no explanation:

{
  "demoHtml": "...complete self-contained HTML page...",
  "brief": {
    "communicates": "what this UI communicates to a user",
    "whoItsFor": "user persona description",
    "validate": ["assumption 1", "assumption 2", "assumption 3"],
    "emotionalSignals": ["feeling 1", "feeling 2"],
    "redFlags": ["red flag 1", "red flag 2"]
  }
}

Rules for demoHtml:
- Complete <!DOCTYPE html> page, fully self-contained
- Load Tailwind via CDN: https://cdn.tailwindcss.com
- Load Chart.js if the idea involves data/metrics: 
  https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js
- Load Google Fonts that match the emotional tone of the idea
- Choose a color palette that fits the product's emotional register:
    Health/wellness → soft greens, warm whites, gentle blues
    Fintech/banking → deep navy, sharp whites, gold accents
    Social/creative → vibrant, expressive, high contrast
    Agriculture/local → earthy tones, warm ambers, natural greens
    Education/kids → bright primaries, rounded shapes, playful
    Logistics/ops → clean grays, strong structure, efficiency
    Luxury/premium → deep blacks, gold, generous whitespace
- Populate with deeply realistic fake data matching the idea's context
- Africa/Ghana context: use GHS currency, local names (Kwame, Ama, Kofi, 
  Abena), MoMo payments, local place names (Accra, Kumasi, Takoradi)
- Build a multi-screen experience where reasonable: 
  show 2-3 distinct views (e.g. home + detail + profile, or 
  dashboard + list + form)
- All interactions must work: tabs switch, modals open, 
  cart updates, charts render, nav highlights active state
- Every UI must feel like it was designed by a real product team — 
  not generated. Thoughtful spacing, hierarchy, micro-details.
- For images use: https://picsum.photos/seed/{descriptive-word}/400/300
- Mobile-first responsive design
- The demo must make someone feel: "Yes. This is exactly what I imagined."
"""

---

## PAGES & ROUTES

### / — Landing Page
Hero section:
- Headline: "Your vision. Alive in 30 seconds."
- Subheadline: "Describe any startup idea. DemoForge builds you a live, 
  interactive demo — no templates, no designers, no waiting."
- Single input in the hero (teaser): 3-word placeholder "Describe your idea..."
  clicking it routes to /generate
- CTA: "Start free — no credit card"

Show 4 example cards below hero (static) showing demo previpts for:
- A mental health app (calm, green palette)
- A farmers marketplace (earthy, warm)
- A fintech savings app (navy, gold)
- A social creative portfolio (bold, expressive)
Label these: "Built with DemoForge"

Features section:
- "Any idea, any industry" — not limited to categories
- "Emotionally designed" — Claude picks colors, fonts, layout to fit the feeling
- "Validate before you build" — vision brief tells you what to test
- "Share in one click" — shareable link, no login required to view

### /auth — Auth Page
- Toggle Sign Up / Log In
- Email + password
- Google OAuth
- "Or try one demo free without signing up" — links to /generate with 
  a guest session flag

### /generate — Generator (soft-protected: guest gets 1 free, then prompt to sign up)
- As described in GENERATOR section above

### /demo/:id — Public shareable page
- Full-screen iframe of demo HTML
- No auth required
- Small branded bar at bottom: "Built with DemoForge · Try it free →"

### /dashboard — My Demos (protected)
- Grid of saved demo cards
- Each shows: idea snippet, date, emotional vibe tag, thumbnail (use 
  a screenshot placeholder or colored gradient based on vibe)
- Click → opens /demo/:id
- Empty state: big encouraging message, "Your first demo is one idea away →"

---

## SUPABASE SCHEMA

```sql
create table demos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  idea text not null,
  vibe text,
  demo_html text not null,
  brief jsonb not null,
  is_public boolean default true,
  created_at timestamptz default now()
);

alter table demos enable row level security;

create policy "Users manage own demos" on demos
  for all using (auth.uid() = user_id);

create policy "Public read" on demos
  for select using (is_public = true);
```

---

## BACKEND — FastAPI

POST /api/generate
- Verify Supabase JWT (skip for guest, but rate-limit by IP to 1 request)
- Body: { idea: string, vibe?: string }
- Call Claude API with system prompt above
- Parse JSON, save to Supabase, return { id, demo_html, brief, share_url }

GET /api/demos — user's saved demos (auth required)
GET /api/demos/:id — single demo (public)
DELETE /api/demos/:id — delete (auth, owner only)

---

## DESIGN SYSTEM (DemoForge itself)

The DemoForge UI (not the generated demos) should feel like a 
premium creative tool — think Linear meets Vercel meets a design studio.

- Background: #080808
- Surface: #0f0f0f  
- Border: #1a1a1a
- Primary: #F59E0B (amber — energy, creativity, action)
- Text: #ffffff primary, #555 muted, #2a2a2a subtle
- Font: "DM Mono" from Google Fonts for all UI chrome
- Accent animations: amber glow on focus, smooth fade-ins
- Border radius: 8px UI elements, 12px cards — keep it sharp, not bubbly
- Buttons: sharp edges, weight, confidence

---

## ENV VARIABLES

```
# backend/.env
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# frontend/.env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:8000
```

---

## PROJECT STRUCTURE

```
demoforge/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── Generate.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── SharedDemo.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── VibeSelector.jsx
│   │   │   ├── BrowserChrome.jsx
│   │   │   ├── VisionBrief.jsx
│   │   │   ├── DemoCard.jsx
│   │   │   └── LoadingOrb.jsx
│   │   ├── lib/
│   │   │   ├── supabase.js
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── main.py
│   ├── routes/demos.py
│   ├── services/
│   │   ├── claude.py
│   │   └── supabase.py
│   ├── middleware/auth.py
│   └── requirements.txt
└── README.md
```

---

## FINAL NOTES

- The product's tagline is: "No templates. No categories. Just your vision."
- Every design decision in DemoForge itself should reinforce this — 
  open canvas, not a wizard
- The rotating placeholder examples in the textarea are critical — 
  they show users the scope of what's possible and spark ideas
- The Vision Brief is what separates DemoForge from a toy — 
  it makes founders think like product people
- Build backend first, then frontend pages in order:
  Auth → Generate → Dashboard → SharedDemo → Landing

Make this feel like a product someone would pay for on day one.
```

---

That's the real vision — **no templates, no categories, pure imagination materialized**. The emotional design layer is the entire moat. Any competitor can build a template picker. Nobody else is telling Claude to *feel* the product before designing it. That's your edge. 🔥