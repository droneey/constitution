# Messages

> Governs a catalogue message: the messages file and the catalogue it sits in, and its composition.

## Vocabulary

A **catalogue message** is one text of copy as a catalogue holds it, with the named parameters that fill it.

A locale's **catalogue** holds its catalogue messages, and the **source catalogue** holds them in the source language, in the program's messages files or extracted from its code.

A **messages file**, marked **`.messages`**{#message-file}, is a file that catalogue messages are written into in the source language; a locale's catalogue file, and a catalogue extracted from the code, are none.

The **catalogue library** holds the product's catalogues and renders their catalogue messages, and its **catalogue format** is the syntax a catalogue message is written in.

An error's **debug text** is the text it is built with for those who debug the program, not for its user.

## Catalogue

### text-a-person-reads-held-in-a-messages-file · SHOULD

All copy sits in a messages file beside the unit that shows it. It covers the text of a screen, a subcommand's help and the wording of a report. Exempt: an error's debug text, and a translation, which its locale's catalogue holds.

| Why |
|---|
| text written inside logic is reworded by editing that logic and reviewed as code, while text apart from it changes alone and the checks of logic leave it out by its kind. |

### messages-file-carries-its-mark → file-named-for-its-kind · MUST

Every messages file carries its mark.

| Why |
|---|
| a messages file named off its mark is missed by the tool that finds it by its name, so it is checked as logic or left out of what a translator is handed. |

### messages-mark-marks-only-messages-files → kind-mark-marks-only-its-kind · MUST

No file but a messages file carries the messages file's mark.

| Why |
|---|
| a mark on a file of another kind makes the tool that finds messages files by their name hand its code to a translator, or leave its logic out of the checks. |

### user-facing-text-from-the-catalogue · MUST

All copy comes from a catalogue. Exempt: an error's debug text.

| Why |
|---|
| text in code cannot be translated or reworded without a code change. |

### translation-kept-in-its-locales-catalogue · MUST

Every translation lives only in its locale's catalogue, never in the source catalogue or in code.

| Why |
|---|
| a translation kept beside its source text mixes every language's wording into one file, and one kept in code cannot be changed by a translator. |

### source-catalogue-ships-with-its-code · MUST

Every change to the code's catalogue messages carries the change it makes to the source catalogue. Translations may follow in a later change.

| Why |
|---|
| a source catalogue behind its code shows a text nobody can translate, and one ahead of it keeps texts nothing shows. |

### module-level-text-holds-the-message · MUST

Every text defined at a module's top level holds its catalogue message, never its translated result. Such text includes an option list and an enumeration's labels, and is translated where it is shown.

| Why |
|---|
| a translation taken when the module loads keeps the locale of that moment, and a later switch of language misses it. |

### catalogue-format-read-by-translation-tools · MUST

Every catalogue is kept in a catalogue format that translation tools read.

| Why |
|---|
| a format no translation tool reads is translated by hand, and every hand copy drifts from its source. |

### missing-catalogue-key-fails-the-check · SHOULD

Every missing or misspelt key of a catalogue message fails the check.

| Why |
|---|
| a missing or misspelt key shows the user a raw key instead of text, and only a check finds it before they do. |

## Composition

### messages-take-named-parameters · MUST

Every catalogue message takes its values as named parameters inside it.

| Why |
|---|
| a parameter known only by its position gives the translator no clue what it holds, and a language that orders it otherwise moves the wrong value. |

### sentence-never-joined-from-strings · MUST

No sentence of copy is built by joining strings in code.

| Why |
|---|
| languages order words differently, so a sentence joined in code cannot be translated. |

### interpolated-value-isolated-for-direction · MUST

Every value a person wrote that a catalogue message interpolates, such as a name or a title, is isolated for direction. Text of the other direction then never reorders the sentence around it.

| Why |
|---|
| a right-to-left name inside a left-to-right sentence otherwise scrambles the words beside it. |

### plural-forms-by-locale-rules · MUST

Every plural or ordinal form is chosen inside its catalogue message by the locale's CLDR rules, never by a condition in code. A test such as the count being one is such a condition.

| Why |
|---|
| many languages have more than two plural forms, and code written for one language gets the others wrong — CLDR's plural rules. |

### message-variant-chosen-by-a-select · MUST

Every variant of a sentence that a value it speaks of changes is chosen by a select inside its catalogue message. Such a value is a gender, a role or a status, and code never chooses the variant.

| Why |
|---|
| a variant chosen in code gives every language the source language's set of variants, and a language that needs another set cannot be translated. |

### messages-file-holds-no-logic · SHOULD

All logic that picks one catalogue message among several sits outside the messages file. Such logic picks, for instance, a short or a long label by the screen's width, and names the catalogue messages it picks from. A plural, an ordinal or a select form chooses inside one catalogue message, and stays in it.

| Why |
|---|
| logic inside a messages file is left out of every check of logic by its kind, so its branches go untested. |

### ambiguous-messages-carry-context · SHOULD

Every short or ambiguous catalogue message carries a comment or a context for its translator.

| Why |
|---|
| "Open" is a verb or an adjective; a translator who cannot see the screen guesses. |

### catalogue-apostrophe-never-escapes-a-parameter · MUST

No straight apostrophe in a catalogue message turns the parameter after it into text.

| Why |
|---|
| a format that reads a straight apostrophe before a brace as the start of an escape shows the parameter after it as text, so a translator's ordinary apostrophe breaks the catalogue message in that one language. |

## Development

### pseudo-locale-runs-in-development · SHOULD

Every program with a catalogue offers a pseudo-locale in development, accented and longer than its source and optionally right to left.

| Why |
|---|
| without it, text written outside the catalogue, text cut by its box and sentences built by joining reach the first real translation unseen. |
