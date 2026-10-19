---
id: knip
summary: Finds unused files, dependencies and exports.
requires: [typescript]
extends: null
abstract: false
languages: [typescript]
dictionary: [knip, knip.config.ts]
governs: ["knip.config.ts"]
---

# knip

> Finds what nothing uses.

knip has no `extends`: `knip.config.ts` joins the parts of the Constitution's release archive in `presets/typescript/knip/`, the scope of the language it reads, and adds the project's own ignores. In `foundation/` sit `core.mjs`, whose entries name the entry file; a part named after each active tool the package manager does not install, `<tool>.mjs`; a part for each active block that names entry files of its own, `<block>.mjs`; and one for each active block whose configuration names a test runner or plugin that knip takes for a package, ignoring that package. On the architecture axis sit `architecture/core.mjs`, whose entries add the entry file of each artefact and every folder's `index.ts`, and a part for each active block whose entry files the tree moves, `architecture/<block>.mjs`; on the workflow axis, a part for each active tool of the workflow the package manager does not install, `workflow/<tool>.mjs`.

knip's plugins add the configuration files, so an export offered through an entry is never reported, while an unused file, dependency, export, type or enum member is. Production mode leaves out `__tests__/` and `tests/`, and the binary of each tool with a part counts as no missing dependency. In a repository of several units, each unit's parts sit under `workspaces['<path>']`, the unit's path from the root, and the root's under `workspaces['.']`: once `workspaces` is set, knip ignores the top-level `entry` and `project`, the root's included.

The compiler holds unused locals and parameters and unreachable code, so knip and the compiler together leave no dead code unreported, save a branch no spec takes on a line the specs reach, which a coverage gate of lines and functions does not count and review holds.
