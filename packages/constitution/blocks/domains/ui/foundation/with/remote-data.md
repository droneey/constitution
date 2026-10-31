# Remote data

> Governs a change a screen shows before the remote system confirms it, and writes that overlap.

## Writes

### optimistic-change-rolled-back-on-refusal · MUST

A change shown before the remote system confirms it is made where the write can roll it back, and is rolled back alone when the system refuses it, leaving every other pending write's change shown; folding a stream's data as it arrives is no such change.

| Why |
|---|
| an optimistic change without a rollback leaves the screen showing what the remote system refused. |

### overlapping-writes-keep-each-others-results · MUST

Writes that overlap never undo each other's results: a read already in flight never overwrites a change shown ahead of confirmation, and an item waiting for the identifier the remote system assigns keeps its place on the screen.

| Why |
|---|
| a late read then erases a change already shown, or a new item jumps when the remote system names it, and the screen shows neither what the user did nor what the system holds. |
