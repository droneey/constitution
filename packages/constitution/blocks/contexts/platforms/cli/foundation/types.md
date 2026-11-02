# Types

> Governs a value of a command-line program and its type: its exit codes.

## Exit codes

### exit-codes-from-one-map → closed-name-set-declared-once · MUST

Exit codes come from one map. In it 0 is success, 1 a failure the user can act on, 2 a usage error — an unknown command, a bad flag, a missing answer — 70 the program's own defect, and 128 plus the number of the signal that ended a run — 130 an interrupt, 141 a closed pipe, 143 a termination request (`SIGTERM`); any other outcome a caller branches on takes a code of its own in the map.

| Why |
|---|
| a script decides what to do from the exit code alone, so a code that means one thing in one command and another elsewhere sends it wrong; 2 is the usage code of the shell's utilities, which the map keeps over sysexits' 64, 70 is the code sysexits gives an internal error, and 130 is how shells report an interrupt, 128 plus the signal's number — a single source of truth, and sysexits. |
