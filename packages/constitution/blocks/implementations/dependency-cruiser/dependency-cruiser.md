---
id: dependency-cruiser
summary: Holds the import rules between layers, modules and packages.
requires: [typescript]
extends: null
abstract: false
languages: [typescript]
dictionary: [dependency-cruiser, depcruise, .dependency-cruiser.mjs]
governs: [".dependency-cruiser.mjs"]
---

# dependency-cruiser

> Holds the imports.

`.dependency-cruiser.mjs` extends the parts of the Constitution's release archive in `presets/typescript/dependency-cruiser/`, the scope of the language it reads: in `foundation/` the language's own part, `typescript.mjs`, tools as development dependencies; its own options, with no deprecated, undeclared or unresolvable import (`self.mjs`); core's rules — no cycle, test code unreachable from production (`core.mjs`) — and a part for each active block with one, `<block>.mjs`, such as the runtime's own modules; in `architecture/` `core.mjs`, core's import rules, and a part named after each other active block that has import rules of its own, `<block>.mjs`. Each block's part comes before the parts of the blocks above it — the language's `typescript.mjs` and core's on each axis: dependency-cruiser keeps the first rule of a name, and a part may restate a rule of a block above it for its own package. The first part with `allowed` rules sets `allowedSeverity` for all, so each such part sets it to `error`. Together they hold every active rule on imports. It holds the imports of `src`, specs included. What it cannot see — a global such as `Date.now()` used in code that must stay free of effects — a lint holds, or a reviewer.

On the architecture axis, core's import rules are its layer matrix with its surfaces: the direction of every import, the independence of features and of composition modules, the homes of the root and of the adapters, the ports a binding unit never imports, the surfaces a module is reached through and the homes each block gives its packages. Where a file lives and how a folder is laid out no import shows, and a reviewer holds them. A global such as `Date.now()` used under `domain/` is held by a lint, or a reviewer, and a reviewer holds a vendor's package that a lib wraps and a unit outside the edge reaches through it.
