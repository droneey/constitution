# Keys

> Governs the cache's key factory and the declaration of each read.

## General

### read-declared-once-as-query-options → cache-key-built-by-its-owners-factory · MUST

Each read is declared once, as `queryOptions`, beside its key factory. Each feature's key factory, and each composition module's, lives in `presentation/bindings/shared/cache.ts`, beside the binding units that use it; a read's `queryOptions` there take its use case as input, and the hook, the loader and the guard all use them. A `queryFn` is written only there, inside the read's `queryOptions`.

| Why |
|---|
| a key built in two places drifts, so an invalidation misses the read it should refresh, and a read declared twice runs with different options in the hook and in the loader — a single source of truth. |
