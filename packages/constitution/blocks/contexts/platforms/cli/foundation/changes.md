# Changes

> Governs changes to the JSON output and the exit codes.

## Scope

### json-output-changed-only-by-adding-fields → format-changed-in-steps · MUST

A command's JSON output changes by gaining fields; a field is removed, renamed or retyped only after a release that offered its replacement beside it.

| Why | Tags |
|---|---|
| scripts read the JSON as a contract, and a field that disappears breaks every one of them silently at the next upgrade. | [data] |

### exit-code-keeps-its-meaning → format-changed-in-steps · MUST

An exit code keeps the meaning it was released with; a new outcome gets a code of its own, and no code is reused for another.

| Why | Tags |
|---|---|
| a script that calls the command branches on its codes, and a code that changes its meaning sends it down the wrong branch without a word. | [errors] |
