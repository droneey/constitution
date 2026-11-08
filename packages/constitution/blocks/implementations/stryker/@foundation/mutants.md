# Mutants

> Governs the mutants the configuration leaves out, the code Stryker cannot mutate, how an equivalent mutant is marked and the runs it caches.

## General

### diagnostic-mutants-left-out-by-the-ignorer → every-mutant-killed · MUST

Stryker's ignorer leaves out the mutants of text only a person reads, and no other. `ignorers` holds the Constitution's `diagnostics` ignorer, which leaves out the string and template mutants of a `.messages` file and the text a call takes. `diagnosticsTextArguments` names each such call by its shape — the function, the method or the constructor it calls, `super` among them, `*` standing for any letters — and the indexes of its text arguments; no other mutant is left out by the configuration.

| Why |
|---|
| a caller relies on no text only a person reads, so a case written to kill such a mutant proves no plausible bug; a file's kind and a block's contract tell the text, never a name the ignorer guesses, and a call no block names keeps its mutants, so a missing entry shows in the run instead of hiding a case. |

### logic-kept-out-of-as-const → every-mutant-killed · MUST

An `as const` literal holds no logic. It holds only values written out and names: a function, a call or any other expression that computes is defined outside it and named inside.

| Why |
|---|
| Stryker skips the whole of an `as` expression, so logic inside one is never mutated and passes the gate unmeasured. |

### incremental-mode-left-off → every-mutant-killed · MUST

No run of Stryker is incremental. `incremental` stays at Stryker's default, off.

| Why |
|---|
| with no spec reported per mutant, a result cached from an earlier run can hide a survivor the change made. |

## Suppressions

### equivalent-mutant-marked-on-its-line → suppression-silences-one-finding · MUST

Every equivalent mutant is marked on its line by `// Stryker disable next-line <mutator>`. The mark never names `all`.

| Why |
|---|
| a disable without `next-line` holds to the end of the file, and `all` silences every mutator. |

### stryker-disable-gives-its-reason-after-the-colon → suppression-states-its-reason · MUST

Every mark of an equivalent mutant states its reason after its colon, as `// Stryker disable next-line <mutator>: <reason>`.

| Why |
|---|
| a mark without its reason cannot be judged by its next reader, who cannot tell whether the mutant is still equivalent, so it is kept for ever or removed blind. |
