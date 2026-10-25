# Tools

> Governs the tools that hold the rules, and their findings.

## General

### rule-held-by-a-tool-where-one-can · MUST

A rule a tool can hold, at a cost its gain repays, is held by one, configured to fail on a violation; prose carries what no tool can express and what a check would cost more to keep than the review it replaces, which a decision records.

| Why |
|---|
| a rule held only by prose is broken as soon as nobody reads it, and a tool never tires. |

### configuration-takes-every-part-of-its-blocks · MUST

A tool's configuration names, by its path, every part of the shared configuration that the blocks active in the units it serves give the tool, on the axes those units follow, and no other part. A part the tool cannot name where it reads its settings is copied between two lines that name its path.

| Why |
|---|
| the configuration then changes with the blocks: a part missing, or one kept after its block is gone, shows by its path, and a copy that drifts from its part shows by its text. |

### one-formatter-per-language · MUST

One formatter formats the files of each language, and a file it would change fails the check.

| Why |
|---|
| a formatter ends every argument about layout, and two formatters undo each other’s work. |

### formatters-share-one-indent-and-width · MUST

Every formatter indents by two spaces wherever its language leaves the indent to it, and breaks a line longer than 100 columns wherever it breaks lines at all.

| Why |
|---|
| a file then reads alike in every editor, terminal and side-by-side diff whichever formatter wrote it, and at 100 columns a typed signature or a call of a few arguments keeps to one line that 80 would break into several. |

### one-check-runs-every-tool · MUST

One check runs every tool that holds a rule and fails on any violation.

| Why |
|---|
| nobody has to know which tools exist, and everyone who runs the check is held to the same rules. |

## Findings

### suppression-states-its-reason · MUST

A suppression — of a lint rule, a type error, a mutant, a deliberately ignored failure — carries its reason beside it.

| Why |
|---|
| the next reader must know whether the exception still holds, and a bare suppression cannot be judged. |

### suppression-silences-one-finding · MUST

A suppression silences one finding: it sits on the finding’s line or the line above, or names the finding, and names the one rule it silences wherever the tool can name one; a suppression that silences nothing is removed.

| Why |
|---|
| a narrow suppression can be judged where it stands; a broad one silences rules and lines nobody meant to. |

### check-never-weakened-to-pass · MUST

A failing check is made to pass by fixing its cause, never by changing a test’s expectation, skipping a test, adding a suppression, special-casing a test input or loosening a tool’s configuration, unless that change is the task, another rule asks for it, or a person consented to it by name.

| Why |
|---|
| a check made green by weakening it reports a success that did not happen. |
