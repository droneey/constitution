# pytest

> Governs what the specs lift.

## General

Ruff's part for pytest extends its part for Python with pytest's style (`PT`) and the bans that hold core's and pytest's rules on specs, and a project that tests with pytest extends it, the last link of the chain.

### specs-lift-only-assert-package-and-literal-rules · SHOULD

The project's `extend-per-file-ignores` lifts only `S101`, `INP001` and `PLR2004` in `tests/**`: a case asserts with `assert`, `tests/` is no package, and a case's literals are its data.

| Why |
|---|
| each other rule holds for the specs as for the program; a spec is code a reader must trust. |
