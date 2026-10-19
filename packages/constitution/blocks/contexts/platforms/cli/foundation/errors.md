# Errors

> Governs exit codes, unknown commands, and who decides the exit.

## General

### unknown-command-never-guessed · SHOULD

An unknown command or flag is a usage error that names the closest match and never runs it; no command answers to an abbreviation of its name.

| Why | Tags |
|---|---|
| a guess run in place of what was typed may be the destructive command, and an abbreviation that works today runs another command once a new one shares its start. | [ux, errors] |

## Kinds of failure

### exit-codes-from-one-map → failure-told-apart-by-code · MUST

Exit codes come from one map: 0 success, 1 a failure the user can act on, 2 a usage error — an unknown command, a bad flag, a missing answer — 70 the program's own defect, and 128 plus the number of the signal that ended a run — 130 an interrupt, 141 a closed pipe, 143 a termination request (`SIGTERM`); any other outcome a caller branches on takes a code of its own in the map.

| Why | Tags |
|---|---|
| a script decides what to do from the exit code alone, so each code must mean one thing in every command; 2 is the usage code of the shell's utilities, 70 is the code sysexits gives an internal error, and 130 is how shells report an interrupt, 128 plus the signal's number. | [errors, ux] |

## Requirements for implementation

### command-framework-leaves-exits-to-the-handler · MUST

The program's handler decides every exit code, the framework's own failures included.

| Why | Tags |
|---|---|
| without it, the one map of exit codes cannot hold. | [errors] |
