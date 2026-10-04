# Remote data

## reads-cancellable-latest-wins → io-has-timeout-and-cancellation
Every read can be cancelled; a read superseded for the same key is cancelled, and only the latest answer reaches the cache.

| Why | Check | Tags |
|---|---|---|
| answers that arrive out of order otherwise show data for a question the user no longer asks. | review | [data] |

## Requirements for implementation

What any cache of remote data must provide.

## remote-data-cache-dedupes-by-key · MUST
Reads with one key share one request and one entry.

| Why | Check | Tags |
|---|---|---|
| without it, two components that show the same data make two requests and may show two answers. | review | [data, performance] |

## remote-data-cache-invalidates-by-prefix · MUST
The cache invalidates by a prefix of the key, with or without a refetch.

| Why | Check | Tags |
|---|---|---|
| a key factory builds keys by prefix, and a write must be able to refresh all of them. | review | [data] |

## remote-data-cache-cancels-reads · MUST
Reads in flight for a key can be cancelled.

| Why | Check | Tags |
|---|---|---|
| without it, neither latest-wins reads nor safe optimistic writes are possible. | review | [data] |

## remote-data-cache-mutation-lifecycle · MUST
A write has lifecycle callbacks of the cache — before it runs, on failure and after it settles — with a context for rollback, and the variables of pending writes can be read.

| Why | Check | Tags |
|---|---|---|
| the optimistic lifecycle is built on these callbacks. | review | [data] |

## remote-data-cache-global-error-handler · SHOULD
One handler sees every failed read and write.

| Why | Check | Tags |
|---|---|---|
| an expired session is handled once, there. | review | [errors] |

## remote-data-cache-staleness-policy · SHOULD
Staleness and refetching are set per key.

| Why | Check | Tags |
|---|---|---|
| data that changes every second and data that never changes need different policies. | review | [data, performance] |

