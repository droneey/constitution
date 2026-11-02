# Effects

> Governs a script's effects: its temporary files and its diagnostics.

## Calls and resources

### temporary-file-removed-by-an-exit-trap → resource-released-on-every-path · MUST

A temporary file or folder is made by `mktemp` and removed by a `trap` on `EXIT`. In POSIX sh the trap is also set on `HUP`, `INT` and `TERM`, by a handler that exits, and it is set right after the file is made.

| Why |
|---|
| a fixed name collides with other runs and can be planted by another user, and only the trap removes the file when the script fails or is interrupted. |

## Records and configuration

### script-diagnostics-on-standard-error → diagnostics-written-through-a-logger · MUST

A script writes its diagnostics and errors to standard error, through one function of its own. Only its output goes to standard output.

| Why |
|---|
| a caller pipes standard output into the next command, where a diagnostic mixed into it becomes data. |
