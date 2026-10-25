# Effects

> Governs temporary files and a script's diagnostics.

## Calls and resources

### temporary-file-removed-by-an-exit-trap → resource-released-on-every-path · MUST

A temporary file or folder is made by `mktemp` and removed by a `trap` on `EXIT` — in POSIX sh also on `HUP`, `INT` and `TERM`, by a handler that exits — set right after it is made.

| Why |
|---|
| a fixed name collides with other runs and can be planted by another user, and only the trap removes the file when the script fails or is interrupted. |

## Records and configuration

### script-diagnostics-on-standard-error → diagnostics-written-through-a-logger · MUST

A script writes its diagnostics and errors through one function of its own that prints to standard error — `log() { printf '%s\n' "$*" >&2; }` — and only its output to standard output.

| Why |
|---|
| a caller pipes standard output into the next command, where a diagnostic mixed into it becomes data. |
