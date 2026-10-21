# Cache

> Governs a read of remote data and the cache that holds it, in the program and in its specs.

## Reads

### read-superseded-for-its-key-is-cancelled → outside-call-can-be-cancelled · MUST

A read superseded by one that replaces what is cached for its key — a refetch after a write or an invalidation — is cancelled, so only the latest answer reaches the cache; any other read of the key joins the one in flight.

| Why | Tags |
|---|---|
| an answer that arrives late otherwise overwrites a newer one, and the program shows data it no longer asked for. | [data] |

## Specs

### spec-cache-fresh-without-retries → case-independent-of-order · MUST

Each spec builds a cache of its own, with its retries off, and no cache is shared between specs.

| Why | Tags |
|---|---|
| nothing leaks from one spec's cache into the next, and a failed answer fails the case at once instead of being retried. | [] |

## Requirements for implementation

### cache-shares-one-read-per-key · MUST

The cache shares one request and one entry among all the reads of one key.

| Why | Tags |
|---|---|
| without it, two readers of the same data make two requests and may get two answers. | [data, performance] |

### cache-invalidates-by-key-prefix · MUST

The cache invalidates every entry under a prefix of its key, with or without reading it again.

| Why | Tags |
|---|---|
| keys are built by prefix, and a write must be able to refresh every entry it touched. | [data] |

### cache-passes-every-failure-to-one-handler · MUST

The cache passes every failed read and write to one handler the program registers.

| Why | Tags |
|---|---|
| a failure any read or write can meet — an ended session — is then handled once, there. | [errors] |

### cache-sets-staleness-per-key · SHOULD

The cache sets per key how long an entry stays fresh and when it is read again.

| Why | Tags |
|---|---|
| data that changes every second and data that never changes need different policies. | [data, performance] |
