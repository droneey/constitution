# Changes

> Governs changes to the JSON output and the exit codes.

## Scope

### script-facing-output-changed-in-steps → format-changed-in-steps · MUST

A command's JSON output gains fields freely, and loses, renames or retypes one only after a release that offered its replacement beside it; an exit code keeps the meaning it was released with, and a new outcome takes a code of its own.

| Why |
|---|
| scripts branch on the JSON and the exit codes, and a field that disappears or a code that changes its meaning sends them wrong at the next upgrade without a word. |
