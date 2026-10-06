---
id: knip
summary: Finds unused files, dependencies and exports.
requires: [typescript]
extends: null
abstract: false
checks: [unused]
languages: [typescript]
roles: []
dictionary: [knip, knip.config.ts]
governs: ["knip.config.ts"]
---

# knip

> Finds what nothing uses. knip has no `extends`: `knip.config.ts` joins the parts of the constitution's release archive in `presets/typescript/knip/`, the scope of the language it reads — `core.mjs` on foundation and on the architecture axis, a part named after each active tool the package manager does not install, `<tool>.mjs`, a part for each active block that names entry files of its own, `<block>.mjs`, and one for each active block whose configuration names a test runner or plugin that knip takes for a package, ignoring that package — adding the project's own ignores. The entries name every entry file and every folder's `index.ts`, and knip's plugins add the configuration files, so an export a module offers through its `index.ts` is never reported, while an unused file, dependency, export, type or enum member is. Production mode leaves out `__tests__/` and `tests/`, and the binary of each tool with a `<tool>.mjs` part counts as no missing dependency. In a repository of several units, each unit's parts sit under `workspaces['<path>']`, the unit's path from the root, and the root's under `workspaces['.']`: once `workspaces` is set, knip ignores the top-level `entry` and `project`, the root's included. Unused locals and parameters are held by the compiler, unreachable branches by the coverage gate: no dead code is held by the three together.
