# Mutations

> Governs a write through the cache: its optimism and its invalidation.

## General

### optimism-in-the-mutation-lifecycle → overlapping-writes-keep-each-others-results · MUST

Optimism lives in the mutation's lifecycle: `onMutate` cancels the reads in flight and writes values built by the program's own factories; `onError` restores the snapshot and reapplies the mutations on the key still pending; `onSettled` invalidates once the last mutation on the key settles; an item whose identifier the server assigns renders from the pending variables instead of a cache write. Never inside `mutationFn`.

| Why |
|---|
| this is the order that survives concurrent writes; any shortcut shows data the server refused, or loses another write's success. |

### invalidation-in-on-settled · SHOULD

A write invalidates its keys in `onSettled` and returns the invalidation's promise, so it stays pending until the fresh data lands.

| Why |
|---|
| `onSettled` runs after success and failure alike, so the cache is refreshed either way, and a write that settled before its refresh would show the old data for a moment, as if it had failed. |
