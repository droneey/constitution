---
id: lingui
kind: implementation
summary: Lingui for messages — ICU catalogs compiled per locale.
chapters: []
requires: [i18n, typescript]
extends: null
abstract: false
checks: []
owns: [Lingui, lingui.config.ts]
governs: ["lingui.config.ts", "**/locales/**"]
status: stable
---

# Lingui

> Messages as ICU catalogs, one per locale.

## messages-through-lingui-macros · MUST
Text goes through Lingui's macros — `t`, `<Trans>`, `msg`, `<Plural>` — as ICU messages; never concatenation or an id built by hand.
**Why:** the macros extract every message into the catalog, with its parameters and plural forms intact.
**Check:** review
**Tags:** ux
**Implements:** `messages-take-named-parameters`

## catalogs-compiled-strictly-in-check · MUST
The check compiles the catalogs in strict mode, failing on a missing translation, and writes no tracked file. Extraction is the author's step, and its change to the catalog is committed with the code.
**Why:** a missing translation fails before release, and the check never rewrites what it checks.
**Check:** review
**Tags:** workflow
**Implements:** `check-only-checks`

## Requirements

| Requirement | How in Lingui | Status |
|---|---|---|
| `i18n-plurals-by-cldr` | ICU `plural` and `<Plural>`, with CLDR rules through `Intl.PluralRules` | met |
| `i18n-parameters-without-concatenation` | ICU placeholders; `<Trans>` keeps components inside the message | met |
| `i18n-typed-keys` | a message's id is its source text, checked by extraction; no compile-time key type | partial: the strict compile fails on a missing message |
| `i18n-lazy-locales` | a dynamic import per locale through the build plugin | met |
