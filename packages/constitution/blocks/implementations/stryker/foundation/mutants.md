# Mutants

> Governs the mutants the configuration leaves out and how an equivalent mutant is marked.

## General

### diagnostic-mutants-left-out-by-the-ignorer → every-mutant-killed · MUST

`ignorers` holds the archive's `diagnostics`, which leaves out the mutants inside a log call — a `trace` to `fatal` call on a receiver named `log`, `logger` or `…Logger` — and inside the text an error is built with, the first argument of `new …Error`; no other mutant is left out by the configuration.

| Why | Tags |
|---|---|
| these are the mutants no caller relies on that a tool can tell by their form; a case written to kill one proves no plausible bug, and a mutant left out beyond them would hide a missing case. | [testing] |

### equivalent-mutant-marked-on-its-line → suppression-silences-one-finding · MUST

An equivalent mutant is marked `// Stryker disable next-line <mutator>: <reason>`; never `all`.

| Why | Tags |
|---|---|
| a disable without `next-line` holds to the end of the file, and `all` silences every mutator. | [] |
