# Types

> Governs a value of a command-line program and its type: its exit codes.

## Vocabulary

A program's **map of exit codes** is the table of its exit codes and what each means.

## Exit codes

### exit-codes-from-one-map → closed-set-declared-as-one-enumeration · MUST

Every exit code takes its meaning from the program's one map of exit codes, the same in every subcommand.

| Why |
|---|
| a script decides what to do from the exit code alone, so a code that means one thing in one subcommand and another elsewhere sends it wrong — a single source of truth. |

### exit-code-map-keeps-the-conventional-codes · MUST

Every program's map of exit codes gives the conventional codes their conventional meanings. In it 0 is success, and every other code a failure or an outcome a caller branches on that the map names, such as a change a plan finds. Of those codes, 2 is a usage error, such as an unknown subcommand, a bad flag or a missing answer, and 128 plus the number of the signal that ended a run is that run's code, such as 130 for an interrupt, 141 for a closed pipe and 143 for a termination request.

| Why |
|---|
| shells and scripts read these codes alike across programs, so a program that ends a usage error with 64 or an interrupt with 1 is read wrong by every caller that knows them; 2 is the usage code of the shell's utilities, which the map keeps over sysexits' 64, and 130 is how shells report an interrupt, 128 plus the signal's number. |

### program-defect-told-apart-by-its-exit-code · SHOULD

Every map of exit codes gives 70 to a program defect. It gives 1 to a failure the user can act on that no other code of the map names.

| Why |
|---|
| a person or a script that gets one code for a bug and for its own mistake looks for the fault in its own input, and the bug goes unreported — sysexits. |

### branched-outcome-takes-an-exit-code-of-its-own → expected-failure-carries-a-stable-code · MUST

Every outcome a caller branches on takes an exit code of its own in the program's map.

| Why |
|---|
| a caller that cannot tell two outcomes apart by the code alone reads them from the program's messages, which change at the first rewording, or treats both alike. |
