# Security

> Governs the input of interpreters, code run from strings, collections keyed by outside input, patterns matched against it and identifiers in it, and random values.

## Input from outside

### interpreter-input-never-joined-by-a-template-literal → outside-input-reaches-interpreters-as-parameters · MUST

No outside input reaches a query, markup or a log line through a template literal or `+`. It travels as the interpreter's parameter, such as a query's bound value or a structured log line's field, or in a tagged template whose tag the interpreter's library provides and which binds or escapes each value.

| Why |
|---|
| a template literal joins the input into the text before the interpreter sees it, so the input becomes code, while a tag receives the strings and the values apart. |

### code-never-run-from-a-string · MUST

No code is run from a string. There is no `eval`, no `new Function`, and no `setTimeout` or `setInterval` given a string.

| Why |
|---|
| a string run as code runs whatever reaches it, so one piece of outside input inside it becomes the attacker's program, with every right the program has. |

### outside-keyed-collection-is-a-map · MUST

Every collection keyed by values from outside the program is a `Map`, or an object made by `Object.create(null)`. No outside input is merged into a plain object by its own keys.

| Why |
|---|
| a key such as `__proto__` or `constructor` written into a plain object changes the prototype every object shares, and with it the checks and defaults of the whole program. |

### regexp-on-outside-input-holds-no-nested-quantifier → outside-input-matched-in-linear-time · MUST

No pattern that `RegExp` matches against outside input holds a nested or overlapping quantifier.

| Why |
|---|
| `RegExp` backtracks in every runtime and is never the matcher that never backtracks core allows, so a nested or overlapping quantifier it runs on a crafted input backtracks for minutes and holds the event loop, and every other request with it. |

### outside-identifier-normalised-by-nfkc → outside-identifier-normalised-before-comparison · MUST

Where no standard fixes its form, every identifier in outside input that grants or refuses access is normalised as `value.normalize('NFKC').toLowerCase().normalize('NFKC')`.

| Why |
|---|
| two spellings of one identifier, another Unicode form or another case, otherwise pass a check made on one of them, lower-casing can undo the NFKC form made before it, and JavaScript has no full case fold, so its lower-casing is the fold — the Unicode Standard, section 3.13, and Unicode Standard Annexes #15 and #31. |

## Primitives

### guarding-random-value-from-web-crypto → guarding-token-from-a-cryptographic-random-source · MUST

Every token, nonce or identifier that guards access comes from Web Crypto's `crypto.getRandomValues` or `crypto.randomUUID`, never from `Math.random`.

| Why |
|---|
| `Math.random` can be predicted from a few of its outputs, so a value drawn from it is guessed by whoever saw others; Web Crypto is a cryptographic source in every runtime. |
