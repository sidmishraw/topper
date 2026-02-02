---
author: Sid
version: 1.1.0
created-at: 2026-01-31T12:00:00Z
last-updated-at: 2026-02-01T10:00:00Z
generated-by: Claude Opus 4.5 (claude.ai)
updated-by: Claude Opus 4.5 (claude-code)
---

# AGENTS.md

Instructions for AI agents working on this codebase. Read this file completely before taking any action.

## Core Principles

1. **Plan before acting.** No non-trivial changes without a code-generation-plan document.
2. **Append, never rewrite.** Historical context is sacred. Add new entries; don't delete or summarize old ones.
3. **Document rationale, not just changes.** Future readers need to know *why*, not just *what*.
4. **Ask when uncertain.** If requirements are ambiguous, clarify before implementing.

## Workflow: Code Generation Plans

Every PR requires a plan document. No exceptions for non-trivial changes.

### Location

```
/docs/plans/<ticket-or-pr-id>-<short-description>.md
```

Example: `/docs/plans/PR-1234-add-redis-caching.md`

### Template

```markdown
---
author: <human/dev name>
version: 1.0.0
created-at: <YYYY-MM-DDTHH:MM:SSZ>
last-updated-at: <YYYY-MM-DDTHH:MM:SSZ>
generated-by: <model name> (<tool>)
updated-by: <model name> (<tool>)
status: [draft | in-review | approved | implemented | superseded]
ticket: [link or ID]
---

# <Title>

## Problem Statement
What problem are we solving? Why does it matter? What happens if we don't solve it?

## Current State
- How does the system behave today?
- Relevant code paths, modules, or components
- Known limitations or tech debt

## Target State
- Desired behavior after implementation
- Success criteria (measurable where possible)
- Out of scope (explicit boundaries)

## Implementation Path
Step-by-step approach to get from current to target state.

1. Step one
2. Step two
3. ...

### Alternatives Considered
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A      |      |      | Rejected: reason |
| B      |      |      | Selected: reason |

## Test Plan
How do we verify the implementation is correct?

- [ ] Unit tests for X
- [ ] Integration tests for Y
- [ ] Manual verification of Z
- [ ] Rollback plan if deployed

## Learnings
Discovered during design/implementation. Append entries as you go.

- [YYYY-MM-DD] <learning>

## Changelog
Design rationale for each significant change to this plan.

- v1.0.0 (YYYY-MM-DD): Initial draft
```

### Lifecycle

1. **Draft** — Agent or human creates initial plan
2. **Review** — Team reviews, agent waits for approval
3. **Approved** — Implementation begins
4. **Implemented** — Code merged, plan archived
5. **Superseded** — Later decision overrides this one (link to new plan)

## Updating This File

When you make non-trivial changes to the codebase:

1. **Update relevant sections** with new learnings or conventions
2. **Bump version**:
    - Patch (x.x.1): Minor clarifications
    - Minor (x.1.0): New conventions or sections
    - Major (1.0.0): Breaking workflow changes
3. **Update `last-updated-at`** to current system timestamp
4. **Update `updated-by`** to your model and tool (e.g., `Claude Opus 4.5 (claude-code)`)
5. **Do NOT modify `generated-by`** — this tracks the original author
6. **Add changelog entry** at the bottom of this file

## Project Conventions

### Code Style
- TypeScript with ES6 target, CommonJS modules
- Strict mode enabled (`tsconfig.json`)
- Constants defined in `topper.ts`, prefixed with `TOPPER_` or descriptive names
- Use `let` for mutable, `const` for immutable variables
- BSD 3-Clause license header on all source files

### Architecture
- `src/extension.ts` - Entry point, command registration, watcher startup
- `src/topper/topper.ts` - Type definitions, interfaces, and constants
- `src/topper/service.ts` - Header creation logic with Mustache templating
- `src/topper/topperwatcher.ts` - File save event handling and auto-updates
- `src/topper/license.ts` - License text generation from templates in `resources/`
- `src/util/` - Utility modules (Optional monad, user info)
- Configuration schema defined in `package.json` under `contributes.configuration`

### Testing
- Test framework: Mocha (configured but minimal tests)
- Manual testing via F5 Extension Development Host
- No coverage requirements currently enforced

## Known Constraints

Document system constraints, limitations, or "weird" code that exists for a reason.

| Area | Constraint | Rationale | Added |
|------|------------|-----------|-------|
| Templates | Tokenization uses `split(' ')` | Tokens cannot contain spaces; sufficient for current use cases | 2026-02-01 |
| Regex sync | `lastModifiedRegex` must match `dateFormat` | Mismatch causes silent failure (field not updated) | 2026-02-01 |
| File save | Uses `onWillSaveTextDocument` not `onDidSave` | Allows modifying document before save completes | 2026-02-01 |
| Promises | Bluebird used in service.ts | Legacy; new code can use native async/await | 2026-02-01 |

## Learnings

Append new entries. Never delete.

- [2026-02-01] The existing `updateLastModifiedDate` pattern in topperwatcher.ts provides a good template for adding similar auto-update features. Key steps: get config, match regex, extract capture group, calculate range, replace via editor.edit().
- [2026-02-01] Git user detection requires exec with timeout to prevent hanging if git is slow or unavailable. 5 second timeout is reasonable.
- [2026-02-01] OS user info via `os.userInfo()` doesn't provide email, only username. Format adapts based on available data.

## Changelog

- v1.1.0 (2026-02-01): Added project conventions, architecture docs, and known constraints based on codebase analysis for issue #23 implementation
- v1.0.0 (2026-01-31): Initial AGENTS.md structure