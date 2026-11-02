# pytest

> Governs what the specs lift.

## General

Ruff's settings for pytest add to its settings for Python pytest's style (`PT`) and the bans that hold core's and pytest's rules on specs.

### specs-lift-only-assert-package-and-literal-rules · SHOULD

The specs lift only Ruff's rules on `assert`, packages and literals. The project's `extend-per-file-ignores` lifts only `S101`, `INP001` and `PLR2004` in `tests/**`: a case asserts with `assert`, `tests/` is no package, and a case's literals are its data.

| Why |
|---|
| a spec is code a reader must trust, so a rule lifted for the specs beyond these lets into them the bugs it catches in the program. |
