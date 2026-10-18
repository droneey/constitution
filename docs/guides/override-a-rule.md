# Override a rule

> When a rule does not fit the project, lower it in `constitution.yaml`, with a reason, instead of breaking it silently.

## Run `/constitution:amend`

```text
/constitution:amend data-view-shows-every-state
```

It finds the rule, shows its block, level and statement, and asks you, one answer at a time:

1. **The level**: lower than the rule's own, `SHOULD` or `MAY`. A `MAY` rule cannot be lowered.
2. **The reason**: one line, in your words.
3. **An end date**, if the override is temporary.
4. **The scope**: the whole repository, or one unit under `packages:`.

It shows the exact lines and writes them once you agree:

```yaml
overrides:
  - rule: data-view-shows-every-state
    level: SHOULD
    reason: "The admin screens show their state in the shared toolbar"
    until: 2026-12-31
```

## What an override does

- It lowers the one rule it names, core's included. A rule that tightens it and states its own level keeps that level; one that states none follows the override.
- After `until`, it lowers nothing, and the digest warns until it is renewed or removed.
- Under a unit of `packages:`, it lowers the rule only for the files under that path.
- A rule of the project's own pack is not overridden: its block is edited instead.

## Remove it

The change that ends the reason removes the override: run `/constitution:amend` with the rule's slug again, or delete the entry. [`constitution.yaml`](../reference/constitution-yaml.md#overrides) has the exact form.
