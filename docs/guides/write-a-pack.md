# Write a pack

> A library with no block, or a rule only your projects share, goes into a pack: a folder of blocks shaped like the Constitution's.

## Shape it

A pack has no manifest and nothing generated:

```text
constitution/               the pack, in any folder
├── blocks/
│   └── implementations/
│       └── posthog/
│           ├── posthog.md  the block's passport
│           └── foundation/
│               └── consent.md  a chapter of its rules
├── presets/                when a tool holds its rules
└── templates/              when it starts a project's files
```

`/constitution:ratify` offers a draft block in `constitution/` for every library it finds without one. To start one by hand, copy `.droneey/constitution/templates/block/` into the pack as `blocks/implementations/<id>/`, rename the passport `block.md` to `<id>.md` and `foundation/chapter.md` to the subject of its rules, and follow [the block format](../reference/block-format.md).

## List it

`constitution.yaml` names the pack's folder and lists its blocks by id, beside the Constitution's:

```yaml
implementations:
  - react-dom
  - posthog
packs:
  - constitution
```

A pack shared between projects is linked as the release is, by mise, for example into `.droneey/constitution-extra`, and listed by that path.

## What it may do

- It tightens: a pack's rules add to the Constitution's and never replace or loosen them.
- Its blocks are read like the Constitution's: the digest lists them with their pack, and the reminders name their files.
- Its presets are extended by path, as the Constitution's are.
- A pack that is not installed, an id that is already taken and a rule that tightens an unknown rule are warnings in the digest.

## Check it

The `constitution` program the project installs with the release is the Constitution's own check. Run it in the pack:

```bash
constitution blocks check --base .droneey/constitution
```

The pack's blocks load beside the Constitution's, so every arrow and `requires` resolves, and only the pack's findings are reported. [What the check refuses](../reference/block-format.md#what-the-check-refuses) lists them all.
