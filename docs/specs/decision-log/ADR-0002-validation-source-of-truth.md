# ADR-0002: Validation Source of Truth

- Status: Proposed
- Date: 2025-09-13
- Owners: Eng
- Related: phase-2-form-system.prd.md, decision-support.md

## Context
Client and server must validate answers consistently to prevent data quality issues and UX confusion.

## Options Considered
- Server-only validators (client displays server errors).
- Shared JSON Schema (generated TS types + server validation from schema).
- Independent client and server validators.

## Decision
Adopt a shared schema approach: define constraints in a single JSON Schema; generate TS types for client, and use schema-based validation on the server.

## Implications
- Engineering: Medium effort to set up tooling; reduces drift long-term.
- Product: Clear, consistent error messaging across surfaces.
- Risk: Schema/tooling learning curve; mitigate with utilities and examples.

## Follow-ups
- Choose schema lib and generators; spike and document.
- Implement minimal constraint set for Phase 2.
- Add tests that assert parity between client and server validation.

