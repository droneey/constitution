# Lingui

## messages-through-lingui-macros → messages-take-named-parameters
Text goes through Lingui's macros — `t`, `<Trans>`, `msg`, `<Plural>` — as ICU messages; never concatenation or an id built by hand.

| Why | Check | Tags |
|---|---|---|
| the macros extract every message into the catalog, with its parameters and plural forms intact. | review | [] |

## catalogs-compiled-strictly-in-check → check-only-checks
The check compiles the catalogs in strict mode, failing on a missing translation, and writes no tracked file. Extraction is the author's step, and its change to the catalog is committed with the code.

| Why | Check | Tags |
|---|---|---|
| a missing translation fails before release, and the check never rewrites what it checks. | review | [] |

## module-level-messages-are-descriptors → messages-through-lingui-macros · MUST
Text defined outside a render — an option list, an enum's labels — is a `msg` descriptor rendered later.

| Why | Check | Tags |
|---|---|---|
| a module's text is evaluated once, before the locale is known. | review | [] |
