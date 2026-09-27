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

> Holds the imports. `.dependency-cruiser.mjs` starts from the constitution's preset for the project's layer set and holds every active rule whose check is `tool — architecture`, each as a `forbidden` entry: the layer matrix of core, the interface and the package domains; no cycle; surfaces — no import past an `index.ts`, never one's own surface, no layer folder as a target; test code unreachable from production; tools as development dependencies (`not-to-dev-dep`); deprecated packages (`not-to-deprecated`); undeclared and unresolvable imports. It runs over `src`, specs included, in the check. What it cannot see — a global such as `Date.now()` used under `domain/` — is reviewed.
