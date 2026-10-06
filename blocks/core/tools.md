# Tools

> Governs the tools that hold the rules, and their findings.

## Tools

### rule-held-by-a-tool-where-one-can · MUST
A rule a tool can hold is held by one, configured to fail on a violation; prose carries only what no tool can express.

| Why | Tags |
|---|---|
| a rule held only by prose is broken as soon as nobody reads it, and a tool never tires. | [] |

### one-formatter-per-language · MUST
One formatter formats the files of each language, and a file it would change fails the check.

| Why | Tags |
|---|---|
| a formatter ends every argument about layout, and two formatters undo each other’s work. | [] |

### one-check-runs-every-tool · MUST
One check runs every tool that holds a rule and fails on any violation.

| Why | Tags |
|---|---|
| nobody has to know which tools exist, and everyone who runs the check is held to the same rules. | [] |

## Findings

### suppression-states-its-reason · MUST
A suppression — of a lint rule, a type error, a mutant, a deliberately ignored failure — carries its reason beside it.

| Why | Tags |
|---|---|
| the next reader must know whether the exception still holds, and a bare suppression cannot be judged. | [] |

### suppression-silences-one-finding · MUST
A suppression silences one finding: it sits on the finding’s line or the line above, or names the finding, and names the one rule it silences wherever the tool can name one; a suppression that silences nothing is removed.

| Why | Tags |
|---|---|
| a narrow suppression can be judged where it stands; a broad one silences rules and lines nobody meant to. | [] |

### check-never-weakened-to-pass · MUST
A failing check is made to pass by fixing its cause, never by changing a test’s expectation, skipping a test, adding a suppression, special-casing a test input or loosening a tool’s configuration, unless that change is the task or a person agreed to it by name.

| Why | Tags |
|---|---|
| a check made green by weakening it reports a success that did not happen. | [testing] |
