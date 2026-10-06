# knip

## production-set-marked-in-the-entries → no-dead-code
The parts mark the program's entries and source files with `!`, the production set, and leave `__tests__/` and `tests/` out of it, so code and dependencies that only specs reach are unused in production mode.

| Why | Check | Tags |
|---|---|---|
| code kept alive only by its tests is dead in production, and without the marked set knip cannot tell it from code the program uses. | tool/unused | [] |
