# Tools

> Governs the tools that hold the rules, and their findings.

## Vocabulary

A **tool** is a program the project runs on its code rather than ships, such as a package manager, a linter, a formatter, a test runner or a type checker; an action a language model calls, an agent's or a function the program hands its own model to call, is none.

A tool **holds** a rule when it fails on a violation of it.

A **hook** is a program a tool calls on an event of its work, such as before a change is recorded or before an agent calls a program.

A **suppression** is a mark in the code or a tool's settings that silences findings of a rule the tool keeps in force, such as a lint rule's, a type error, a mutant or a failure ignored on purpose; turning one of the tool's rules off for everything it reads is a setting, never a suppression.

The **indent**{#indent} is two spaces, a default.

The project's **check** is its one run of every tool that holds a rule.

## General

### rule-held-by-a-tool-where-one-can · MUST

Every rule a tool can hold is held by one. Prose carries what no tool can express. Exempt: a rule whose check would cost more to keep than the review it replaces, a choice a decision records.

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

Every tool's configuration holds what its blocks compute. In the repository's root or a package, it holds every setting the presets of the active blocks give for the rules in force there, on the axes followed there, computed from the blocks.

| Why |
|---|
| a configuration kept by hand drifts from the blocks: a setting goes missing, loosens or outlives its rule unseen. |

### own-settings-sit-in-the-computed-files · MUST

Every own setting of the root or of a package sits in the same files as the settings its blocks compute.

| Why |
|---|
| own settings kept in files of their own make a tool read two configurations that disagree unseen, and each copy of a shared file goes its own way. |

### own-settings-only-add · MUST

The project's own settings only add to what its blocks compute. They never remove a setting that holds a rule or make it reach less than the rule asks, and they add a further setting, a stricter value, or a value that names the same thing for the project, such as its own path to the same program or its own files a rule's term covers or leaves out. Exempt: an override that lowers a rule, which may remove the setting that holds it or narrow its reach.

| Why |
|---|
| an own setting that loosens a computed one weakens a rule unseen, where an override would have named the rule and its reason. |

### configuration-names-its-schema · SHOULD

Wherever its reader accepts one, every configuration file names the schema its reader publishes.

| Why |
|---|
| a key misspelt or misplaced in a file with no schema is ignored by its tool in silence, and the setting it was meant to hold never applies. |

### linter-rules-turned-on-by-name · MUST

Every linter's rules are turned on by their names, families or codes. A switch that turns on every rule it has is never used.

| Why |
|---|
| a switch for every rule turns on each rule a new release adds, so an update fails the check with rules nobody chose, some of which contradict others. |

## Formatting

### one-formatter-per-language · MUST

Each language has at most one formatter, and no second formatter touches the language's files. Exempt: a language no active block of the project gives a formatter.

| Why |
|---|
| two formatters undo each other's work at every run, and each change then shows lines its author never touched. |

### formatter-covers-every-file-of-its-language · MUST

Every formatter formats every file of its language. Exempt: a language no active block of the project gives a formatter.

| Why |
|---|
| a file the formatter of its language leaves out is argued over in every review. |

### formatters-share-one-indent · MUST

Wherever neither its language nor the formatter fixes the indent, every formatter indents by the indent the vocabulary names.

| Why |
|---|
| formatters that disagree on the indent make files of one repository read differently in every editor, terminal and side-by-side diff. |

### formatters-share-one-width · MUST

Wherever it breaks lines at all, every formatter breaks a line longer than 100 columns.

| Why |
|---|
| formatters that disagree on the width make one repository read differently in every editor and diff, and at 80 columns a typed signature or a call of a few arguments breaks into several lines that 100 keeps on one. |

## Findings

### suppression-silences-one-finding · MUST

Every suppression silences one finding. It sits on the finding's line or the line above it, or names the finding, and it names the one rule it silences wherever the tool can.

| Why |
|---|
| a narrow suppression can be judged where it stands, and a broad one silences rules and lines nobody meant to. |

### suppression-states-its-reason · MUST

Every suppression states its reason.

| Why |
|---|
| a suppression without its reason leaves the next reader unable to tell whether the exception still holds, so it is kept for ever or removed blind. |

### unused-suppression-removed · MUST

Every suppression is removed once it silences nothing.

| Why |
|---|
| a suppression left after its finding is gone silences the next finding on its line unseen. |

### check-never-weakened-to-pass · MUST

Every failing check is made to pass by fixing its cause. It is never made to pass by changing a test's expectation, skipping or deleting a test, adding a suppression, special-casing a test input or loosening a tool's configuration. Exempt: such a change that is the task, that another rule asks for or permits, or that a person consented to by name.

| Why |
|---|
| a check made green by weakening it reports a success that did not happen. |
