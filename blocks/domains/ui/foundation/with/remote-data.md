# User interface with remote data

## data-result-is-union-by-status → illegal-states-unrepresentable
What a screen or a component calls to load or write data returns a union keyed by `status`. The data exists only in the success state, or beside the error when a refetch of data already shown fails, so the screen keeps showing it; the error state carries a typed error; no default is invented — no empty list for "not loaded yet". The union has only the states its operation has, and every consumer handles every state, or the read suspends and the boundary above it handles the pending and failed states.

| Why | Check | Tags |
|---|---|---|
| a bag of flags allows combinations no state has, and an invented default hides loading and failure behind something that looks like data. | review | [ux] |

## optimistic-writes-in-rollback-lifecycle · MUST
An optimistic write happens only in the mutation's lifecycle, which can roll it back, never in the request itself. Folding streamed data as it arrives is not optimism.

| Why | Check | Tags |
|---|---|---|
| an optimistic change without a rollback leaves the screen showing what the server refused. | review | [data] |

## optimistic-lifecycle-safe-under-concurrency · MUST
Under concurrent writes, reads in flight for the touched keys are cancelled before the snapshot; a failure rolls back only its own changes; invalidation waits until the last write settles; and an item whose identifier the server assigns renders from the pending variables under a stable key.

| Why | Check | Tags |
|---|---|---|
| a snapshot-and-restore recipe breaks as soon as two writes overlap: a late read overwrites the optimistic state, or one failure erases the other's success. | test | [data] |

## input-driven-requests-debounced → fast-source-updates-once-per-frame
A request driven by typing is sent after a pause, or on the deferred value.

| Why | Check | Tags |
|---|---|---|
| a request per keystroke floods the server and shows results for words the user has not finished. | review | [ux] |

