# Mutations

> Governs a write through the cache: the order of its callbacks, its optimism and its invalidation.

## General

### optimism-in-the-mutation-lifecycle → overlapping-writes-keep-each-others-results · MUST

An optimistic write follows the mutation's lifecycle in its order, and builds its prediction only through the program's own checks. `onMutate` cancels the key's reads in flight before it writes its prediction, built by the program's own checked constructors and derived values; `onError` restores the snapshot and reapplies the mutations on the key still pending; `onSettled` invalidates once the last mutation on the key settles; an item whose identifier the server assigns renders from the pending variables instead of a cache write. No step of it runs inside `mutationFn`.

| Why |
|---|
| this is the order that survives concurrent writes: any shortcut shows data the server refused or loses another write's success, and a prediction built by hand holds a value the program's checked constructor would refuse. |

### invalidation-in-on-settled · SHOULD

A write invalidates its keys in `onSettled` and returns the invalidation's promise. It stays pending until the fresh data lands.

| Why |
|---|
| `onSettled` runs after success and failure alike, so the cache is refreshed either way, and a write that settled before its refresh would show the old data for a moment, as if it had failed. |
