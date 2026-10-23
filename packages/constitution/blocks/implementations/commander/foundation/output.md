# Output

> Governs where commander writes its help and its errors, and how its help is laid out.

## General

### commander-output-through-the-programs-writers → shared-resource-has-one-writer · MUST

The program gives commander its writers through `configureOutput` — `writeOut`, `writeErr` and `outputError` — so commander writes nothing to a standard stream itself.

| Why | Tags |
|---|---|
| commander writes its help and errors straight to the process's streams unless told otherwise, beside the program's own writer of the same stream. | [] |

### commander-help-laid-out-by-the-program → help-leads-with-examples · SHOULD

`configureHelp({ formatHelp })` lays out every command's help the program's way: what the command does and its examples first, then its usage, commands and options.

| Why | Tags |
|---|---|
| commander's own layout puts the usage first and has no place for examples, while the program's layout reads like the rest of its output. | [ux] |
