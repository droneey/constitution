# Keys

> Governs the cache's keys and the declaration of each read.

## General

### key-factory-in-cache-utils → cache-key-built-by-its-features-factory · MUST

Each feature's key factory, and each composition module's, lives in its `app/utils/cache.utils.ts`.

| Why | Tags |
|---|---|
| every binding unit of the feature takes its keys from one known module, so a read and the invalidation that refreshes it build the same key. | [] |

### keys-only-from-the-key-factory → cache-key-built-by-its-features-factory · MUST

Outside the key factory's `cache.utils.ts`, no key array is written inline — as a `queryKey`, or to the query client's `getQueryData`, `getQueryState` or `setQueryData`; every key comes from the factory.

| Why | Tags |
|---|---|
| these are the places a key is written, and an inline one drifts from the factory's, so an invalidation misses it. | [data] |

### read-declared-once-as-query-options → cache-key-built-by-its-features-factory · MUST

Each read is declared once as `queryOptions`, beside the key factory in `cache.utils.ts`, taking its use case as input; the hook, the loader and the guard all use it. A `queryFn` is written only there, inside the read's `queryOptions`.

| Why | Tags |
|---|---|
| one declaration keeps the key, the function and the options of a read the same wherever it runs. | [] |
