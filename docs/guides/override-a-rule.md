# Override a rule

> When a rule does not fit the project, lower it in `constitution.yaml`, with a reason, instead of breaking it silently.

## Run `/constitution:amend`

```text
/constitution:amend data-view-shows-every-state
```

1. Check that the rule it shows is the one you mean; the rules it names beside it are lowered too.
2. Answer its questions, one at a time: the lower level, your reason in one line, an end date if the override is temporary, and the scope, the whole repository or one unit under `packages:`. [Skills](../reference/skills.md#constitutionamend) has what each answer takes.
3. Check the exact lines it shows under `overrides:`, in [the form of `constitution.yaml`](../reference/constitution-yaml.md#overrides), and agree; it writes them only then.

## What an override does

- It lowers the one rule it names, core's included. A rule that tightens it and states its own level keeps that level; one that states none follows the override.
- After `until`, it lowers nothing, and the digest warns until it is renewed or removed.
- Under a unit of `packages:`, it lowers the rule only for the files under that path.
- A rule of the project's own pack is not overridden: its block is edited instead.

## Remove it

The change that ends the reason removes the override: run `/constitution:amend` with the rule's slug again, or delete the entry.
