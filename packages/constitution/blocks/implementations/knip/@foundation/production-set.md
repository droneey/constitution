# Production set

> Governs the production set knip reads dead code by.

## General

### production-set-marked-in-the-entries → dead-code-deleted · MUST

The production set is marked in knip's settings. They mark the program's entries and source files with `!` and leave every file of test code out of it, wherever it sits, such as `__tests__/`, `tests/` and an example that renders a unit in isolation beside it, so code and dependencies that only test code reaches are unused in production mode.

#### Why

Code kept alive only by its tests is dead in production, and without the marked set knip cannot tell it from code the program uses.

#### Examples

```jsonc title="Avoid"
// knip.jsonc
{
  "entry": ["src/main.ts"],
  "project": ["src/**/*.ts"]
}
```

```jsonc title="Prefer"
// knip.jsonc
{
  "entry": ["src/main.ts!"],
  "project": ["src/**/*.ts!", "!src/**/__tests__/**!", "tests/**/*.ts"]
}
```
