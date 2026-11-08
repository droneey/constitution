# Linter

> Governs the lint: the names it refuses, the project's own GritQL rules and its suppressions.

## Vocabulary

A project's own GritQL rule is a file ending in **`.grit`**{#grit-rule}.

## Names

### biome-refuses-empty-names → name-never-an-empty-word · MUST

Every variable named only by an empty word fails Biome's lint. A variable, a parameter or a destructured field named only `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff` or `thing` fails it wherever the setting applies; one that holds a value whose shape the code does not know takes a suppression that says so.

| Why |
|---|
| a naming rule left to review is broken as soon as nobody reads for it; a list of words is what a lint can hold of the rule, and the suppression is where the code says it knows nothing of the value's shape. |

### biome-refuses-empty-verbs → name-never-an-empty-word · MUST

Every function named only by an empty verb fails Biome's lint. A function or a method named only `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set` or `update` fails it; a proxy's handler passes, and another name an implemented contract imposes takes a suppression that says so.

| Why |
|---|
| a naming rule left to review is broken as soon as nobody reads for it, and a list of verbs is what a lint can hold of it; the lint sees a proxy's handler, and no other contract that imposes a name, which a suppression names instead. |

## Rules

### project-grit-rules-scoped · SHOULD

Every GritQL rule of the project's own is scoped by its `includes` or by an override.

| Why |
|---|
| a project's rule left unscoped runs on files it was not written for. |

### project-grit-rule-kept-in-the-biome-folder · SHOULD

Every GritQL rule of the project's own lives in `biome/<name>.grit`.

| Why |
|---|
| a project's rule kept anywhere else is not found where its rules are looked for. |

## Suppressions

### biome-suppression-names-one-rule → suppression-silences-one-finding · MUST

Every Biome suppression names one rule on one line. It is `// biome-ignore lint/<group>/<rule>`, a plugin's rule being `lint/plugin/<name>` for the rule in `<name>.grit`, never a group alone, `biome-ignore-all` or `biome-ignore-start`.

| Why |
|---|
| Biome also takes a group, a whole file and a range, which silence findings nobody meant to; only this form names one rule on one line. |

### biome-suppression-gives-its-reason-after-the-colon → suppression-states-its-reason · MUST

Every Biome suppression states its reason after its colon.

| Why |
|---|
| a reason after the colon stands on the suppression's own line, where a reviewer judges the exception, while one in a comment of its own is left behind when the suppression moves or goes. |
