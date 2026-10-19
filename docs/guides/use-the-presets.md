# Use the presets

> A tool's configuration takes the parts of the project's active blocks from the release, so the tool holds their rules.

## Let ratify wire them

[`/constitution:ratify`](../reference/skills.md#constitutionratify) writes each tool's configuration from its [template](../reference/templates.md), with the parts the project's blocks take, shows the diff and writes it after your yes. To see what it computes, run the plugin's script from the project:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/hooks/wiring.sh"
```

It prints each file the active blocks give, with the units it serves, the template of each block's fragment and the parts each tool's fragment takes, in order:

```text
biome.json for ., packages/kit
  biome .droneey/constitution/templates/project/common/biome/biome.json
    .droneey/constitution/presets/common/biome/foundation/self.jsonc
  biome .droneey/constitution/templates/project/typescript/biome/biome.json
    .droneey/constitution/presets/typescript/biome/foundation/self.jsonc
    .droneey/constitution/presets/typescript/biome/foundation/core.jsonc
    .droneey/constitution/presets/typescript/biome/foundation/typescript.jsonc
```

[The parts a project takes](../reference/presets.md#the-parts-a-project-takes) gives the rule it follows.

## Write them by hand

A configuration names every part its unit takes by its path in the release, the way its template shows: in its `extends`, its imports, its chain's marker line, a copy's two marker lines or the command that runs it. A part's path is relative to the file; Biome reaches the parts through a committed `.droneey/constitution` link in the package's own folder to the root's.

```json
{
  "extends": [
    "./.droneey/constitution/presets/common/biome/foundation/self.jsonc",
    "./.droneey/constitution/presets/typescript/biome/foundation/self.jsonc",
    "./.droneey/constitution/presets/typescript/biome/foundation/core.jsonc",
    "./.droneey/constitution/presets/typescript/biome/foundation/typescript.jsonc",
    "./.droneey/constitution/presets/typescript/biome/foundation/react-dom.jsonc",
    "./.droneey/constitution/presets/typescript/biome/architecture/core.jsonc"
  ]
}
```

When a block is added or dropped, or a release adds a part, the next session warns of each configuration that lacks a part or keeps one it no longer takes, and of a copy that no longer repeats its part: run `/constitution:ratify` again.

## Keep your own settings beside them

A project adds what is its own after the parts: its paths, its entry points, a rule the presets leave off. A setting a part holds is not loosened to make the check pass (`check-never-weakened-to-pass`); [an override](override-a-rule.md) lowers the rule itself, with its reason.

## Know which setting holds which rule

Beside the parts of each axis, `bindings.yaml` names the settings that hold each rule; [Bindings](../reference/presets.md#bindings) shows its form. A rule never names its tool; only the bindings do.
