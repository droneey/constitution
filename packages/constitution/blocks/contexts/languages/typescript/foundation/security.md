# Security

> Governs the input of interpreters, code run from strings, keyed collections, random values, and outside patterns and identifiers.

## Input from outside

### interpreter-input-never-joined-by-a-template-literal → outside-input-reaches-interpreters-as-parameters · MUST

Outside input never reaches a query, markup or a log message through a template literal or `+`. It travels as the interpreter's parameter — a query's bound value, a log record's field — or in a tagged template whose tag the interpreter's library provides and which binds or escapes each value.

| Why |
|---|
| a template literal joins the input into the text before the interpreter sees it, so the input becomes code, while a tag receives the strings and the values apart. |

### code-never-run-from-a-string → outside-input-reaches-interpreters-as-parameters · MUST

No code is run from a string. There is no `eval`, no `new Function`, and no `setTimeout` or `setInterval` given a string.

| Why |
|---|
| a string run as code runs whatever reaches it, so one piece of outside input inside it becomes the attacker's program, with every right the program has. |

### outside-keyed-collection-is-a-map → outside-input-never-rebuilt-as-objects · MUST

A collection keyed by values from outside the program is a `Map`, or an object made by `Object.create(null)`. Outside input is never merged into a plain object by its own keys.

| Why |
|---|
| a key such as `__proto__` or `constructor` written into a plain object changes the prototype every object shares, and with it the checks and defaults of the whole program. |

### outside-pattern-a-safe-literal-or-on-a-linear-engine → outside-input-matched-in-linear-time · MUST

A regular expression that runs on outside input is a safe literal or runs on a linear-time engine. A safe literal has no nested or overlapping quantifiers.

| Why |
|---|
| JavaScript's engine backtracks, so a nested quantifier on a crafted input runs for minutes and holds the event loop. |

### outside-identifier-normalised-by-nfkc → outside-identifier-normalised-before-comparison · MUST

An identifier from outside is compared as `value.normalize('NFKC').toLowerCase()`, never as it arrived. A host name, whose own standard fixes its form, is exempt.

| Why |
|---|
| two spellings of one name, another Unicode form or another case, otherwise pass a check made on one of them — Unicode Standard Annexes #15 and #31. |

## Primitives

### guarding-random-value-from-web-crypto → security-primitive-from-a-vetted-library · MUST

A random value that guards access comes from Web Crypto. A token, a nonce or an identifier that guards access comes from `crypto.getRandomValues` or `crypto.randomUUID`, never from `Math.random`.

| Why |
|---|
| `Math.random` can be predicted from a few of its outputs, so a value drawn from it is guessed by whoever saw others; Web Crypto is a cryptographic source in every runtime. |
