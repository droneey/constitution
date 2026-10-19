# Presets

> What each tool's presets configure, scope by scope.

[Use the presets](../guides/use-the-presets.md) shows how a project extends them. A project takes the common scope and the scope of each of its languages.

## Layout

A preset is split into parts, one per block whose rules the tool holds. They sit in [`presets/`](../../packages/constitution/presets), which the release links as `.droneey/constitution/presets/`:

```text
presets/
└── <scope>/                common, or a language
    └── <tool>/             the tool's block
        ├── foundation/     the parts every project takes
        │   ├── <block>.<ext>
        │   ├── self.<ext>  the tool's own settings
        │   ├── plugins/
        │   └── bindings.yaml
        ├── architecture/   the same form, for that axis
        └── workflow/
```

A part is named after the block its settings need: `noTailwindArbitraryValue` sits in `tailwind`, though the rule it holds is `ui`'s. `core` holds the settings of core's rules, and `self` the tool's own settings.

## Common

| Tool | Axes | Configures |
|---|---|---|
| Biome | foundation | the formatter — 100 columns, two spaces, LF — the recommended rules, and the ignore file of git |
| lefthook | workflow | the commit hooks: branch names, commit messages, the formatters on staged files, the secrets scan |
| betterleaks | foundation | the files the secrets scan skips |
| osv-scanner | foundation | the licences a dependency may carry |
| hadolint | foundation | Dockerfiles, failing at the `style` level |
| dclint | foundation | Compose files: key order, images pinned by tag, quoted ports |

## CSS

| Tool | Axes | Configures |
|---|---|---|
| Biome | foundation | single quotes, and the lint rules of CSS, the browser, the design system and Tailwind, with GritQL rules of the Constitution's own |

## TypeScript

| Tool | Axes | Configures |
|---|---|---|
| Biome | foundation, architecture | the lint rules of every active library, with GritQL rules of the Constitution's own; on the architecture axis, where effects and libraries may be reached |
| dependency-cruiser | foundation, architecture | no cycles, no test code or dev tools in production; on the architecture axis, the direction of the layers and where each library may be imported |
| knip | foundation, architecture, workflow | the entry points and project files of unused code, and the other tools' binaries |
| Stryker | foundation, architecture | which files are mutated, a threshold of 100, the runner and the ignored folders |
| syncpack | foundation | registry-only dependencies, caret ranges, exact pins for tools, the order of a manifest's fields |
| tsc | foundation | the strict flags, and the libraries and types of each platform |

## Python

| Tool | Axes | Configures |
|---|---|---|
| Ruff | foundation | the format, and the lint families chosen by name, chained from the tool's own to FastAPI's |
| ty | foundation | every rule an error, and no `# type: ignore` |
| python-check | architecture | which layers of the tree may import each library |
| complexipy | foundation | the cognitive complexity of a function, at most 15 |
| deptry | foundation | every unused, missing or misplaced dependency |
| vulture | foundation | dead code in `src`, from a confidence of 60 |

## Shell

| Tool | Axes | Configures |
|---|---|---|
| shellcheck | foundation | the optional checks it turns on by name |

## YAML

| Tool | Axes | Configures |
|---|---|---|
| yamllint | foundation | two-space indents, 120 columns, no flow collections, `true` and `false` only |
| yamlfmt | foundation | block-style lists |

## Markdown

| Tool | Axes | Configures |
|---|---|---|
| rumdl | foundation | one title, no skipped levels, a language on every code block, alt text, links that resolve |

## Bindings

Beside the parts of each axis, `bindings.yaml` names, for each part, the rules it holds and the settings that hold them:

```yaml
nestjs:
  nestjs-keeps-decorator-metadata: [emitDecoratorMetadata, experimentalDecorators]
```

It is the only place a rule meets its tool; a block never names one.
