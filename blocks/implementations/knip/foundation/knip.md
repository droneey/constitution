# knip

## unused-check-in-production-mode → no-dead-code
The check runs knip twice: over everything, and in production mode (`--production`), so code and dependencies that only specs reach count as unused.

| Why | Check | Tags |
|---|---|---|
| code kept alive only by its tests is dead in production, and the full run alone cannot see it. | tool — unused | [] |
