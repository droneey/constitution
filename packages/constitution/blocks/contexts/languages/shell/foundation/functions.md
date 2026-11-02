# Functions

> Governs a function in a script: the main function that holds its logic.

## General

### script-logic-in-a-main-function · SHOULD

A script that defines functions runs its logic in a function `main`. It calls it on its last line as `main "$@"`.

| Why |
|---|
| a shell runs a script as it reads it, so one cut short in transfer or edited while it runs executes half of itself; called on the last line, `main` runs only once the whole file is read. |
