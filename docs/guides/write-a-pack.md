# Write a pack

> A library with no block, or a rule only your projects share, goes into a pack: a folder of blocks shaped like the Constitution's.

## Shape it

A pack has no manifest and nothing generated:

```text
pack/                       the pack, in any folder
├── DECISIONS.md            the pack's decision log
├── blocks/
│   └── implementations/
│       └── posthog/
│           ├── posthog.md  the block's passport
│           └── @foundation/
│               └── consent.md  a chapter of its rules
└── presets/                when a tool holds its rules, laid out as the release's presets
```

`/constitution:ratify` offers a draft block in `pack/` for every library it finds without one. To start one by hand, copy `.droneey/constitution/templates/block/` into the pack as `blocks/implementations/<id>/`, rename the passport `block.md` to `<id>.md` and `@foundation/chapter.md` to the subject of its rules, and follow [the block format](../reference/block-format.md). A block of a pack may sit under a block of the Constitution's: `blocks/implementations/react/react-pdf/` is the block `react/react-pdf`, and listing it turns `react` on.

`DECISIONS.md` holds the pack's choices between real alternatives, each as `## ADR-NNNN — <title>` with its date line under it, as the Constitution's own does; a pack with none yet keeps the file with its title alone.

## List it

`constitution.yaml` names the pack's folder and lists its blocks by id, beside the Constitution's:

```yaml
implementations:
  - react/react-dom
  - posthog
packs:
  - pack
```

A pack shared between projects is linked as the release is, by mise, for example into `.droneey/constitution-extra`, and listed by that path.

## What it may do

- It tightens: a pack's rules add to the Constitution's and never replace or loosen them. A rule of a pack tightens a rule within its reach, as the Constitution's do.
- Its blocks are read like the Constitution's: the digest lists them with their pack, and the gate asks for their rules.
- Its presets join the Constitution's in every unit that lists the pack, as the release's do; a package's own pack, in `<package>/pack/`, holds the settings that package alone needs.
- A pack that is not installed, an id that is already taken and a rule that tightens an unknown rule are warnings in the digest.

## Check it

The `constitution` executable the project installs with the release is the Constitution's own check. Run it in the pack:

```bash
constitution blocks check --base .droneey/constitution
```

The pack's blocks load beside the Constitution's, so every arrow and `requires` resolves, and only the pack's findings are reported. A finding of a `MUST` rule fails; a finding of a `SHOULD` rule, or of a rule a unit that lists the pack lowers, only advises. In the project, `constitution run check` checks every pack its units list first, in a step of its own. [What the check refuses](../reference/block-format.md#what-the-check-refuses) lists every finding.
