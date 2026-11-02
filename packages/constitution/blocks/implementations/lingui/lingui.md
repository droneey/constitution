---
id: lingui
summary: Lingui for messages — ICU catalogues compiled per locale.
requires: [i18n, typescript]
extends: null
abstract: false
languages: []
governs: ["lingui.config.ts", "**/locales/**"]
---

# Lingui

> Messages as ICU catalogues, one per locale, compiled by **Lingui** as **`lingui.config.ts`** sets.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `plural-forms-by-locale-rules` | ICU `plural` and `<Plural>`, with CLDR rules through `Intl.PluralRules` | yes |
| `message-format-handles-plural-gender-and-select` | ICU MessageFormat, with `plural`, `selectordinal` and `select` | yes |
| `messages-take-named-parameters` | ICU placeholders of the `msg` descriptor, markup inside the message among them | yes |
| `missing-message-key-fails-the-check` | a message's id is its source text, and the check fails when the extracted source catalogue differs from the committed one (`source-catalogue-current-in-the-check`) | yes |
