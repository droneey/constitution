# Mutations

> Governs the order of a write's callbacks through the cache.

## General

### optimism-in-the-mutation-lifecycle → overlapping-writes-keep-each-others-results · MUST

`onMutate` cancels the key's reads in flight before it writes its prediction; `onError` restores the snapshot and reapplies the mutations on the key still pending; `onSettled` invalidates once the last mutation on the key settles, and returns the invalidation's promise; an item whose identifier the server assigns renders from the pending variables instead of a cache write.

| Why |
|---|
| this is the order that survives concurrent writes: any shortcut shows data the server refused or loses another write's success, and a write that settled before its refresh would show the old data for a moment, as if it had failed. |
