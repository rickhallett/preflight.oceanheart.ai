# Decision Support: Product Areas, Implications, and Trade‑offs

Status: Draft • Audience: Product + Engineering • Scope: Phases 2–3

## Complexity Legend
- Effort: Low (≤1 week), Medium (1–3 weeks), High (3–6 weeks), Very High (6+ weeks)
- Drivers: scope, integrations, data model impact, QA surface, ops risk

## 1) Form System Scope & DSL
- Decision points
  - Field set and layout primitives (markdown, text, textarea, select, radio, checkbox, groups, conditional logic)
  - Versioning model (name+semver vs. immutable IDs) and deprecation policy
  - Validation source of truth (client vs. server vs. shared schema)
- Implications
  - More primitives/conditionals increase renderer complexity, test matrix, and migration needs
  - Weak versioning complicates analytics comparability over time
  - Split validation logic yields drift and bug risk
- Tech analysis (Effort: Medium → High)
  - Renderer + schema types + server validators: 1–3 weeks initial; +1–2 weeks if adding conditional logic and layouts
- Trade‑offs & alternatives
  - Minimal v1 blocks vs. richer DSL now (speed vs. flexibility)
  - JSON Schema (shared) vs. bespoke validators (tooling vs. control)
  - Immutable versions vs. mutable drafts (auditability vs. iteration speed)

## 2) Autosave, Resume, and Offline Tolerance
- Decision points
  - Autosave cadence (on navigation vs. 30s intervals vs. debounce)
  - Storage source for resume (server only vs. server+local cache)
  - Offline behavior (queue + retry vs. block actions)
- Implications
  - Aggressive autosave increases API load and conflict risks; improves resilience
  - Local cache introduces consistency and privacy risk on shared devices
- Tech analysis (Effort: Medium)
  - Debounced autosave + idempotent PATCH per page: 1–2 weeks including edge cases and tests
- Trade‑offs & alternatives
  - Server‑only persistence (simpler, fewer privacy risks) vs. hybrid local cache (better UX offline)
  - Coarse resume (page level) vs. fine‑grained field state (complexity vs. UX)

## 3) LLM Coaching Pipeline (Phase 3)
- Decision points
  - Provider(s) (OpenAI, Anthropic), safety filters, temperature/rate limits
  - Prompt templating and versioning strategy (per form version)
  - Conversation length and persistence model
- Implications
  - Multi‑provider support increases config complexity and QA
  - More turns → higher cost and latency, requires stricter guardrails
- Tech analysis (Effort: High)
  - Pipeline engine + provider abstraction + persistence + guardrails: 3–5 weeks; +1–2 weeks for A/B pipelines
- Trade‑offs & alternatives
  - Single provider first (faster) vs. abstraction layer (future flexibility)
  - Strict guardrails (safer, less expressive) vs. lighter filters (riskier, better UX)

## 4) Data Privacy, Consent, and PHI Avoidance
- Decision points
  - Anonymous by default vs. optional auth uplift
  - Data retention window (e.g., ≤30 days for IP/UA) and residency (EU)
  - Pseudonymization/anonymization strategy for exports
- Implications
  - Stricter retention/residency reduces ops flexibility; increases user trust and compliance posture
- Tech analysis (Effort: Medium)
  - Data retention jobs + export pipeline + residency config: 1–2 weeks; legal review needed
- Trade‑offs & alternatives
  - Minimal legal surface now (faster) vs. stronger policy and technical enforcement (safer for research sharing)

## 5) Authentication & Identity (Optional)
- Decision points
  - When to integrate Oceanheart Passport (Rails 8 + JWT), or defer
  - Anonymous session → authenticated merge semantics
- Implications
  - Earlier auth adds dev lift and QA; unlocks longitudinal analytics
- Tech analysis (Effort: Medium → High)
  - JWT validation in FastAPI + session merge + UI states: 2–4 weeks
- Trade‑offs & alternatives
  - Anonymous‑only MVP (lower friction, less data continuity) vs. optional login (richer analytics, higher friction)

## 6) Analytics & Telemetry
- Decision points
  - Client events (view, advance, error) vs. server events; sampling strategy
  - Tooling (Postgres events table vs. 3rd‑party)
- Implications
  - Excessive events raise privacy/cost concerns; too little erodes insight
- Tech analysis (Effort: Low → Medium)
  - Minimal events + dashboard queries: 0.5–1.5 weeks
- Trade‑offs & alternatives
  - In‑house SQL+dashboards (cheap, flexible) vs. 3rd‑party (faster, $$, data egress)

## 7) Performance & Cost Controls
- Decision points
  - Max turns, token limits, model choices, caching strategies
  - Concurrency limits and back‑pressure under load
- Implications
  - Tight limits reduce cost but risk perceived quality; caching complicates personalization
- Tech analysis (Effort: Medium)
  - Quotas + per‑endpoint rate limits + simple cache: 1–2 weeks
- Trade‑offs & alternatives
  - Hard caps (predictable cost) vs. adaptive budgets (dynamic QoS, more complexity)

## 8) Versioning & Migrations (Forms + Pipelines)
- Decision points
  - How to deprecate/replace active versions; migration rules for in‑flight runs
- Implications
  - Poor version hygiene undermines research comparability and debugging
- Tech analysis (Effort: Medium)
  - Semver policy, migration scripts, admin views: 1–2 weeks
- Trade‑offs & alternatives
  - Strict immutability (clean audits, more versions) vs. patching with changelog (fewer artifacts, higher risk)

## 9) Deployment & Environments
- Decision points
  - Env topology (dev, staging, prod); DB branching strategy (Neon)
  - API hosting (Fly.io/Railway) and frontend (Vercel) release process
- Implications
  - More environments increase ops overhead but reduce regressions
- Tech analysis (Effort: Low → Medium)
  - IaC + CI/CD workflows + database branches: 1–2 weeks
- Trade‑offs & alternatives
  - Single shared staging (simpler) vs. per‑feature ephemeral envs (higher QA quality, costlier)

## 10) Safety & Moderation (Coach)
- Decision points
  - Prohibited topics, refusal rules, tone constraints
  - Pre/post filters vs. real‑time moderation APIs
- Implications
  - Stronger filters reduce harm risk; risk over‑blocking legitimate content
- Tech analysis (Effort: Medium → High)
  - Policy definition + filter pipeline + tests: 2–4 weeks; depends on provider APIs
- Trade‑offs & alternatives
  - In‑house rules (cheap, brittle) vs. provider safety APIs (cost, better coverage)

## Recommendations (Short‑List)
1) Phase 2 MVP: minimal DSL blocks, server‑first validation, page‑level autosave/resume. Avoid conditional logic until v2. (Effort: Medium)
2) Single LLM provider with a clean abstraction seam; enforce conservative cost/safety defaults. (Effort: High)
3) Anonymous by default; defer auth until after Form MVP analytics confirm value. (Effort: Low now; Medium later)
4) Basic analytics table and queries in Postgres; revisit 3rd‑party post‑MVP. (Effort: Low)
5) Strict version immutability with semver; admin utility to publish/deprecate. (Effort: Low → Medium)

