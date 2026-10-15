# User interface with remote data

> Governs what a screen reads and writes of data another system owns.

## Results

### data-result-is-union-by-status → illegal-state-unrepresentable · MUST
What a screen or a widget calls to read or write data returns a union keyed by `status`, with only the states its operation has — or suspends to a boundary above it that shows the waiting and the failed states; the data exists only in the success state, or beside the error when a reload of data already shown fails.

| Why | Tags |
|---|---|
| a bag of flags allows combinations no state has, and data kept beside a failed reload keeps the screen showing it. | [ux] |

### unloaded-data-has-no-stand-in → absence-shown-by-the-type · MUST
No default stands in for data not yet loaded; the waiting state is shown as waiting.

| Why | Tags |
|---|---|
| an invented default hides loading and failure behind something that looks like data. | [] |

## Writes

### optimistic-change-rolled-back-on-refusal · MUST
A change shown before the remote system confirms it is made where the write can roll it back, and is rolled back alone when the system refuses it, leaving every other pending write's change shown; folding a stream's data as it arrives is no such change.

| Why | Tags |
|---|---|
| an optimistic change without a rollback leaves the screen showing what the remote system refused. | [data] |

### overlapping-writes-keep-each-others-results · MUST
Writes that overlap never undo each other's results: a read already in flight never overwrites a change shown ahead of confirmation, and an item waiting for the identifier the remote system assigns keeps its place on the screen.

| Why | Tags |
|---|---|
| a snapshot-and-restore recipe breaks as soon as two writes overlap: a late read erases the shown change, or a new item jumps once the remote system names it. | [data] |
