# pytest

> Governs what the specs lift.

## General

### specs-lift-only-assert-package-and-literal-rules · MUST

The specs lift only Ruff's rules on `assert`, packages and literals. The project's `extend-per-file-ignores` lifts only `S101`, `INP001` and `PLR2004` in `tests/**`: a case asserts with `assert`, `tests/` is no package, and a case's literals are its data.

#### Why

A spec is code a reader must trust, so a rule lifted for the specs beyond these lets into them the bugs it catches in the program.

#### Examples

```toml title="Avoid"
[tool.ruff.lint.extend-per-file-ignores]
"tests/**" = ["S101", "INP001", "PLR2004", "ANN", "D", "ARG001"]
```

```toml title="Prefer"
[tool.ruff.lint.extend-per-file-ignores]
"tests/**" = ["S101", "INP001", "PLR2004"]
```
