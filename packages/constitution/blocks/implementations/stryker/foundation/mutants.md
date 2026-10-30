# Mutants

> Governs the mutants the configuration leaves out, the code Stryker cannot mutate, and how an equivalent mutant is marked.

## General

### diagnostic-mutants-left-out-by-the-ignorer → every-mutant-killed · MUST

`ignorers` holds the `diagnostics` of the Constitution's distribution, which leaves out the mutants of text only a person reads and no other: the string and template mutants of a `.messages` file, and the text a call takes. `diagnosticsTextArguments` names each such call by its shape — the function, the method or the constructor it calls, `super` among them, `*` standing for any letters — and the indexes of its text arguments, and the block whose rule makes that text a person's gives the entry: a logging library its levels' messages, a library of commands its help, core the message an error is built with or hands to `super`; no other mutant is left out by the configuration.

| Why |
|---|
| a caller relies on no text only a person reads, so a case written to kill such a mutant proves no plausible bug; a file's kind and a block's contract tell the text, never a name the ignorer guesses, and a call no block names keeps its mutants, so a missing entry shows in the run instead of hiding a case. |

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
