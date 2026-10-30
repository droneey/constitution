# Security

> Governs child processes, the input of interpreters, outside paths, code run from strings, keyed collections, random values, the comparison of secrets, and outside patterns and identifiers.

## Secrets

### child-process-given-an-env-of-its-own → child-process-environment-built-for-it · MUST

A process the program starts — through `spawn`, `execFile` or the runtime's own forms of them — is passed an `env` built for it, never left to inherit `process.env` and never given a copy of it.

| Why |
|---|
| each of these calls copies the whole of `process.env` into the child when `env` is left out, a secret among it. |

## Input from outside

### child-process-started-without-a-shell → outside-input-reaches-interpreters-as-parameters · MUST

A process is started with its arguments as an array — `execFile`, `spawn` and the runtime's own forms of them — never through `exec`, `execSync` or the option `shell: true`.

| Why |
|---|
| a command line handed to a shell is parsed again, and a `;` or a `$(…)` in its input runs as a command of its own. |

### outside-path-checked-by-relative → outside-path-confined-to-its-root · MUST

A path built from outside input is resolved with `path.resolve(root, input)`, taken to its real path by `fs.realpath` — of its folder, for a file not yet made — and refused when `path.relative` from the root's real path is `..`, starts with `..` and a separator, or is absolute; where another writer can change the tree, the file is opened and its handle's `stat()` device and inode are compared with those of the checked real path.

| Why |
|---|
| `path.join` follows every `..` it is given, out of the root, and a check on the string before it is resolved misses an encoded or nested one. |

### interpreter-input-never-joined-by-a-template-literal → outside-input-reaches-interpreters-as-parameters · MUST

Outside input never reaches a query, markup or a log message through a template literal or `+`; it travels as the interpreter's parameter — a query's bound value, a log record's field — or in a tagged template whose tag the interpreter's library provides and which binds or escapes each value.

| Why |
|---|
| a template literal joins the input into the text before the interpreter sees it, so the input becomes code, while a tag receives the strings and the values apart. |

### code-never-run-from-a-string → outside-input-reaches-interpreters-as-parameters · MUST

No code is run from a string: no `eval`, no `new Function`, and no `setTimeout` or `setInterval` given a string.

| Why |
|---|
| a string run as code runs whatever reaches it, so one piece of outside input inside it becomes the attacker's program, with every right the program has. |

### outside-keyed-collection-is-a-map → outside-input-never-rebuilt-as-objects · MUST

A collection keyed by values from outside the program is a `Map`, or an object made by `Object.create(null)`; outside input is never merged into a plain object by its own keys.

| Why |
|---|
| a key such as `__proto__` or `constructor` written into a plain object changes the prototype every object shares, and with it the checks and defaults of the whole program. |

### outside-pattern-a-safe-literal-or-on-re2 → outside-input-matched-in-linear-time · MUST

A regular expression that runs on outside input is a literal with no nested or overlapping quantifiers, or runs on a linear engine such as RE2; it is never built from outside input.

| Why |
|---|
| JavaScript's engine backtracks, so a nested quantifier on a crafted input runs for minutes and holds the event loop. |

### outside-identifier-normalised-by-nfkc → outside-identifier-normalised-before-comparison · MUST

An identifier from outside is compared as `value.normalize('NFKC').toLowerCase()`, never as it arrived.

| Why |
|---|
| two spellings of one name, another Unicode form or another case, otherwise pass a check made on one of them. |

## Primitives

### guarding-random-value-from-web-crypto → security-primitive-from-a-vetted-library · MUST

A token, a nonce or an identifier that guards access comes from `crypto.getRandomValues` or `crypto.randomUUID`, never from `Math.random`.

| Why |
|---|
| `Math.random` can be predicted from a few of its outputs, so a value drawn from it is guessed by whoever saw others; Web Crypto is a cryptographic source in every runtime. |

### secret-compared-by-timing-safe-equal → security-primitive-from-a-vetted-library · MUST

A secret — a token, a signature, a key — is compared with `timingSafeEqual` from `node:crypto`, or the runtime's equivalent, over the HMACs or digests of both sides, never with `===`.

| Why |
|---|
| `===` stops at the first byte that differs, and the time it takes tells an attacker how much of a guess was right. |
