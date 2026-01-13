# ADR-0001: Form DSL Scope (Phase 2)

- Status: Proposed
- Date: 2025-09-13
- Owners: Product, Eng
- Related: phase-2-form-system.prd.md, decision-support.md

## Context
We need a JSON-driven form system. Scope choices affect renderer complexity, validation, and delivery time for Phase 2.

## Options Considered
- Minimal blocks (markdown, text, textarea, select, radio, checkbox); no conditional logic.
- Add conditional logic and layout groups in v1.
- Adopt third-party schema/renderer library.

## Decision
Proceed with minimal blocks for Phase 2; defer conditional logic/layout groups to v2. Build our own lightweight DSL aligned to research needs.

## Implications
- Engineering: Medium effort; simpler renderer, faster tests. Easier migrations.
- Product: Fewer UX patterns initially; iterate faster with validated scope.
- Risk: Future needs may require DSL expansion; mitigate with backward-compatible additions.

## Follow-ups
- Finalize DSL types and examples.
- Align API contracts and server validators.
- Prepare v2 backlog for conditional logic.

