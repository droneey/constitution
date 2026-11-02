# Production set

> Governs the production set knip reads dead code by.

## General

### production-set-marked-in-the-entries → dead-code-deleted · MUST

knip's settings mark the production set. They mark the program's entries and source files with `!` and leave `__tests__/` and `tests/` out of it, so code and dependencies that only specs reach are unused in production mode.

| Why |
|---|
| code kept alive only by its tests is dead in production, and without the marked set knip cannot tell it from code the program uses. |
