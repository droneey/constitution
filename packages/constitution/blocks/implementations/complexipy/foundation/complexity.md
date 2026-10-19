# Complexity

> Governs how a function's cognitive complexity is held.

## General

### complexity-snapshot-never-kept → function-within-its-limits · MUST

No snapshot of the functions over the limit is kept to let them pass.

| Why | Tags |
|---|---|
| a snapshot lets every function already over the limit stay as it is, so the check fails only on new ones. | [] |
