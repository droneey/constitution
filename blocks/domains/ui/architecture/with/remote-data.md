# User interface with remote data

> Screens that show and change data another system owns: how an operation is bound to the screen and how the application is composed.

## providers-compose-the-ui-application → one-explicit-composition-root
The providers are the application's composition root: they build the configuration and the cache client, build each adapter from its dependencies, and hand the adapters to the binding units. No adapter imports a provider or a shared instance.

| Why | Check | Tags |
|---|---|---|
| every concrete choice is made in one place, and a test hands the same binding unit a different adapter without touching it. | review | [] |

## binding-unit-composes-its-operation · SHOULD
A binding unit binds one operation: it takes its adapter from the providers and calls the use-case, or the port when there is none. A plain function form of it is added only when a caller that is not reactive appears.

| Why | Check | Tags |
|---|---|---|
| each operation is bound once, and the screen never learns which adapter serves it. | review | [] |

## binding-units-import-no-adapter-or-ui → binding-unit-composes-its-operation
A binding unit imports neither an adapter, which the providers hand it, nor anything of `ui/`, which imports it.

| Why | Check | Tags |
|---|---|---|
| an adapter imported directly bypasses the composition root, so a spec cannot replace it; a binding unit that imports UI points against the layers. | tool/imports | [] |

## command-invalidates-in-its-binding-unit · SHOULD
After a write, invalidation happens in the command's binding unit, through the feature's key factory.

| Why | Check | Tags |
|---|---|---|
| the one place that knows what a write changed is the one that says what to reload. | review | [data] |
