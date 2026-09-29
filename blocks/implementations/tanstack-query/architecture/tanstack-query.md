# TanStack Query

## query-hooks-only-in-binding-units → binding-unit-composes-its-operation
A read's binding unit wraps `useQuery`, and a write's wraps `useMutation`. No screen, widget or component calls either directly.

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

## cache-is-the-only-home-of-server-data → server-owns-remote-data
Server data lives only in the cache: never copied into state, a context or a store.

| Why | Check | Tags |
|---|---|---|
| a copy stops updating when the cache does, and the screen shows the copy. | review | [] |

## unauthorized-handled-once-in-the-cache → unauthorized-handled-once-in-cache
`onError` of the `QueryCache` and the `MutationCache`, set where the providers build the client, turns an unauthorized error into session state through the auth feature's surface, once.

| Why | Check | Tags |
|---|---|---|
| an expired session is handled the same way for every read and write. | review | [] |

## components-import-no-query-library → components-dumb-widgets-smart
A component in `components/` imports no query library.

| Why | Check | Tags |
|---|---|---|
| a component that queries can no longer be shown or tested with plain data. | tool/architecture | [] |
