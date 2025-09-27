# Project Preflight

**AI Readiness Questionnaire + Conversational Coaching**
*(a research-driven demo under the Oceanheart.ai umbrella)*

---

## 1. Overview

**Project Preflight** is an experimental web app that measures **AI readiness** in clinical and well-being professionals (psychologists, coaches, allied/complementary practitioners, etc.).
Participants complete a **10–15 question multi-page survey**, then experience a **brief collaborative dialogue with an LLM**.
The goal is to:

* Rapidly assess AI familiarity and confidence.
* Demonstrate AI as a **partner** rather than a static tool.
* Capture anonymized insights for future research and product development.

This README documents the full technical specification, installation instructions, and contributor guidelines.

---

## 2. Key Features

* **Dynamic Form DSL**: Survey structure is stored in **versioned JSON** and rendered at runtime—no hard-coded forms.
* **LLM Coaching Pipeline**: A configurable prompt pipeline provides 2–4 conversational “round trips” with a large language model.
* **Autosave & Resilience**: Each page auto-saves to the backend to survive refreshes or network drops.
* **Analytics & Feedback**: Fine-grained event logging for research and UX analysis.
* **Privacy First**: Anonymous participation by default, optional upgrade to authenticated user.

---

## 3. Stack

| Layer      | Technology                                                               | Rationale                                                                           |
| ---------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Front-end  | **Next.js 15** (TypeScript)                                              | React 19 with App Router, Server Components, Turbopack for fast builds.             |
| API        | **FastAPI** (Python)                                                     | Excellent LLM integration and async performance.                                    |
| Database   | **Postgres (Neon)**                                                      | SQL analytics with JSONB flexibility for unstructured form definitions and answers. |
| Auth       | **passport.oceanheart.ai**                                               | External OAuth provider with JWT integration, HttpOnly cookie storage.              |
| Deployment | Vercel (SvelteKit), Fly.io/Railway (FastAPI), Neon (serverless Postgres) | Fast, low-ops, free/cheap tiers.                                                    |

---

## 4. Architecture

```
apps/
  preflight-web/        # Next.js 15 frontend
    app/                # App Router pages
      (protected)/      # Protected routes
      auth/callback/    # OAuth callback
      survey/          # Survey pages  
      coach/           # Coaching interface
      feedback/        # Feedback collection
    components/         # Reusable components
      ui/              # Base UI components
      landing/         # Landing page components
      survey/          # Survey form components
    lib/               # Utilities and configurations
  preflight-api/        # FastAPI backend
    app/routes/
      forms.py
      runs.py
      answers.py
      coach.py
      feedback.py
    app/services/
      llm.py
      scoring.py
      persistence.py
infra/
  docker/
  fly.toml
  vercel.json
  alembic/               # database migrations
```

### Data Model (simplified)

| Table                 | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| **users**             | Optional authenticated participants.            |
| **form\_definitions** | Versioned JSON schemas for forms.               |
| **prompt\_pipelines** | Versioned JSON pipelines for LLM conversations. |
| **runs**              | A participant’s session metadata.               |
| **answers**           | Page/field answers (JSONB).                     |
| **coach\_turns**      | Conversation history with the LLM.              |
| **feedback**          | Post-session ratings/comments.                  |

---

## 5. JSON Form DSL Example

```json
{
  "id": "ai-readiness-v1",
  "title": "AI Readiness (Clinicians)",
  "pages": [
    {
      "id": "p1",
      "title": "Background",
      "blocks": [
        {"type": "markdown", "content": "# Quick check-in"},
        {"type": "select", "name": "role", "label": "Your role",
         "options": ["Psychologist","GP","Coach","Complementary/Alt"], "required": true},
        {"type": "radio", "name": "ai_confidence",
         "label": "Confidence with AI (0–5)", "options": [0,1,2,3,4,5], "required": true},
        {"type": "textarea", "name": "recent_problem",
         "label": "Recent difficulty you’d like brainstorming help with"}
      ]
    }
  ],
  "navigation": {"style":"pager","autosave":true},
  "meta": {"version":"1.0.0"}
}
```

---

## 6. Prompt Pipeline Example

