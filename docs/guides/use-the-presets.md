# Use the presets

> A tool's configuration extends the parts of the project's active blocks from the release, so the tool holds their rules.

## Find the parts

A preset is split into parts, one per block whose rules the tool holds, in `.droneey/constitution/presets/<scope>/<tool>/`; [the layout](../reference/presets.md#layout) shows the tree and how a part is named. A project takes:

- the scope `common`, and the scopes of its active languages;
- of each tool it runs, the parts named after its active blocks, `core`, and `self`, the tool's own settings;
- the parts in `architecture/` and `workflow/` only for the axes it follows.

[The catalog](../reference/presets.md) lists what every tool's parts configure.

## Extend them

A tool with `extends` lists the parts, the base first:

```json
{
  "extends": [
    "./.droneey/constitution/presets/common/biome/self.jsonc",
    "./.droneey/constitution/presets/typescript/biome/typescript.jsonc",
    "./.droneey/constitution/presets/typescript/biome/self.jsonc",
    "./.droneey/constitution/presets/typescript/biome/core.jsonc",
    "./.droneey/constitution/presets/typescript/biome/react-dom.jsonc",
    "./.droneey/constitution/presets/typescript/biome/architecture/core.jsonc"
  ]
}
```

The other tools take them their own way:

| Tool | How it takes the parts |
|---|---|
| knip, Stryker, syncpack | the configuration imports the parts and joins their lists |
| Ruff | `extend` takes one file, so each part extends the one before |
| ty | `--config-file` takes one part |
| python-check | `extend` of `[tool.python-check]` lists the parts |
| a tool with neither | starts from [a template](../reference/templates.md) of `templates/project/<scope>/<block>/` |

## Keep your own settings beside them

A project adds what is its own after the parts: its paths, its entry points, a rule the presets leave off. A setting a part holds is not loosened to make the check pass (`check-never-weakened-to-pass`); [an override](override-a-rule.md) lowers the rule itself, with its reason.

## Know which setting holds which rule

Beside the parts of each axis, `bindings.yaml` names the settings that hold each rule; [Bindings](../reference/presets.md#bindings) shows its form. A rule never names its tool; only the bindings do.
