---
id: dependency-cruiser
summary: Holds the import rules between layers, modules and packages.
requires: [typescript]
extends: null
abstract: false
checks: [imports]
languages: [typescript]
roles: []
dictionary: [dependency-cruiser, depcruise, .dependency-cruiser.mjs]
governs: [".dependency-cruiser.mjs"]
---

# dependency-cruiser

> Holds the imports. `.dependency-cruiser.mjs` extends the parts of the constitution's release archive in `presets/typescript/dependency-cruiser/`, the scope of the language it reads: on foundation the language's own part, `typescript.mjs`, tools as development dependencies; its own options, with no deprecated, undeclared or unresolvable import (`self.mjs`); core's rules — no cycle, test code unreachable from production (`core.mjs`) — and a part for each active block with one, such as the runtime's own modules or the stories; on the architecture axis `core.mjs`, core's import rules, and a part named after each other active block that has import rules of its own. The parts come before the architecture `core.mjs`: dependency-cruiser keeps the first rule of a name, and a part may restate one of core's rules for its library. Together they hold every active rule whose check is `tool/imports`. It runs over `src`, specs included, in the check. What it cannot see — a global such as `Date.now()` used in code that must stay free of effects — is reviewed.
