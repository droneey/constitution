# Hooks

> Governs the hooks that call a component's effect hooks, and a binding unit.

## Vocabulary

**`hooks/`**{#reusable-hook} holds a set of reusable hooks.

A file ending in **`.hooks`**{#hooks-file} holds hooks: those that call a component's effect hooks, or a binding unit built on hooks.

## Component effects

### component-effects-in-its-hooks-file · SHOULD

No component file calls an effect hook. A component's effect hooks are called by hooks in its hooks file beside it, `<name>.hooks.ts`.

| Why |
|---|
| effect hooks called in a component file tie its markup to what they synchronise with, so the component cannot be read as its markup or rendered in a spec without them running. |

## Binding units

### binding-unit-is-a-hook → unit-handed-its-dependencies · MUST

Every operation's binding unit is a hook that takes its use case from the providers' context and calls it. Exempt: a binding unit for a caller React does not render, such as a loader or a guard.

| Why |
|---|
| a binding unit that builds or imports its use case cannot be handed another in a spec, and one that is no hook cannot follow the operation's state as React renders; a hook takes the use case the composition root put in the providers' context. |

### plain-binding-unit-only-for-a-caller-outside-react · SHOULD

No binding unit is written as a plain `<op>.ts` before a caller outside React needs it. Such a caller is one React does not render, such as a loader or a guard.

| Why |
|---|
| a plain binding unit no caller uses is a second way into the operation that nobody runs, so it drifts from the hook every screen calls and is read and kept for nothing. |
