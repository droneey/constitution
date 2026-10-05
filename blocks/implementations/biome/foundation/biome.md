# Biome

## biome-formats-every-file-it-reads → code-formatted-by-one-formatter
Biome formats every TypeScript, CSS and JSON file, and the check runs `biome check`: two spaces, lines of at most 100, single quotes in TypeScript.

| Why | Check | Tags |
|---|---|---|
| one formatter for the languages Biome reads ends every argument about their layout, and the check refuses a file it would change. | tool/format | [] |

## biome-suppression-states-its-reason → suppression-states-its-reason
A `biome-ignore` comment states its reason after the colon.

| Why | Check | Tags |
|---|---|---|
| Biome refuses a suppression without a reason, so every silenced finding says why. | tool/lint | [] |

## biome-suppression-names-one-rule → suppression-silences-one-finding
A suppression names one rule, `// biome-ignore lint/<group>/<rule>`; never a group alone, `biome-ignore-all` or `biome-ignore-start`.

| Why | Check | Tags |
|---|---|---|
| Biome also takes a group, a whole file and a range, so only this form names one rule on one line. | review | [] |

## biome-warnings-fail-the-check → check-passes-before-hand-back
Warnings fail the check: every rule is an error, or the check passes `--error-on-warnings`.

| Why | Check | Tags |
|---|---|---|
| a warning that passes the check is ignored, and the rule it stands for is not held. | review | [] |

## biome-check-never-writes → check-only-checks
The check runs `biome check` without `--write`; `lint:fix` writes.

| Why | Check | Tags |
|---|---|---|
| a check that fixes what it checks passes code nobody reviewed. | review | [] |

## biome-refuses-empty-names → no-empty-names
A variable, a parameter or a destructured field named only `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff` or `thing` fails the lint wherever its part reaches.

| Why | Check | Tags |
|---|---|---|
| a list of words is what a lint can hold of the rule; whether a word is truly generic stays the reviewer's. | tool/lint | [] |

## biome-refuses-empty-verbs → no-empty-verbs
A function or a method named only `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set` or `update` fails the lint. A proxy's handler passes, and another name an interface imposes takes a suppression that says so.

| Why | Check | Tags |
|---|---|---|
| a list of verbs is what a lint can hold of the rule; the lint sees a proxy's handler, and no other interface that imposes a name. | tool/lint | [] |

## project-grit-rules-scoped · SHOULD
A project's own GritQL rule lives in `biome/<name>.grit`, scoped by an override, until the constitution's presets carry it.

| Why | Check | Tags |
|---|---|---|
| a rule of the project's own is found in one place and moves to the preset as one file. | review | [] |
