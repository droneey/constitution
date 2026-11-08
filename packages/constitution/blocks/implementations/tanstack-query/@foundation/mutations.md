# Mutations

> Governs a write through the cache: when it ends, and an optimistic write's rollback, the reads it cancels and the items it shows.

## General

### write-in-flight-until-its-refresh-lands · SHOULD

Every write's `onSettled` returns the promise of the invalidation it starts, so the write stays in flight until the fresh data lands.

| Why |
|---|
| a write that ends before its refresh shows the old data for a moment, as if it had failed, and an item rendered from the write's variables disappears until the refresh brings it back. |

### optimism-in-the-mutation-lifecycle → overlapping-writes-keep-each-others-results · MUST

Every optimistic write that predicts into the cache keeps its optimism in the mutation's lifecycle. `onMutate` takes the snapshot and writes the prediction, and `onError` restores the snapshot and reapplies the mutations still in flight on the key; no step of it runs inside `mutationFn`.

| Why |
|---|
| this is the order that survives concurrent writes: a rollback that skips the reapply loses another write's change, and a prediction written inside `mutationFn` is never rolled back. |

### in-flight-reads-cancelled-by-on-mutate → in-flight-read-never-overwrites-a-pending-change · MUST

Every optimistic write that predicts into the cache cancels the key's reads in flight by `cancelQueries` in `onMutate`, before writing its prediction.

| Why |
|---|
| a read already in flight lands after the prediction and writes the server's older data over it, so the change the user made vanishes from the screen. |

### assigned-identifier-item-rendered-from-the-variables → pending-item-keeps-its-place · MUST

Every item whose identifier the server assigns renders from the mutation's variables until the write ends, never from a cache write.

| Why |
|---|
| a prediction written into the cache needs an identifier the server has not given, so the refresh after the write shows the item twice or moves it, as if it were a new one. |
