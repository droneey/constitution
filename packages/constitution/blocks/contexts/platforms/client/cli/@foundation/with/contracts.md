# Contracts

> Governs how the output a script reads of a command-line program changes: its `--json` output and its exit codes.

## Changes

### script-facing-output-changed-in-steps → format-changed-in-steps · MUST

Every `--json` output loses a field only after a release that marked it deprecated. It renames or retypes one only after a release that offered the new form beside the old.

| Why |
|---|
| scripts read the fields of that output, and a field that disappears or changes its type sends them wrong at the next upgrade without a word — the expand–contract pattern. |

### exit-code-never-reused → format-changed-in-steps · MUST

Every exit code keeps the meaning it was released with, never reused for another outcome.

| Why |
|---|
| scripts branch on the exit codes, and a code that changes its meaning sends them down the wrong branch at the next upgrade without a word. |
