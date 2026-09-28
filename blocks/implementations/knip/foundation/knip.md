# knip

## unused-check-in-production-mode · MUST
The check runs knip twice: over everything, and in production mode (`--production`), so code and dependencies that only specs reach count as unused.
**Why:** code kept alive only by its tests is dead in production, and the full run alone cannot see it.
**Check:** tool — unused
**Tags:** architecture
**Implements:** `no-dead-code`
