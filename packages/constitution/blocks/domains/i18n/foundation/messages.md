# Messages

> Governs a message: its catalogue and its composition.

## Catalogue

### user-facing-text-from-the-catalogue → text-a-person-reads-held-in-a-messages-file · MUST

A string a person reads comes from the message catalogue. It is looked up by a stable key or by its source text, and its source text sits in the `.messages` file; a translation lives only in its locale's catalogue, never in the `.messages` file or in code.

| Why |
|---|
| text in code cannot be translated or reworded without a code change, and a translation kept beside its source message mixes every language's wording into one file. |

### source-catalogue-ships-with-its-code · MUST

The source catalogue ships with the code's messages. A change to the code's messages and the change it makes to the source language's catalogue ship together, in one change; translations may follow.

| Why |
|---|
| a source catalogue behind its code shows a message nobody can translate, and one ahead of it keeps messages nothing shows. |

### module-level-text-holds-the-message · MUST

Text defined at a module's top level holds the message, never its translated result. Such text — an option list, an enumeration's labels — is translated where it is shown.

| Why |
|---|
| a translation taken when the module loads keeps the locale of that moment, and a later switch of language misses it. |

## Composition

### messages-take-named-parameters · MUST

A message takes its values as named parameters inside it. A sentence is never built by joining strings.

| Why |
|---|
| languages order words differently, so a sentence joined in code cannot be translated. |

### interpolated-value-isolated-for-direction · MUST

A value interpolated into a message is isolated for direction. That holds for a name or a title the user wrote, so text of the other direction never reorders the sentence around it.

| Why |
|---|
| a right-to-left name inside a left-to-right sentence otherwise scrambles the words beside it. |

### plural-forms-by-locale-rules · MUST

Plural and ordinal forms and a sentence's other variants are chosen inside the message, plural and ordinal forms by the locale's rules. Those are the locale's CLDR rules, and the variants of a sentence that changes with a value — a gender, a role, a status — are chosen by a select inside the message; none is chosen by a condition in code such as "the count is one".

| Why |
|---|
| many languages have more than two plural forms, and code written for one language gets the others wrong — CLDR's plural rules. |

### ambiguous-messages-carry-context · SHOULD

A short or ambiguous message carries a comment or a context for its translator.

| Why |
|---|
| "Open" is a verb or an adjective; a translator who cannot see the screen guesses. |

### message-apostrophe-never-straight → text-uses-the-locales-punctuation · SHOULD

A message in MessageFormat writes no straight `'`: its apostrophe is its language's typographic one.

| Why |
|---|
| MessageFormat 1 reads a straight apostrophe before a brace as the start of an escape, so the parameter after it is shown as text. |

## Development

### pseudo-locale-runs-in-development · SHOULD

A pseudo-locale runs in development. It is accented and longer, and optionally right to left.

| Why |
|---|
| without it, text written outside the catalogue, text cut by its box and sentences built by joining reach the first real translation unseen. |

## Requirements for implementation

### message-format-handles-plural-gender-and-select · MUST

The library's message format handles plural, gender and select inside the message. It selects plural and ordinal forms by each locale's rules and a gender or another variant by a select, takes named parameters, and is a format translation tools read.

| Why |
|---|
| a format that cannot hold plurals and selects pushes them out into code written for one language's forms, and a format no translation tool reads is translated by hand. |

### missing-message-key-fails-the-check · SHOULD

The library makes a missing or misspelt message key fail the check.

| Why |
|---|
| a missing key shows the user a raw key instead of text, and only a check finds it before they do. |
