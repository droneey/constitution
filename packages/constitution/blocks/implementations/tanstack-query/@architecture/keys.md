# Keys

> Governs the cache's key factory and the declaration of each read.

## General

### key-factory-kept-in-the-shared-bindings → cache-key-built-by-its-owners-factory · MUST

Every feature's key factory, and each composition module's, lives in `cache.ts`, in the `shared/` of its presentation's `bindings/`.

| Why |
|---|
| a key factory kept beside one binding unit is copied by the next one that needs its keys, and the two copies drift, so an invalidation misses the read it should refresh. |

### read-declared-once-as-query-options → fact-has-one-source · MUST

Each read is declared once, as `queryOptions` that take its use case as input, beside its key factory. Every caller of the read uses them, and a `queryFn` is written only inside them.

| Why |
|---|
| a read declared twice runs with different options in the hook and in the loader, and a `queryFn` written elsewhere is such a second declaration — a single source of truth. |
