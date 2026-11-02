# Values

> Governs the values a schema builds.

## General

### parsed-value-built-through-its-own-check → invariant-checked-at-construction · MUST

A schema builds a value that keeps an invariant only through that value's own check. It never restates the check nor defines the value a second time, and it reports the check's failure as a problem of the parse, listed with the input's other problems.

| Why |
|---|
| a check copied into a schema drifts from the value's own, and a second definition of the value skips it, so the schema accepts values the program refuses; a failure that escapes the parse as the value's own error is missing from the issues its caller is shown — a single source of truth. |
