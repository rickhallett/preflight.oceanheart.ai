# ADR-0006: Analytics Approach (MVP)

- Status: Proposed
- Date: 2025-09-13
- Owners: Product, Eng
- Related: decision-support.md

## Context
We need actionable insights with minimal privacy/compliance surface and low ops overhead.

## Options Considered
- In-house events in Postgres (page views, advances, errors) with SQL dashboards.
- Third-party analytics (e.g., PostHog, Amplitude).
- No analytics until post-MVP.

## Decision
Implement a minimal in-house event table and canned SQL for funnel metrics (views → complete). Reassess third-party post-MVP.

## Implications
- Engineering: Low to Medium; small ingestion and dashboards.
- Product: Immediate visibility into drop-offs; limited cohorting until later.
- Risk: Under-instrumentation; mitigate by adding a few flexible event fields.

## Follow-ups
- Define schema and privacy policy for events.
- Add ETL/export for research if needed.
- Create a lightweight dashboard (SQL or notebook).

