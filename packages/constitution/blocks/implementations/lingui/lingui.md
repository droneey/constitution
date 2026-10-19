---
id: lingui
summary: Lingui for messages — ICU catalogs compiled per locale.
requires: [i18n, typescript]
extends: null
abstract: false
languages: []
dictionary: [Lingui, lingui.config.ts]
governs: ["lingui.config.ts", "**/locales/**"]
---

# Lingui

> Messages as ICU catalogs, one per locale.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `plural-forms-by-locale-rules` | ICU `plural` and `<Plural>`, with CLDR rules through `Intl.PluralRules` | yes |
| `messages-take-named-parameters` | ICU placeholders; `<Trans>` keeps components inside the message | yes |
| `i18n-missing-key-fails-the-check` | a message's id is its source text, and the check fails when the extracted source catalog differs from the committed one (`source-catalog-current-in-the-check`) | yes |
