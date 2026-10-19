# Application

> Governs what the interface's root builds: its providers, its stores and its last boundary.

## Wiring

### providers-compose-the-ui-application → composition-root-wires-everything · MUST

The providers are the application's composition root: they build the configuration, each adapter from its dependencies, each use case from its ports and each stateful client — a cache, a store — and hand the use cases and the clients to the binding units. No adapter imports a provider or a shared instance.

| Why | Tags |
|---|---|
| every concrete choice is made in one place, and a test hands the same binding unit a different use case or cache without touching it. | [] |

### client-concerns-in-root-built-stores → fact-has-one-source · MUST

The few global concerns the client owns — the theme, the notices — live in small stores the root builds, one store per concern.

| Why | Tags |
|---|---|
| a concern every screen shares has one home, which the root hands to the screens and a spec replaces; a store built anywhere else is a second copy of it. | [] |

## Failures

### root-boundary-catches-the-rest → last-resort-handler-one-per-entry · MUST

One handler in `root/` catches every failure that no screen contains itself.

| Why | Tags |
|---|---|
| a failure no screen contained still reaches a handler that shows it, and the user is never left with a blank page. | [errors] |