```json
{
  "id": "coach-v1",
  "rounds": [
    {"role": "system",
     "template": "You are a collaborative AI coach for clinicians. Ask one focused question at a time."},
    {"role": "user",
     "template": "User described: {{recent_problem}}\nIf you were in my position, what do I most need to know to help you?"},
    {"role": "assistant",
     "postprocess": {"type": "ensure_question_only"}},
    {"role": "user", "template": "User reply: {{user_reply}}"}
  ],
  "limits": {"max_rounds": 4, "guardrails": ["no diagnosis", "no PHI retention"]}
}
```

---

## 7. Installation

### Prerequisites

* Bun 1.0+ (preferred) or Node 20+
* Python 3.11+
* PostgreSQL (local or Neon)
* passport.oceanheart.ai account (for authentication)
* OpenAI/Anthropic API key (for LLM)

### Backend (FastAPI)

```bash
cd apps/preflight-api
python -m venv venv
source venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL, LLM_API_KEY in .env
alembic upgrade head  # create tables
uvicorn app.main:app --reload --port 8002
```

### Frontend (Next.js)

```bash
cd apps/preflight-web
bun install  # or npm install
# Set PUBLIC_API_BASE in .env
bun run dev  # Runs on http://localhost:3002
```

### Database

Use [Neon](https://neon.tech/) or local Postgres.

Example connection string:

```
DATABASE_URL=postgresql://user:password@host:5432/preflight
```

---

## 8. Deployment

1. **Database**: create Neon project, apply migrations.
2. **API**: deploy FastAPI to Fly.io or Railway.
3. **Web**: deploy SvelteKit to Vercel (adapter-vercel).
4. **Domain**:

   * `preflight.oceanheart.ai` → Vercel frontend
   * `api.preflight.oceanheart.ai` → Fly/Railway backend

---

## 9. Environment Variables

| Variable                | Description                 |
| ----------------------- | --------------------------- |
| `DATABASE_URL`          | Postgres connection string  |
| `LLM_API_KEY`           | OpenAI/Anthropic API key    |
| `PASSPORT_OAUTH_URL`    | passport.oceanheart.ai URL  |
| `JWT_SECRET`            | JWT verification secret     |
| `PUBLIC_API_BASE`       | Base URL of FastAPI service |

---

## 10. Running Tests

FastAPI uses **pytest**:

```bash
cd apps/preflight-api
pytest
```

Next.js uses **Bun test**:

```bash
cd apps/preflight-web
bun test
```

---

## 11. Roadmap

| Phase           | Goals                                                                          |
| --------------- | ------------------------------------------------------------------------------ |
| **MVP**         | Multi-page form renderer, autosave, single prompt pipeline, basic analytics.   |
| **Iteration 1** | Feedback capture, improved branching logic, scoring, resource recommendations. |
| **Iteration 2** | Offline queue, advanced analytics dashboards, multi-language support.          |

---

## 12. Security & Privacy

* Pseudonymized participation by default; no PHI required.
* IP + UA stored only for abuse prevention (≤30 days).
* EU data residency (Neon EU region).
* Rate-limiting and basic WAF on `/coach` endpoint.

---

## 13. Contributing

Pull requests and issue reports are welcome.
Please:

* Run tests before submitting.
* Follow [Conventional Commits](https://www.conventionalcommits.org/) for messages.
* Avoid committing API keys or participant data.

---

## 14. License

MIT License © 2025 Oceanheart.ai / Rick (“Kai”) Hallett.
See [LICENSE](LICENSE) for details.

---

## 15. Contact

* Website: [www.oceanheart.ai](https://www.oceanheart.ai)
* Lead developer/researcher: **Rick “Kai” Hallett**
* Email: [hello@oceanheart.ai](mailto:hello@oceanheart.ai)

---

*Project Preflight is a research and demonstration platform.
It is **not** a clinical diagnostic tool and provides no medical advice.*


## Quick Start with Docker

```bash
# Start all services
docker-compose up --build

# Frontend: http://localhost:3002
# Backend API: http://localhost:8002
# API Docs: http://localhost:8002/docs
```

## Development Setup

### Using Bun (Recommended)
```bash
cd apps/preflight-web
bun install
bun run dev  # http://localhost:3002
```

### Linting & Formatting
```bash
bun run lint    # Biome linting
bun run format  # Biome formatting
```
