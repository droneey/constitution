---
id: dependency-cruiser
kind: implementation
summary: Holds the import rules between layers, features and packages.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: [architecture]
owns: [dependency-cruiser, depcruise, .dependency-cruiser.mjs]
governs: [".dependency-cruiser.mjs"]
status: stable
---

# dependency-cruiser

> Holds the imports. `.dependency-cruiser.mjs` extends devkit's base preset — no cycle, test code unreachable from production, tools as development dependencies, no deprecated, undeclared or unresolvable import — and the constitution's layer set: `presets/dependency-cruiser/base.mjs` of its release archive, core's matrix with its surfaces, and a part named after each other active block that has import rules of its own, such as `storybook.mjs`. Together they hold every active rule whose check is `tool — architecture`. It runs over `src`, specs included, in the check. What it cannot see — a global such as `Date.now()` used under `domain/` — is reviewed.
