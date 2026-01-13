# ADR-0005: Versioning & Immutability Policy

- Status: Proposed
- Date: 2025-09-13
- Owners: Product, Eng
- Related: project-bootstrap.prd.md, decision-support.md

## Context
Research comparability and auditability require careful version management for forms and prompt pipelines.

## Options Considered
- Strict immutability (publish new semver for any change).
- Mutable drafts with change log; immutability only after publish.
- Patch-in-place with migration notes.

## Decision
Adopt immutable versions once published (semver). Drafts are mutable until publish. Never mutate published definitions.

## Implications
- Engineering: Simple retrieval and analytics; more artifacts to manage.
- Product: Clear provenance; slower small tweaks (require new version).
- Risk: Version sprawl; mitigate with deprecation policy and admin tools.

## Follow-ups
- Add publish/deprecate admin actions.
- Enforce immutability at API layer.
- Document version selection rules for runs.

