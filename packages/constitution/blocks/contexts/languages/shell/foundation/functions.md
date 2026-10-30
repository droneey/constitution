# Functions

> Governs a function in a script: the main function that holds its logic.

## General

### script-logic-in-a-main-function · SHOULD

A script that defines functions runs its logic in a function `main`, called on its last line as `main "$@"`.

| Why |
|---|
| the shell then reads the whole file before it runs a line, so a script cut short in transfer or edited while it runs never executes half of itself. |
