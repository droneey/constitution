# Messages

> Governs a message: its macros, its catalog and where it is defined.

## General

### messages-through-lingui-macros → messages-take-named-parameters · MUST

Text goes through Lingui's macros — `t`, `<Trans>`, `msg`, `<Plural>` — as ICU messages; never concatenation or an id built by hand.

| Why | Tags |
|---|---|
| the macros extract every message into the catalog, with its parameters and plural forms intact. | [] |

### source-catalog-current-in-the-check → i18n-missing-key-fails-the-check · MUST

The check extracts the source locale's catalog and fails when it differs from the one committed; a translation another locale lacks falls back to its source message.

| Why | Tags |
|---|---|
| a message missing from the committed catalog then fails before release, not on a user's screen, and a translation not yet made shows the source text, never a raw id. | [] |

### module-level-messages-are-descriptors → module-level-text-holds-the-message · MUST

Text defined at a module's top level — an option list, an enumeration's labels — is a `msg` descriptor rendered later.

| Why | Tags |
|---|---|
| a module's text is evaluated once, before the locale is known. | [] |
