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

### messages-through-lingui-macros → messages-take-named-parameters · MUST

Text goes through Lingui's macros — `t`, `<Trans>`, `msg`, `<Plural>` — as ICU messages; never concatenation or an id built by hand.

| Why | Tags |
|---|---|
| the macros extract every message into the catalog, with its parameters and plural forms intact. | [] |

### source-catalog-current-in-the-check → i18n-missing-key-fails-the-check · MUST

The check extracts the source locale's catalog and fails when it differs from the one committed; a translation another locale lacks falls back to its source message.

| Why | Tags |
|---|---|
| a missing translation then fails before release, not on a user's screen. | [] |

### module-level-messages-are-descriptors → module-level-text-holds-the-message · MUST

Text defined outside a render — an option list, an enum's labels — is a `msg` descriptor rendered later.

| Why | Tags |
|---|---|
| a module's text is evaluated once, before the locale is known. | [] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `plural-forms-by-locale-rules` | ICU `plural` and `<Plural>`, with CLDR rules through `Intl.PluralRules` | yes |
| `messages-take-named-parameters` | ICU placeholders; `<Trans>` keeps components inside the message | yes |
| `i18n-missing-key-fails-the-check` | a message's id is its source text, and the check fails when the extracted source catalog differs from the committed one (`source-catalog-current-in-the-check`) | yes |
