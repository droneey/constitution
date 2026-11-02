# Output

> Governs where commander writes its help and its errors.

## General

### commander-output-through-the-programs-writers → shared-resource-has-one-writer · MUST

commander writes only through the program's writers. The program gives them through `configureOutput` — `writeOut`, `writeErr` and `outputError` — so commander writes nothing to a standard stream itself.

| Why |
|---|
| commander writes its help and errors straight to the process's streams unless told otherwise, beside the program's own writer of the same stream, so the two interleave in an order nobody chose and a spec cannot read commander's part. |
