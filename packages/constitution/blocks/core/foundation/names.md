# Names

> Governs a name in the code.

## The vocabulary

A store keeps the program's own data beyond a run — a database, an index, a set of files —, and a client is the object through which code reaches an outside system, holding the connection to it. A **subcommand**{#subcommand} is one of the actions a command-line program runs by name, as `install` is a package manager's.

A function is of one kind by what it does. An act changes something or reaches outside the program, and a read of a store answers from what the store holds. A parse turns outside or flatter input into a structured value and may fail, naming every problem it finds. A checked constructor takes a value's own representation and fails only on its invariant. A factory builds a unit from what it is handed, and a **starting transition** starts a value's life. A **rebuild from storage** restores a stored value and changes nothing. A conversion turns one value into another and cannot fail. A derived value is computed from a value and changes nothing, and a predicate answers yes or no.

## Meaning

### name-reveals-intent · SHOULD

A name says what its thing is for. It is pronounceable and searchable, with no abbreviation the business does not already use.

| Why |
|---|
| code is read far more often than it is written, and every reader of a name that hides its purpose looks the purpose up again, or guesses it wrong. |

### name-from-the-glossary · SHOULD

A name of the business is the glossary's word, never its vendor's or its store's. It is the business's own word from the project's glossary, and an operation the business offers is named by the business's verb, never by a word of building; a new term enters the glossary with the change that introduces it.

| Why |
|---|
| a name that differs from the word its people use is translated at every request, and the translation is where a request is misread; a word of building hides the business's own act, and a vendor's or a storage's word is renamed everywhere when they change. |

### concept-has-one-word · SHOULD

Each concept has one word. No two words name one concept — not `fetch`, `load` and `get` for one act —, and no word names two, save where the glossary says which meaning holds in which part of the program. Two acts that undo each other take a verb and its antonym, the same pair throughout.

| Why |
|---|
| a reader who sees two words assumes two things and a search misses the other, a word read in a meaning its part of the program does not give it misleads, and a pair that is no verb and its antonym hides one half from the reader who looks for it. |

### name-never-an-empty-word · SHOULD

A name is never only an empty word, and no function's name takes an empty verb. No thing is named `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `stuff` or `thing`, and no function by an empty verb — `handle`, `process`, `manage`, `do`, `execute` — whatever its object. Only a value whose shape the code does not know may take an empty name, and the code says so where it does. A callback named for the event it answers, and a name an implemented contract, a framework or its language's convention imposes, keep their form.

| Why |
|---|
| an empty name makes the reader look up what it holds, every time, and an empty verb says that a function does something, never what. |

### function-named-for-what-it-does · SHOULD

A function's name says what it does, in the word its kind takes. An act or a read of a store is a verb and its object, a parse is `parse` and the value it gives, and a checked constructor takes the form its term gives it. A factory is `create` and the unit it builds, and a starting transition the business's verb from the glossary that starts its value's life, as `place` an order or `register` a user; a rebuild from storage is `restore`, with what it rebuilds where the language's form needs it. A conversion is `to` and its target, or `from` and its source on the target type; a derived value, or what a function renders, is a noun named for what it returns or renders; and a predicate is named as a boolean is. `create` names nothing but the building of a new valid value or unit by a factory or a checked constructor, and the word `of`, in its language's case, ends only the name of a function that makes a value of the parts it is given, never a derived value's or a conversion's. No function's name starts with `validate`, `try`, `safe` or `make`. Whatever this rule gives or bans, a callback named for the event it answers, and a name an implemented contract, a framework or its language's convention imposes, keep their form.

| Why |
|---|
| a name that hides its kind leaves the caller to read the body before knowing whether a call acts, may fail on its input, builds, cannot fail or only answers, and two words for one kind split every search for it; `of`, `validate`, `try`, `safe` and `make` say none of this — command–query separation, and parse, don't validate. |

### name-never-dates-its-thing · SHOULD

A name says what its thing is, never when or how its code was written. No name holds `new`, `old`, `v2`, `legacy`, `fixed`, `improved` or `final`; a version that is part of a contract — an API's, a format's — and a word of the business, as a new password, are no such words, and a name an implemented contract, a framework or its language's convention imposes keeps its form.

| Why |
|---|
| the moment a name records passes with the next change, and the name then lies; the history is the version control's to keep. |

### member-name-never-repeats-its-owner · SHOULD

A member never repeats the name of the type or the object it belongs to. A name a module exports keeps its object, since it is read without its module.

| Why |
|---|
| the owner is written beside every use of its member, so its name said again is noise that hides the part that differs. |

### literal-with-a-meaning-is-named · SHOULD

A literal with a meaning is a named constant in one home. Such literals include a limit, a threshold, a status and a key; zero, one, an empty value and the literals of a test case are exempt.

| Why |
|---|
| a bare literal does not say what it means, and a repeated one is changed in one place and missed in another. |

## Form

### name-case-by-kind · SHOULD

Each kind of name takes the case its language's convention sets. This holds for a type, a function, a variable, a constant, an enumeration and its members, and the language's block names the case of each.

| Why |
|---|
| a name in a case its convention does not set for its kind no longer tells a reader whether it is a type, a value or a constant, so each name is looked up at its declaration. |

### type-name-undecorated · SHOULD

A type's name carries no mark of the construct that declares it. It takes no `I` prefix and no suffix such as `Interface`, `Type`, `Class` or `Abstract`; a word for the thing's role in the program is part of its name, and a name an implemented contract, a framework or its language's convention imposes keeps its form.

| Why |
|---|
| the declaration already shows the kind, the mark lengthens the name at every use, and it turns false the day the kind changes while the meaning stays. |

### name-number-matches-its-value · SHOULD

A name's grammatical number is the number of values it holds. A collection's name is plural and an item's singular, destructured names included, and a type's name, an enumeration's included, is singular unless its value is a collection.

| Why |
|---|
| a name in the wrong number makes a reader take a list for one of its elements or the reverse, and a plural type's name reads as a list where it holds one value. |

### event-name-in-past-tense · SHOULD

An event's name says what happened, in the past tense.

| Why |
|---|
| an event named in the imperative reads as a command, so a reader takes a fact that already happened for a request that may still be refused. |

### error-name-ends-in-error · SHOULD

An error type's name ends in the error suffix. The suffix is **`Error`**{#error-suffix}, the same for every error of the program, and a name an implemented contract, a framework or its language's convention imposes keeps its form.

| Why |
|---|
| an error named like a value is taken for one where it is caught, returned or logged, and the reader opens its declaration to tell a failure from a result. |

### value-name-carries-its-unit · SHOULD

The name of a number whose type does not carry its unit carries the unit.

| Why |
|---|
| a number without its unit is read in the wrong one sooner or later, and the bug looks like correct code. |

### boolean-name-is-a-positive-predicate · SHOULD

A boolean's name is a positive predicate. It starts with `is`, `has`, `can`, `should` or `did`, and a block below may set the prefixes for booleans of its own kind; a name an implemented contract, a framework or its language's convention imposes keeps its form.

| Why |
|---|
| a condition on the name reads as a question with a yes-or-no answer, and a negated name turns every check into a double negation. |
