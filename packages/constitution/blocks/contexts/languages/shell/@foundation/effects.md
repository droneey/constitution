# Effects

> Governs a script's effects on what it shares with its host: the removal of its temporary files and its standard streams.

## Resources

### temporary-file-removed-by-an-exit-trap → resource-released-on-every-path · MUST

Every temporary file or folder a script makes is removed by a `trap` on `EXIT`, set right after it is made. In POSIX sh the trap is also set on `HUP`, `INT` and `TERM`, by a handler that exits. Exempt: a sourced file.

| Why |
|---|
| only the trap removes the file when the script fails or is interrupted, and a POSIX shell runs no `EXIT` trap on a signal it does not trap. |

### script-diagnostics-written-through-one-function → shared-resource-has-one-writer · MUST

Every diagnostic and error a script writes goes to standard error through one function of its own.

| Why |
|---|
| a caller pipes standard output into the next program, where a diagnostic mixed into it becomes data, and diagnostics written from many places drift into standard output one by one. |
