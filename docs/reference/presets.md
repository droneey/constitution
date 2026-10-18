# Presets

> What each tool's presets configure, scope by scope.

[Use the presets](../guides/use-the-presets.md) shows how a project extends them. A project takes the common scope and the scope of each of its languages.

## Layout

A preset is split into parts, one per block whose rules the tool holds. They sit in [`presets/`](../../packages/constitution/presets), which the release links as `.droneey/constitution/presets/`:

```text
presets/
└── <scope>/                common, or a language
    └── <tool>/             the tool's block
        ├── <block>.<ext>   a part of the base
        ├── bindings.yaml
        ├── architecture/
        │   ├── <block>.<ext>
        │   └── bindings.yaml
        └── workflow/
            ├── <block>.<ext>
            └── bindings.yaml
```

A part is named after the block its settings need: `noTailwindArbitraryValue` sits in `tailwind`, though the rule it holds is `ui`'s. `core` holds the settings of core's rules, and `self` the tool's own settings.

## Common

| Tool | Axes | Configures |
|---|---|---|
| Biome | base | the formatter — 100 columns, two spaces, LF — the recommended rules, and the ignore file of git |
| lefthook | workflow | the commit hooks: branch names, commit messages, the formatters on staged files, the secrets scan |
| betterleaks | base | the files the secrets scan skips |
| osv-scanner | base | the licences a dependency may carry |
| hadolint | base | Dockerfiles, failing at the `style` level |
| dclint | base | Compose files: key order, images pinned by tag, quoted ports |

## CSS

| Tool | Axes | Configures |
|---|---|---|
| Biome | base | single quotes, and the lint rules of CSS, the browser, the design system and Tailwind, with GritQL rules of the Constitution's own |

## TypeScript

| Tool | Axes | Configures |
|---|---|---|
| Biome | base, architecture | the lint rules of every active library, with GritQL rules of the Constitution's own; on the architecture axis, where effects and libraries may be reached |
| dependency-cruiser | base, architecture | no cycles, no test code or dev tools in production; on the architecture axis, the direction of the layers and where each library may be imported |
| knip | base, architecture, workflow | the entry points and project files of unused code, and the other tools' binaries |
| Stryker | base, architecture | which files are mutated, a threshold of 100, the runner and the ignored folders |
| syncpack | base | registry-only dependencies, caret ranges, exact pins for tools, the order of a manifest's fields |
| tsc | base | the strict flags, and the libraries and types of each platform |

## Python

| Tool | Axes | Configures |
|---|---|---|
| Ruff | base | the format, and the lint families chosen by name, chained from the tool's own to FastAPI's |
| ty | base | every rule an error, and no `# type: ignore` |
| python-check | architecture | which layers of the tree may import each library |
| complexipy | base | the cognitive complexity of a function, at most 15 |
| deptry | base | every unused, missing or misplaced dependency |
| vulture | base | dead code in `src`, from a confidence of 60 |

## Shell

| Tool | Axes | Configures |
|---|---|---|
| shellcheck | base | the optional checks it turns on by name |

## YAML

| Tool | Axes | Configures |
|---|---|---|
| yamllint | base | two-space indents, 120 columns, no flow collections, `true` and `false` only |
| yamlfmt | base | block-style lists |

## Markdown

| Tool | Axes | Configures |
|---|---|---|
| rumdl | base | one title, no skipped levels, a language on every code block, alt text, links that resolve |

## Bindings

Beside the parts of each axis, `bindings.yaml` names, for each part, the rules it holds and the settings that hold them:

```yaml
nestjs:
  nestjs-keeps-decorator-metadata: [emitDecoratorMetadata, experimentalDecorators]
```

It is the only place a rule meets its tool; a block never names one.
