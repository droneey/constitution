---
id: dependency-cruiser
summary: Holds the import rules between layers, modules and packages.
requires: [typescript]
extends: null
abstract: false
checks: [architecture]
dictionary: [dependency-cruiser, depcruise, .dependency-cruiser.mjs]
governs: [".dependency-cruiser.mjs"]
---

# dependency-cruiser

> Holds the imports. `.dependency-cruiser.mjs` extends the parts of the constitution's release archive: `presets/dependency-cruiser/foundation/self.mjs` — its options, and no deprecated, undeclared or unresolvable import — `typescript.mjs`, tools as development dependencies, and the runtime's part, its own modules; on the architecture axis `architecture/core.mjs`, core's import rules with no cycle and test code unreachable from production, and a part named after each other active block that has import rules of its own, such as `storybook.mjs`. The parts come before `architecture/core.mjs`: dependency-cruiser keeps the first rule of a name, and a part may restate one of core's rules for its library, as `tanstack-router.mjs` adds the router's files to the callers of the root. Together they hold every active rule whose check is `tool — architecture`. It runs over `src`, specs included, in the check. What it cannot see — a global such as `Date.now()` used in code that must stay free of effects — is reviewed.
