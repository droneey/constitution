# Remote data

## stream-ends-with-terminal-event → errors-surfaced-never-swallowed
A stream that ends without its terminal event fails with a typed error.

| Why | Check | Tags |
|---|---|---|
| a stream cut short otherwise looks like a complete one, and the user sees a partial result as final. | test | [] |

## reads-cancellable-latest-wins → io-has-timeout-and-cancellation
Every read can be cancelled; a read superseded for the same key is cancelled, and only the latest answer reaches the cache.

| Why | Check | Tags |
|---|---|---|
| answers that arrive out of order otherwise show data for a question the user no longer asks. | review | [data] |

## response-body-parsed-never-cast · MUST
A response body is read as a value of no known type and parsed by its schema; no code gives the body a type without parsing it.

| Why | Check | Tags |
|---|---|---|
| a body typed without a parse trusts the server with the program's types, and the first unexpected field breaks code far away. | review | [security] |

## Requirements for implementation

What any cache of remote data, and any transport it reads through, must provide.

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

## remote-data-transport-timeout-and-cancel · MUST
The transport sets a timeout on every request, per call, and cancels a request by signal.

| Why | Check | Tags |
|---|---|---|
| without it, no request can meet the rule that it times out and can be cancelled. | review | [errors, performance] |

## remote-data-transport-typed-failures · MUST
The transport tells a status failure, a network failure and a timeout apart, for the mapper.

| Why | Check | Tags |
|---|---|---|
| each maps to a different typed error, with a different next step for the user. | review | [errors] |

## remote-data-transport-retries-only-transient · SHOULD
Retries are configurable by method and status, with backoff, and off for writes that are not idempotent.

| Why | Check | Tags |
|---|---|---|
| a retried write that is not idempotent repeats its effect. | review | [errors] |
