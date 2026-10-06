---
id: ls-lint
summary: Holds the names of files and folders in every language.
requires: []
extends: null
abstract: false
languages: []
dictionary: [ls-lint, .ls-lint.yaml]
governs: [".ls-lint.yaml"]
---

# ls-lint

> Holds names in any language. Its configuration is made of the parts of the constitution's release archive — those of `presets/common/ls-lint/`, for any language: `self.yaml`, `core.yaml` and the part of each tool whose folder it skips, `<tool>.yaml`, at the root and in a unit up to four folders down, since a pattern of `**` walks the whole tree once for each part; and those of the scope of each active language, such as `presets/typescript/ls-lint/`: the language's own part, `typescript.yaml`, on foundation the names of a framework, `<block>.yaml`, and on the architecture axis core's tree, `core.yaml`, and each other block's, `<block>.yaml` — then the project's own `.ls-lint.yaml`. Together they hold every active rule on names: kebab-case for every folder and file, upper-case documents excepted; `__tests__/` and `tests/` admitting only the spec, fake and fixtures forms; YAML files only as `.yaml`. What it cannot see — a spec named after the wrong file — is reviewed.
