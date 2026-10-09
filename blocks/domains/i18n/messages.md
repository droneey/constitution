# Messages

> Governs a message: its catalog and its composition.

## Catalog

### user-facing-text-from-catalog · MUST
Every string a user reads comes from the message catalog, by key; none is written in code.

| Why | Tags |
|---|---|
| text in code cannot be translated or reworded without a code change, and it is found only by reading every file. | [ux] |

### source-catalog-ships-with-its-code · MUST
A change to the code's messages and the change it makes to the source language's catalog ship together, in one change; translations may follow.

| Why | Tags |
|---|---|
| a source catalog behind its code shows a message nobody can translate, and one ahead of it keeps messages nothing shows. | [ux] |

### module-level-text-holds-the-message · MUST
Text defined at a module's top level — an option list, an enumeration's labels — holds the message, never its translated result, and is translated where it is shown.

| Why | Tags |
|---|---|
| a translation taken when the module loads keeps the locale of that moment, and a later switch of language misses it. | [] |

## Composition

### messages-take-named-parameters · MUST
A message takes its values as named parameters inside it; a sentence is never built by joining strings.

| Why | Tags |
|---|---|
| languages order words differently, so a sentence joined in code cannot be translated. | [ux] |

### interpolated-value-isolated-for-direction · MUST
A value interpolated into a message — a name, a title the user wrote — is isolated for direction, so text of the other direction never reorders the sentence around it.

| Why | Tags |
|---|---|
| a right-to-left name inside a left-to-right sentence otherwise scrambles the words beside it. | [] |

### plural-forms-by-locale-rules · MUST
Plural and ordinal forms are selected by the locale's CLDR rules, and the variants of a sentence that changes with a value — a gender, a role, a status — by a select, all inside the message, never by a condition in code such as "the count is one".

| Why | Tags |
|---|---|
| many languages have more than two plural forms, and code written for one language gets the others wrong. | [ux] |

### ambiguous-messages-carry-context · SHOULD
A short or ambiguous message carries a comment or a context for its translator.

| Why | Tags |
|---|---|
| "Open" is a verb or an adjective; a translator who cannot see the screen guesses. | [ux] |

## Development

### pseudo-locale-runs-in-development · SHOULD
A pseudo-locale — accented, longer, and optionally right to left — runs in development.

| Why | Tags |
|---|---|
| it shows text written outside the catalog, text cut by its box, and sentences built by joining. | [ux] |

## Requirements for implementation

### i18n-messages-in-messageformat · MUST
The library reads messages in ICU MessageFormat or its successor, Unicode MessageFormat 2, so plurals, selects and named parameters live inside the message.

| Why | Tags |
|---|---|
| a catalog in the shared syntax keeps every form inside its message, and any translation tool can read it. | [ux] |

### i18n-missing-key-fails-the-check · SHOULD
The library makes a missing or misspelt key fail the check.

| Why | Tags |
|---|---|
| a missing key shows the user a raw key instead of text, and only a check finds it before they do. | [ux] |

### i18n-locale-loaded-on-demand · SHOULD
The library loads each locale's catalog on demand.

| Why | Tags |
|---|---|
| a user downloads only the language they read. | [performance] |
