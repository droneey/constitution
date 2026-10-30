# Linter

> Governs the lint: the names it refuses, the project's own GritQL rules and its suppressions.

## Names

### biome-refuses-empty-names → name-never-an-empty-word · SHOULD

A variable, a parameter or a destructured field named only `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff` or `thing` fails the lint wherever its setting reaches; one that holds a value whose shape the code does not know takes a suppression that says so.

| Why |
|---|
| a list of words is what a lint can hold of the rule, and the suppression is where the code says that it knows nothing of the value's shape. |

### biome-refuses-empty-verbs → name-never-an-empty-word · SHOULD

A function or a method named only `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set` or `update` fails the lint. A proxy's handler passes, and another name an interface imposes takes a suppression that says so.

| Why |
|---|
| a list of verbs is what a lint can hold of the rule; the lint sees a proxy's handler, and no other interface that imposes a name. |

## Rules

### project-grit-rules-scoped · SHOULD

A project's own GritQL rule lives in `biome/<name>.grit`, a file ending in **`.grit`**{#grit-rule}, scoped by an override, until the Constitution's presets carry it.

| Why |
|---|
| a rule of the project's own is found in one place and moves to the preset as one file. |

## Suppressions

### biome-suppression-names-one-rule-and-reason → suppression-silences-one-finding · MUST

A suppression is `// biome-ignore lint/<group>/<rule>: <reason>`, naming one rule and stating its reason after the colon; never a group alone, `biome-ignore-all` or `biome-ignore-start`.

| Why |
|---|
| Biome also takes a group, a whole file and a range, so only this form names one rule on one line. |
