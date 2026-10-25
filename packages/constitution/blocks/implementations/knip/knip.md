---
id: knip
summary: Finds unused files, dependencies and exports.
requires: [_js-runtime]
extends: null
abstract: false
languages: [typescript]
governs: ["knip.config.ts"]
---

# knip

> Finds what nothing uses.

**`knip`** has no `extends`, so **`knip.config.ts`** joins the parts, each list after the lists of the parts before it, and the project's own ignores come last. knip's plugins add the configuration files, so an export offered through an entry is never reported, while an unused file, dependency, export, type or enum member is. Production mode leaves out `__tests__/` and `tests/`, and the binary of each tool with a part counts as no missing dependency.

The compiler holds unused locals and parameters and unreachable code, so knip and the compiler together leave no dead code unreported, save a branch no spec takes on a line the specs reach, which a coverage gate of lines and functions does not count and review holds.
