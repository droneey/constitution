# Lingui

### messages-through-lingui-macros → messages-take-named-parameters
Text goes through Lingui's macros — `t`, `<Trans>`, `msg`, `<Plural>` — as ICU messages; never concatenation or an id built by hand.

| Why | Tags |
|---|---|
| the macros extract every message into the catalog, with its parameters and plural forms intact. | [] |

### missing-translation-fails-the-check → user-facing-text-from-catalog
The catalogs compile in strict mode, so a missing translation fails the compile.

| Why | Tags |
|---|---|
| a missing translation then fails before release, not on a user's screen. | [] |

### module-level-messages-are-descriptors → module-level-text-holds-the-message
Text defined outside a render — an option list, an enum's labels — is a `msg` descriptor rendered later.

| Why | Tags |
|---|---|
| a module's text is evaluated once, before the locale is known. | [] |

### t-never-at-module-level → module-level-messages-are-descriptors
In a module that imports Lingui's core macros, `t`, `plural`, `select` and `selectOrdinal` are never called at the top level, outside every function.

| Why | Tags |
|---|---|
| the call runs once, when the module loads, before the locale is active, and the text never changes language. | [] |
