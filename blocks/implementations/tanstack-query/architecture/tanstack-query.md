# TanStack Query

## query-hooks-only-in-binding-units → binding-unit-composes-its-operation
`useQuery`, `useSuspenseQuery` and `useMutation` are called only in binding units; no screen, widget or component calls any of them directly.

| Why | Check | Tags |
|---|---|---|
| each operation is then bound once, with its keys, its adapter and its union by status, and no component can reach the cache around them. | review | [data] |

## query-functions-call-the-handed-adapter → binding-unit-composes-its-operation
`queryFn` and `mutationFn` call the operation with the adapter the providers hand to the binding unit.

| Why | Check | Tags |
|---|---|---|
| the adapter stays the composition root's choice, and a spec hands in another. | review | [] |

## key-factory-in-cache-utils → cache-keys-from-feature-factory
Each feature's key factory lives in its `app/utils/cache.utils.ts`.

| Why | Check | Tags |
|---|---|---|
| every binding unit of the feature takes its keys from one known module, so a read and the invalidation that refreshes it build the same key. | review | [] |

## keys-only-from-the-key-factory → cache-keys-from-feature-factory
Outside the key factory's `cache.utils.ts`, no key array is written inline — as a `queryKey`, or to the query client's `getQueryData`, `getQueryState` or `setQueryData`; every key comes from the factory.

| Why | Check | Tags |
|---|---|---|
| these are the places a key is written, and an inline one drifts from the factory's, so an invalidation misses it. | tool/lint | [data] |

## query-library-home-is-the-binding-units → packages-imported-by-folder-role
The query library's home is the binding units of `app/` and `composition/`, and `root/`, which builds the client; no other folder imports it — no component, adapter or code of `libs/`.

| Why | Check | Tags |
|---|---|---|
| caching belongs to the binding units: a component that queries can no longer be shown with plain data, an adapter that caches holds a second cache, and a library that caches takes the application's data into code every program shares. | tool/imports | [] |

## read-declared-once-as-query-options → cache-keys-from-feature-factory
Each read is declared once as `queryOptions`, beside the key factory in `cache.utils.ts`, taking its adapter as input; the hook, the loader and the guard all use it.

| Why | Check | Tags |
|---|---|---|
| one declaration keeps the key, the function and the options of a read the same wherever it runs. | review | [] |

## query-function-only-in-cache-utils → read-declared-once-as-query-options
A `queryFn` is written only in `cache.utils.ts`, inside the read's `queryOptions`.

| Why | Check | Tags |
|---|---|---|
| an inline `queryFn` is a second declaration of the read, and its options drift from the loader's. | tool/lint | [] |

## query-client-built-by-the-root → stateful-clients-built-by-the-root
`new QueryClient` is written only in `root/`, in the program's entry files and in specs.

| Why | Check | Tags |
|---|---|---|
| the library's own examples build the client at a module's top level, where it is shared by every request on the server and every spec. | tool/lint | [] |

## unauthorized-handled-once-in-the-cache → unauthorized-acted-on-once-by-the-cache
`onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client, is the one place that acts on an unauthorized error.

| Why | Check | Tags |
|---|---|---|
| every read and write then ends in the same handler, and no query or mutation acts on the error on its own. | review | [] |
