# Hooks

> Governs the hooks that hold a component's effects and a binding unit.

**`hooks/`**{#reusable-hook} holds a set of reusable hooks.

## State and effects

### component-effects-in-its-hooks-file → effects-held-only-by-the-edge · MUST

A component file calls no effect hook: its effects live in hooks in a file ending in **`.hooks`**{#component-effects}, `<name>.hooks.ts`, beside it, and input or output goes only through binding units.

| Why |
|---|
| a component then reads as its markup, and its effects are found and tested in one place. |

## Binding units

### binding-unit-is-a-hook → binding-unit-calls-only-use-cases · MUST

An operation's binding unit is a hook in `<op>.hooks.ts`: it takes its use case from the providers' context and calls it. A plain `<op>.ts` exists only for a caller outside React — a loader, a guard — and not before one exists.

| Why |
|---|
| a hook is the framework's reactive unit; the use case comes from the composition root, so a spec hands it another. |
