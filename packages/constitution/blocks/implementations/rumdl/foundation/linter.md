# Linter

> Governs rumdl's rule lists and its suppressions.

## General

### rule-lists-extended-never-replaced · MUST

A project adds a rule with `extend-enable` and removes one with `extend-disable`, never with `enable` or `disable`, and a `[per-file-ignores]` of its own repeats the entries of the Constitution's distribution.

| Why |
|---|
| `disable` and `[per-file-ignores]` replace those of the Constitution's distribution and bring back what it lifted, and `enable` turns off every default rule it does not name, so rumdl stops formatting. |

### rumdl-suppression-names-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `<!-- rumdl-disable-next-line MD<nnn> -->` on the line above its finding, followed on that line by its reason in a comment of its own; never a `rumdl-disable` over a range or a `rumdl-disable-file`.

| Why |
|---|
| rumdl reads each word after the code as the name of another rule, and a range or a file silences the rule on every line it covers. |
