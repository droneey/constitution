---
id: workspace
summary: "Several units in one repository: their folders, imports and links."
requires: []
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: []
governs: ["packages/**", "shared/**", "libs/**", "package.json", "pyproject.toml"]
---

# Workspace

> A repository that holds several units, each a folder with its own manifest: an application, a library, a package others install, or the code and data two of them share. Each unit keeps its own tree; this domain places the units, sets the direction of the imports between them and links them from the working tree.
