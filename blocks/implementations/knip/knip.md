---
id: knip
summary: Finds unused files, dependencies and exports.
requires: [typescript]
extends: null
abstract: false
checks: [unused]
dictionary: [knip, knip.config.ts]
governs: ["knip.config.ts"]
---

# knip

> Finds what nothing uses. knip has no `extends`: `knip.config.ts` joins the parts of the constitution's release archive — `presets/knip/foundation/self.mjs`, `foundation/core.mjs` and, on the architecture axis, `architecture/core.mjs` — adding the project's own ignores. The entries name every entry file and every folder's `index.ts`, and knip's plugins add the configuration files, so an export a module offers through its `index.ts` is never reported, while an unused file, dependency, export, type or enum member is. Production mode leaves out `__tests__/` and `tests/`, and the binaries of tools installed outside the package manager count as no missing dependency. Unused locals and parameters are held by the compiler, unreachable branches by the coverage gate: no dead code is held by the three together.
