---
id: lingui
summary: Lingui for messages — ICU catalogs compiled per locale.
requires: [i18n, typescript]
extends: null
abstract: false
checks: []
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
| `i18n-typed-keys` | a message's id is its source text, checked by extraction; no compile-time key type; the strict compile fails on a missing message | partly |
| `i18n-lazy-locales` | a dynamic import per locale through the build plugin | yes |
