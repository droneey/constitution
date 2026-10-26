# Linter

> Governs the lint: the names it refuses, its severities, the project's own GritQL rules and its suppressions.

## Names

### biome-refuses-empty-names → name-never-an-empty-word · SHOULD

A variable, a parameter or a destructured field named only `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff` or `thing` fails the lint wherever its part reaches.

| Why |
|---|
| a list of words is what a lint can hold of the rule; whether a word is truly generic stays the reviewer's. |

### biome-refuses-empty-verbs → function-name-has-a-concrete-verb · SHOULD

A function or a method named only `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set` or `update` fails the lint. A proxy's handler passes, and another name an interface imposes takes a suppression that says so.

| Why |
|---|
| a list of verbs is what a lint can hold of the rule; the lint sees a proxy's handler, and no other interface that imposes a name. |

## Rules

### biome-rules-set-as-errors → rule-held-by-a-tool-where-one-can · MUST

Every rule the parts turn on is an error: no part sets a rule to `warn` or `info`, and a recommended rule whose default severity is lower is set to `error`.

| Why |
|---|
| Biome fails on errors alone, so a rule left at a warning is reported and passed, and the rule it stands for is not held. |

### project-grit-rules-scoped · SHOULD

A project's own GritQL rule lives in `biome/<name>.grit`, a file ending in **`.grit`**{#grit-rule}, scoped by an override, until the Constitution's presets carry it.

| Why |
|---|
| a rule of the project's own is found in one place and moves to the preset as one file. |

## Suppressions

### biome-suppression-states-its-reason → suppression-states-its-reason · MUST

A **`biome-ignore`** comment states its reason after the colon.

| Why |
|---|
| Biome refuses a suppression without a reason, so every silenced finding says why. |

### biome-suppression-names-one-rule → suppression-silences-one-finding · MUST

A suppression names one rule, `// biome-ignore lint/<group>/<rule>`; never a group alone, `biome-ignore-all` or `biome-ignore-start`.

| Why |
|---|
| Biome also takes a group, a whole file and a range, so only this form names one rule on one line. |
