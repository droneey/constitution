# Presets

> What each tool's presets configure.

The parts sit in [`presets/<scope>/<tool>/`](../../packages/constitution/presets); [Use the presets](../guides/use-the-presets.md) shows how a project extends them.

## TypeScript and CSS

| Tool | Scopes | Axes | Configures |
|---|---|---|---|
| Biome | common, typescript, css | base, architecture | the formatter, and the lint rules of every active library, with GritQL rules of the Constitution's own |
| dependency-cruiser | typescript | base, architecture | no cycles, no test code or dev tools in production; on the architecture axis, the direction of the layers and where each library may be imported |
| knip | typescript | base, architecture, workflow | the entry points and project files of unused code, and the other tools' binaries |
| Stryker | typescript | base, architecture | which files are mutated, a threshold of 100, the runner and the ignored folders |
| syncpack | typescript | base | registry-only dependencies, caret ranges, exact pins for tools, the order of a manifest's fields |
| tsc | typescript | base | the strict flags, and the libraries and types of each platform |

## Python

| Tool | Scopes | Axes | Configures |
|---|---|---|---|
| Ruff | python | base | the format, and the lint families chosen by name, chained from the tool's own to FastAPI's |
| ty | python | base | every rule an error, and no `# type: ignore` |
| python-check | python | architecture | which layers of the tree may import each library |
| complexipy | python | base | the cognitive complexity of a function, at most 15 |
| deptry | python | base | every unused, missing or misplaced dependency |
| vulture | python | base | dead code in `src`, from a confidence of 60 |

## Any language

| Tool | Scopes | Axes | Configures |
|---|---|---|---|
| lefthook | common | workflow | the commit hooks: branch names, commit messages, the formatters on staged files, the secrets scan |
| betterleaks | common | base | the files the secrets scan skips |
| osv-scanner | common | base | the licences a dependency may carry |
| rumdl | markdown | base | Markdown: one title, no skipped levels, a language on every code block, alt text, links that resolve |
| shellcheck | shell | base | the optional checks it turns on by name |
| yamllint | yaml | base | two-space indents, 120 columns, no flow collections, `true` and `false` only |
| yamlfmt | yaml | base | block-style lists |
| hadolint | common | base | Dockerfiles, failing at the `style` level |
| dclint | common | base | Compose files: key order, images pinned by tag, quoted ports |

## Bindings

Beside the parts of each axis, `bindings.yaml` says which setting of which part holds which rule. It is the only place a rule meets its tool; a block never names one.
