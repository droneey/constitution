# Consistency

> Governs concurrent changes, the invariants the store holds and the processes that span transactions.

## Concurrent changes

### stored-record-carries-its-version → write-on-read-data-is-conditional · MUST

A stored record that a write decides on from a read made in an earlier request carries a version the store checks on that write, and a write made on an older version is refused as a conflict.

| Why |
|---|
| the version is how the store tells a write made on a stale read from a fresh one. |

## Invariants

### invariant-also-held-by-the-store · SHOULD

An invariant the store can express — a uniqueness, a reference, a required value, a range — is also declared in the store as a constraint, beside the check in the code.

| Why |
|---|
| two concurrent writes each pass the code's check, and only the store sees them together. |

## Processes

### multi-step-process-compensated · SHOULD

A business process that spans several programs or transactions keeps its state in a store, runs each step in a transaction of its own, and runs a compensating step for each step already done when a later one fails for good or a wait for a reply passes its deadline.

| Why |
|---|
| no transaction spans programs, so a process that fails midway is either undone step by step or left half done, and one whose state lives only in memory is lost with the process that held it. |
