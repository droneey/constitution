# Override a rule

> When a rule does not fit the project, lower it in `constitution.yaml`, with a reason, instead of breaking it silently.

## Run `/constitution:amend`

```text
/constitution:amend data-view-shows-every-state
```

1. Check that the rule it shows is the one you mean.
2. Answer its questions, one at a time: the lower level, your reason in one line, an end date if the override is temporary, and the scope, the repository or one member of its workspace. [Skills](../reference/skills.md#constitutionamend) has what each answer takes.
3. Check the exact lines it shows under `overrides:` of the unit's `constitution.yaml`, in [its form](../reference/constitution-yaml.md#overrides), and agree; it writes them only then.

## What an override does

- It lowers the one rule it names, core's included: a `MUST` to `SHOULD`, or a `MUST` or a `SHOULD` to `MAY`, which then only advises. The rules that tighten it keep their own levels.
- A lowered rule's settings leave the tools' configurations at the next `constitution presets apply`, and the gate, `constitution rules` and the reviewer give the rule at its new level, with the override's reason.
- After `until`, it lowers nothing, and the digest warns until it is renewed or removed.
- It lowers the rule only in the unit whose `constitution.yaml` lists it: the root's for the files no member holds, a member's for the files in its folder.
- A rule of the project's own pack is not overridden: its block is edited instead.

## Remove it

The change that ends the reason removes the override: run `/constitution:amend` with the rule's slug again, or delete the entry.
