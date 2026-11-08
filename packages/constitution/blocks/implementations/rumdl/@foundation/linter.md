# Linter

> Governs rumdl's rule lists and its suppressions.

## General

### rule-lists-extended-never-replaced → own-settings-only-add · MUST

The project extends rumdl's rule lists, never replaces them. It adds a rule with `extend-enable` and removes with `extend-disable` only a rumdl rule that holds no active rule, never with `enable` or `disable`, and a `[per-file-ignores]` of its own repeats the entries its blocks compute.

| Why |
|---|
| `disable` and `[per-file-ignores]` replace those its blocks compute and bring back what they lifted, and `enable` turns off every default rule it does not name, so rumdl stops formatting. |

## Suppressions

### rumdl-disable-next-line-above-the-finding → suppression-silences-one-finding · MUST

Every rumdl suppression is a `<!-- rumdl-disable-next-line MD<nnn> -->` comment on the line above its finding. It is never a `rumdl-disable` over a range nor a `rumdl-disable-file`.

| Why |
|---|
| a range or a file silences the rule on every line it covers, findings nobody meant to allow among them. |

### rumdl-reason-in-a-comment-of-its-own → suppression-states-its-reason · MUST

Every rumdl suppression's reason stands in an HTML comment of its own, on the suppression's line or on the line above it. It is never written after the rule's code inside the suppression.

| Why |
|---|
| rumdl reads each word after the code as the name of another rule, so a reason written there is no reason to rumdl and names rules it does not know. |
