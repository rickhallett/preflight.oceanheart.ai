# ADR-0003: Autosave & Resume Strategy

- Status: Proposed
- Date: 2025-09-13
- Owners: Eng, Product
- Related: phase-2-form-system.prd.md, decision-support.md

## Context
We need resilient progress saving without overloading the API or complicating privacy.

## Options Considered
- Save on navigation only (prev/next buttons).
- Debounced autosave (e.g., 30s idle) + on navigation.
- Local cache + server sync for offline support.

## Decision
Implement debounced autosave (30s) plus on navigation; server is the source of truth. No offline cache in Phase 2.

## Implications
- Engineering: Medium effort; idempotent PATCH per page; conflict handling minimal.
- Product: Strong resilience on refresh; acceptable behavior when offline (error prompt).
- Risk: More API calls; mitigate with debounce and cancel on navigation.

## Follow-ups
- Define API contract for page-level PATCH.
- Implement client debounce/cancel pattern.
- Add load-resume logic by last saved page.

