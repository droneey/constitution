# Linter

> Governs the lint: the names it refuses, the project's own GritQL rules and its suppressions.

## Names

### biome-refuses-empty-names → name-never-an-empty-word · SHOULD

Biome's lint refuses a variable named only by an empty word. A variable, a parameter or a destructured field named only `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff` or `thing` fails the lint wherever its setting reaches; one that holds a value whose shape the code does not know takes a suppression that says so.

| Why |
|---|
| a naming rule left to review is broken as soon as nobody reads for it; a list of words is what a lint can hold of the rule, and the suppression is where the code says it knows nothing of the value's shape. |

### biome-refuses-empty-verbs → name-never-an-empty-word · SHOULD

Biome's lint refuses a function named only by an empty verb. A function or a method named only `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set` or `update` fails the lint; a proxy's handler passes, and another name an implemented contract imposes takes a suppression that says so.

| Why |
|---|
| a naming rule left to review is broken as soon as nobody reads for it, and a list of verbs is what a lint can hold of it; the lint sees a proxy's handler, and no other contract that imposes a name, which a suppression names instead. |

## Rules

### project-grit-rules-scoped · SHOULD

A project's own GritQL rule lives in `biome/<name>.grit`, scoped by an override. It is a file ending in **`.grit`**{#grit-rule}, and stays there until the Constitution's presets carry it.

| Why |
|---|
| a project's rule kept anywhere else is not found where its rules are looked for, and moves to the preset in pieces; one left unscoped runs on files it was not written for. |

## Suppressions

### biome-suppression-names-one-rule-and-reason → suppression-silences-one-finding · MUST

A Biome suppression names one rule and its reason. It is `// biome-ignore lint/<group>/<rule>: <reason>`, the reason after the colon, never a group alone, `biome-ignore-all` or `biome-ignore-start`.

| Why |
|---|
| Biome also takes a group, a whole file and a range, which silence findings nobody meant to; only this form names one rule on one line. |
