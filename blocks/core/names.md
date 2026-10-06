# Names

> Governs a name in the code.

## Meaning

### name-reveals-intent · SHOULD
A name says what its thing is for: pronounceable, searchable, with no abbreviation the business does not already use and no noise word.

| Why | Tags |
|---|---|
| code is read far more often than it is written, and a name that needs a comment has failed. | [] |

### name-from-the-glossary · SHOULD
A name of the business is the business's own word from the project's glossary — `cancelOrder`, not `updateRecord` — and a new term enters the glossary with the change that introduces it.

| Why | Tags |
|---|---|
| when the code and its people use the same words, a request maps to the code without translation. | [] |

### concept-has-one-word · SHOULD
A concept has one word across the program, and a word names one concept: not `fetch`, `load` and `get` for one act.

| Why | Tags |
|---|---|
| a reader who sees two words assumes two things, and a search misses the other one. | [] |

### name-never-an-empty-word · SHOULD
A name is never only an empty word — `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `stuff`, `thing`; code that knows nothing of the program may use one for what is truly generic.

| Why | Tags |
|---|---|
| an empty name makes the reader look up what it holds, every time. | [] |

### function-name-has-a-concrete-verb · SHOULD
A function's name is a concrete verb and its object, never an empty verb alone — `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set`, `update`; a name an implemented interface imposes is exempt.

| Why | Tags |
|---|---|
| an empty verb says that a function does something, never what. | [] |

### business-name-free-of-vendor-and-storage · SHOULD
A name of the business names its concept, never the vendor or the storage behind it: `UserRecord`, not `UserMongoDocument`.

| Why | Tags |
|---|---|
| a vendor in such a name is renamed everywhere when the vendor changes, and leaks into code that should not know it. | [] |

### literal-with-a-meaning-is-named · SHOULD
A literal with a meaning — a limit, a threshold, a status, a key — is a named constant in one home; zero, one, an empty value and the literals of a test case are exempt.

| Why | Tags |
|---|---|
| a bare literal does not say what it means, and a repeated one drifts. | [] |

## Form

### name-case-by-kind · SHOULD
Each kind of name — a type, a function, a variable, a constant, an enumeration and its members — has one case, the one its language's own convention sets and its language block names.

| Why | Tags |
|---|---|
| the case alone tells what kind of thing a name is, before its declaration is read. | [] |

### collection-name-plural · SHOULD
A collection's name is plural and an item's singular, destructured names included, so a loop reads `for order of orders`.

| Why | Tags |
|---|---|
| the name alone tells a list from one of its elements. | [] |

### event-name-in-past-tense · SHOULD
An event's name says what happened, in the past tense: `OrderPlaced`, not `PlaceOrder`.

| Why | Tags |
|---|---|
| an event records a fact that already happened; a command asks for one. | [] |

### value-name-carries-its-unit · SHOULD
A value with a unit carries the unit in its name: `timeoutMs`, `sizeBytes`.

| Why | Tags |
|---|---|
| a number without its unit is read in the wrong one sooner or later, and the bug looks like correct code. | [] |

### boolean-name-is-a-positive-predicate · SHOULD
A boolean's name is a positive predicate that starts with `is`, `has`, `can`, `should` or `did`: `isVisible`, not `visible` or `isNotHidden`. A block below may set the prefixes for booleans of its own kind.

| Why | Tags |
|---|---|
| `if (isVisible)` reads as a question with a yes-or-no answer, and a negated name turns every check into a double negation. | [] |
