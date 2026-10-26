# Wire the tools

> The executable writes into each tool's configuration the settings of the project's active blocks, so the tool holds their rules.

## Apply the presets

Run the `constitution` executable the project installs with the release, from the repository root:

```bash
constitution presets apply
```

It writes every file of every unit from [the presets](../reference/presets.md) of the release and of the unit's packs, keeps the settings each file holds of its own and its comments, and records what it wrote in each unit's `constitution.lock`. It never installs a tool or formats a file: the commit hooks format. [`/constitution:ratify`](../reference/skills.md#constitutionratify) runs it after writing `constitution.yaml`, shows the diff and the findings.

To see what it would write, file by file, with the entries that write into each:

```bash
constitution presets plan
```

When a block is added or dropped, a rule lowered, or the release changed, the next session reports each setting a file lacks or keeps after its rule is gone: run `constitution presets apply` again. A pull request whose locks conflict runs it again too.

## Keep your own settings beside them

A project adds what is its own in the same files: its paths, its entry points, a rule the presets leave off. A setting it needs in a form the presets give — a folder of its own build tools among the development files, say — goes into the unit's own pack, `pack/presets/<reader>/…`, listed under `packs:`, so the executable writes it and the check reads it. A setting that holds a rule is never loosened to make the check pass (`check-never-weakened-to-pass`), and the check reports one that is; [an override](override-a-rule.md) lowers the rule itself, with its reason, and the next `apply` takes its settings out.

## Know which setting holds which rule

Every entry of a preset file is keyed by the rule it holds, so `constitution presets plan` names, under each file, the rule behind each entry. A rule never names its tool; only the presets do.
