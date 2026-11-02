# Tools

> Governs the tools that hold the rules, and their findings.

## General

### rule-held-by-a-tool-where-one-can · MUST

A rule a tool can hold is held by one. It is held wherever the tool's gain repays its cost, by a tool configured to fail on a violation; prose carries what no tool can express and what a check would cost more to keep than the review it replaces, which a decision records.

| Why |
|---|
| a rule held only by prose is broken as soon as nobody reads it, and a tool never tires. |

### one-check-runs-every-tool · MUST

One check runs every tool that holds a rule and fails on any violation.

| Why |
|---|
| a tool run apart from the one check is skipped by whoever does not know it exists, so a change passes for one person and fails for the next. |

## Configuration

### configuration-holds-what-its-blocks-compute · MUST

A tool's configuration holds what its blocks compute. In the repository's root or a package, it holds every setting that the presets of the release, and of the packs the repository's root or the package follows, give for the rules in force there, on the axes the repository's root or the package follows, as `constitution` computes and writes them, and a lock beside it records what was written; the own settings of the repository's root or of the package sit in the same files.

| Why |
|---|
| a configuration kept by hand drifts from the blocks: a setting goes missing, loosens or outlives its rule unseen, and each copy of a shared file goes its own way. |

### own-settings-only-add · MUST

The own settings of the repository's root or a package only add to what its blocks compute. Written in its files or in its own pack, they add a further setting, a stricter value, or a value that names the same thing for the repository's root or the package, such as its own path to the same program or its own files a rule's term covers or leaves out. A setting that holds a rule is removed, or made to reach less than the rule asks, only by an override that lowers that rule.

| Why |
|---|
| an own setting that loosens one its blocks compute weakens a rule there unseen, where an override would have named the rule and its reason. |

### configuration-names-its-schema · SHOULD

A configuration file names its schema. It names the schema its reader publishes, in the form its language gives it, wherever the reader accepts it.

| Why |
|---|
| a key misspelt or misplaced in a file with no schema is ignored by its tool in silence, and the setting it was meant to hold never applies. |

### linter-rules-turned-on-by-name · MUST

A linter's rules are turned on by their names, families or codes, never by a switch that turns on every rule it has.

| Why |
|---|
| a switch for every rule turns on each rule a new release adds, so an update fails the check with rules nobody chose, some of which contradict others. |

## Formatting

### one-formatter-per-language · MUST

Each language has at most one formatter, and it formats every file of the language. A file it would change fails the check, no second formatter touches the language's files, and a language no active block of the project gives a formatter is outside the rule.

| Why |
|---|
| a file the formatter of its language leaves out is argued over in every review, and two formatters undo each other’s work at every run. |

### formatters-share-one-indent-and-width · MUST

Every formatter indents by two spaces and breaks lines at 100 columns. It indents so wherever its language leaves the indent to it and the formatter lets the project choose, and breaks a line longer than 100 columns wherever it breaks lines at all.

| Why |
|---|
| formatters that disagree on indent or width make files of one repository read differently in every editor, terminal and side-by-side diff, and at 80 columns a typed signature or a call of a few arguments breaks into several lines that 100 keeps on one. |

## Findings

### suppression-silences-one-finding · MUST

A suppression silences one finding and states its reason. Whatever it silences — a lint rule, a type error, a mutant, a deliberately ignored failure —, it sits on the finding's line or the line above, or names the finding, names the one rule it silences wherever the tool can, and carries its reason beside it; one that silences nothing is removed.

| Why |
|---|
| a narrow suppression can be judged where it stands, a broad one silences rules and lines nobody meant to, and one without its reason leaves the next reader unable to tell whether the exception still holds. |

### check-never-weakened-to-pass · MUST

A failing check is made to pass by fixing its cause. It is never made to pass by changing a test’s expectation, skipping a test, adding a suppression, special-casing a test input or loosening a tool’s configuration, unless that change is the task, another rule asks for it, or a person consented to it by name.

| Why |
|---|
| a check made green by weakening it reports a success that did not happen. |
