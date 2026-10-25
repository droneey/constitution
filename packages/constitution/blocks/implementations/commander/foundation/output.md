# Output

> Governs where commander writes its help and its errors.

## General

### commander-output-through-the-programs-writers → shared-resource-has-one-writer · MUST

The program gives commander its writers through `configureOutput` — `writeOut`, `writeErr` and `outputError` — so commander writes nothing to a standard stream itself.

| Why | Tags |
|---|---|
| commander writes its help and errors straight to the process's streams unless told otherwise, beside the program's own writer of the same stream. | [] |
