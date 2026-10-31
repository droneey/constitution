# Keys

> Governs the cache's key factory and the declaration of each read.

## General

### read-declared-once-as-query-options → cache-key-built-by-its-features-factory · MUST

Each feature's key factory, and each composition module's, lives in `presentation/bindings/shared/cache.ts`, beside the binding units that use it, and each read is declared there once as `queryOptions`, taking its use case as input; the hook, the loader and the guard all use it. A `queryFn` is written only there, inside the read's `queryOptions`.

| Why |
|---|
| every binding unit takes its keys from one known module, so a read and the invalidation that refreshes it build the same key, and one declaration keeps the key, the function and the options of a read the same wherever it runs. |
