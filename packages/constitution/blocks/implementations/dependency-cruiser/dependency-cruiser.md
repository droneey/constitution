---
id: dependency-cruiser
summary: Holds the import rules between layers, modules and packages.
requires: [typescript]
extends: null
abstract: false
languages: [typescript]
governs: [".dependency-cruiser.mjs"]
---

# dependency-cruiser

> Holds the imports.

**`dependency-cruiser`**, run as **`depcruise`**, would merge two rules of one name through its `extends`, so **`.dependency-cruiser.mjs`** joins the parts, each list after the lists before it, and builds the rule against development dependencies in production over the development files every part names, and those the project's own settings name: a build tool the package never ships, say. Its `allowedSeverity` is `warn` unless set, so each part with `allowed` rules sets it to `error`. Together the parts hold every active rule on imports, those of `src` and of its specs. What it cannot see — a global such as `Date.now()` used in code that must stay free of effects — a lint holds, or a reviewer.

On the architecture axis, core's import rules are its layer matrix with its surfaces: the direction of every import, the independence of features and of composition modules, the homes of the root and of the adapters, the ports a binding unit never imports, the surfaces a module is reached through and the homes each block gives its packages. Where a file lives and how a folder is laid out no import shows, and a reviewer holds them. A global such as `Date.now()` used under `domain/` is held by a lint, or a reviewer, and a reviewer holds a vendor's package that a lib wraps and a unit outside the edge reaches through it.
