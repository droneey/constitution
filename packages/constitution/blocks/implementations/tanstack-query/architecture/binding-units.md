# Binding units

> Governs where the query library is imported and called, and what its functions call.

## General

### query-hooks-only-in-binding-units → binding-unit-composes-its-operation · MUST

`useQuery`, `useSuspenseQuery` and `useMutation` are called only in binding units; no screen, widget or component calls any of them directly.

| Why |
|---|
| each operation is then bound once, with its keys, its use case and its union by status, and no component can reach the cache around them. |

### query-functions-call-the-handed-use-case → binding-unit-composes-its-operation · MUST

`queryFn` and `mutationFn` call the use case the providers hand to the binding unit.

| Why |
|---|
| the use case knows nothing of the cache: what the operation does is the domain's and the same for every interface, how its result lives in the interface is the query library's, and the use case stays the composition root's choice, so a spec hands in another. |

### query-library-home-is-the-binding-units → layer-imports-dependencies-by-its-role · MUST

The query library's home is the binding units of `app/` and `composition/`, and `root/`, which builds the client; no other folder imports it — no component, adapter or code of `libs/`.

| Why |
|---|
| caching belongs to the binding units: a component that queries can no longer be shown with plain data, an adapter that caches holds a second cache, and a library that caches takes the application's data into code every program shares. |
