# Cache

> Governs a read of remote data and the cache that holds it, in the program and in its specs.

## Reads

### read-superseded-for-its-key-is-cancelled → outside-call-can-be-cancelled · MUST

A read superseded for its key is cancelled, so only the latest answer reaches the cache. A read is superseded by one that replaces what is cached for its key — a refetch after a write or an invalidation —, and any other read of the key joins the one in flight.

| Why |
|---|
| an answer that arrives late otherwise overwrites a newer one, and the program shows data it no longer asked for. |

## Specs

### spec-cache-fresh-without-retries → case-independent-of-order · MUST

Each spec builds a cache of its own, with its retries off. No cache is shared between specs.

| Why |
|---|
| a cache shared between specs carries one spec's data into the next, which then passes or fails by their order, and a failed answer retried hides behind the retries' delay instead of failing the case at once. |

## Requirements for implementation

### cache-shares-one-read-per-key · MUST

The cache shares one request and one entry among all the reads of one key.

| Why |
|---|
| without it, two readers of the same data make two requests and may get two answers. |

### cache-invalidates-a-writes-entries-in-one-call · MUST

The cache invalidates a write's entries in one call. They are every entry the write affects, named by a key prefix, a tag or a type, and the call reads them again or not.

| Why |
|---|
| a cache that invalidates only one exact key at a time makes each write list every entry it touched, and an entry it misses stays stale. |

### cache-passes-every-failure-to-one-handler · MUST

The cache passes every failed read and write to one handler the program registers.

| Why |
|---|
| a failure any read or write can meet (an ended session) is otherwise handled at each read and write, each its own way, and missed at one of them. |

### cache-sets-staleness-per-key · SHOULD

The cache sets per key how long an entry stays fresh and when it is read again.

| Why |
|---|
| one policy for every key either fetches again data that never changes or shows stale data that changes every second. |
