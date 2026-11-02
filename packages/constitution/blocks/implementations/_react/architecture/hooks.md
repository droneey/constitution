# Hooks

> Governs the hooks that hold a component's effects and a binding unit.

**`hooks/`**{#reusable-hook} holds a set of reusable hooks.

## State and effects

### component-effects-in-its-hooks-file → effects-held-only-by-the-edge · MUST

A component file calls no effect hook. Its effects live in hooks in `<name>.hooks.ts` beside it — a file ending in **`.hooks`**{#hooks-file}, a file of hooks: a component's effects or a binding unit built on hooks — and input or output goes only through binding units.

| Why |
|---|
| effects written in a component file tie its markup to input and output, so the component cannot be read as its markup or rendered in a spec without its effects running. |

## Binding units

### binding-unit-is-a-hook → unit-receives-its-dependencies-by-contract · MUST

An operation's binding unit is a hook. It sits in `<op>.hooks.ts`, takes its use case from the providers' context and calls it. A plain `<op>.ts` exists only for a caller outside React — a loader, a guard — and not before one exists.

| Why |
|---|
| a binding unit that builds or imports its use case cannot be handed another in a spec, and one that is no hook cannot follow the operation's state as React renders; a hook takes the use case the composition root put in the providers' context. |
