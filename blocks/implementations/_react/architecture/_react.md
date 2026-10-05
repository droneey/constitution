# React

> **Vocabulary:** folder `hooks`, a set of reusable hooks; suffixes `.hooks`, a file of hooks beside its component or operation, and `.context`, a compound's or provider's context.

## State and effects

## component-effects-in-its-hooks-file → side-effects-at-the-edges
A component file calls no effect hook: its effects live in hooks in `<name>.hooks.ts` beside it, and input or output goes only through binding units.

| Why | Check | Tags |
|---|---|---|
| a component then reads as its markup, and its effects are found and tested in one place. | review | [] |

## component-file-calls-no-effect-hook → component-effects-in-its-hooks-file
A component file calls no effect hook.

| Why | Check | Tags |
|---|---|---|
| a component then reads as its markup. | tool/lint | [] |

## Binding units

## binding-unit-is-a-hook → binding-unit-composes-its-operation
An operation's binding unit is a hook in `<op>.hooks.ts`: it takes its adapter from the providers' context and calls the use-case, or the port when there is none. A plain `<op>.ts` exists only for a caller outside React — a loader, a guard — and not before one exists.

| Why | Check | Tags |
|---|---|---|
| a hook is the framework's reactive unit; the adapter comes from the composition root, so a spec hands it another. | review | [] |

## Adapters

## adapter-is-a-factory-or-module-object → adapter-built-from-explicit-dependencies
An adapter is a factory function that takes its dependencies and returns the adapter, or a module object where it has no dependency; never a class.

| Why | Check | Tags |
|---|---|---|
| a React program is built of functions, a factory shows every dependency in its signature, and a method of a factory's object handed to a hook or a handler keeps working where a class's loses its `this`. | review | [] |

## Failure

## error-boundary-catches-render-errors → error-boundary-per-screen
A screen's error boundary is a React error boundary, which catches what is thrown while its tree renders.

| Why | Check | Tags |
|---|---|---|
| React unmounts the whole tree below the boundary that catches, so a boundary per screen costs one screen. | review | [errors, ux] |
