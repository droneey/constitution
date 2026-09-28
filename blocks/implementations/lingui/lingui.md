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

| Requirement | How in Lingui | Status |
|---|---|---|
| `i18n-plurals-by-cldr` | ICU `plural` and `<Plural>`, with CLDR rules through `Intl.PluralRules` | met |
| `i18n-parameters-without-concatenation` | ICU placeholders; `<Trans>` keeps components inside the message | met |
| `i18n-typed-keys` | a message's id is its source text, checked by extraction; no compile-time key type | partial: the strict compile fails on a missing message |
| `i18n-lazy-locales` | a dynamic import per locale through the build plugin | met |
