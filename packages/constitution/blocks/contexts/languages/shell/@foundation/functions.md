# Functions

> Governs a function in a script: the main function that holds its logic.

## General

### script-logic-in-a-main-function · MUST

Every script that defines functions runs its logic in a function `main`, which it calls on its last line as `main "$@"`. Exempt: a sourced file.

| Why |
|---|
| a shell runs a script as it reads it, so one truncated in transfer or edited while it runs executes half of itself, while `main` called on the last line runs only once the whole file is read. |
