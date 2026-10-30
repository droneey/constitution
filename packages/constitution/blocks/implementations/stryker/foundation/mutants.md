# Mutants

> Governs the mutants the configuration leaves out, the code Stryker cannot mutate, and how an equivalent mutant is marked.

## General

### diagnostic-mutants-left-out-by-the-ignorer → every-mutant-killed · MUST

`ignorers` holds the `diagnostics` of the Constitution's distribution, which leaves out only the mutants of text a person reads; the configuration leaves out no other mutant.

| Why |
|---|
| a caller relies on no text only a person reads, so a case written to kill such a mutant proves no plausible bug. |

### logic-kept-out-of-as-const → every-mutant-killed · MUST

An `as const` literal holds only values written out and names: a function, a call or any other expression that computes is defined outside it and named inside.

| Why |
|---|
| Stryker skips the whole of an `as` expression, so logic inside one is never mutated and passes the gate unmeasured. |

### equivalent-mutant-marked-on-its-line → suppression-silences-one-finding · MUST

An equivalent mutant is marked `// Stryker disable next-line <mutator>: <reason>`; never `all`.

| Why |
|---|
| a disable without `next-line` holds to the end of the file, and `all` silences every mutator. |
