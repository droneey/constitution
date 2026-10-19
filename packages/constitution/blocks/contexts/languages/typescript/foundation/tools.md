# Tools

> Governs the suppression of a type error.

## Findings

### type-error-suppressed-by-ts-expect-error → suppression-states-its-reason · MUST

A type error kept on purpose is silenced by `@ts-expect-error` with its reason on the same line, never by `@ts-ignore` or `@ts-nocheck`.

| Why | Tags |
|---|---|
| `@ts-expect-error` fails once the error it silences is gone, so it never outlives its reason, while `@ts-ignore` silences whatever error later lands on its line and `@ts-nocheck` a whole file. | [] |
