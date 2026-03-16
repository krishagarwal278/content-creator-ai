# Architecture Decision Records (ADRs)

This directory holds **Architecture Decision Records** for Videaa. See [SKILL_architect.md](../../skills/SKILL_architect.md) for when to add one.

## When to write an ADR

Write an ADR for **structural** changes, for example:

- New external service or integration
- New Supabase table or major schema change
- Repo split, new deployment target, or pipeline change
- Major tech choice (e.g. job queue, caching, CDN)

Do **not** require an ADR for cosmetic changes, small features, or refactors that don’t change system boundaries.

## Format

Create a file `ADR-NNN-short-title.md` (e.g. `ADR-001-job-queue-bullmq.md`) with:

```markdown
# ADR-NNN: <Title>

## Status
Proposed | Accepted | Deprecated

## Context
What problem are we solving? What constraints exist?

## Decision
What are we doing?

## Consequences
What becomes easier? What becomes harder?
```

## Index

(Add new ADRs to the list below as they are created.)

- (none yet)
