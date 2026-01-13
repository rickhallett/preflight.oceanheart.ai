# ADR-0004: LLM Provider Strategy (Phase 3)

- Status: Proposed
- Date: 2025-09-13
- Owners: Eng, Research
- Related: phase-3-llm-coaching.prd.md, decision-support.md

## Context
We need conversational coaching with safety, predictable cost, and room to expand providers.

## Options Considered
- Single provider integration (faster path).
- Abstraction layer for multiple providers from day one.
- Bring-your-own-key for research partners.

## Decision
Start with a single provider behind a simple abstraction seam (service interface) to enable future multi-provider support with minimal refactor.

## Implications
- Engineering: High effort overall for pipeline + safety; medium for abstraction seam.
- Product: Faster initial delivery; flexibility to A/B later.
- Risk: Provider lock-in early; mitigate via interface boundaries and config.

## Follow-ups
- Define provider-agnostic interface (messages, tools, limits).
- Implement rate limits and conservative defaults.
- Add red-team tests for safety boundaries.

