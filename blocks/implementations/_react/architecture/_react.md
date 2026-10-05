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

## Composition

## compound-parts-reached-through-the-root → compound-over-prop-regions
A compound's surface exports only its root and its prop types; a part is reached as `Root.Part`, never imported on its own.

| Why | Check | Tags |
|---|---|---|
| a part used without its root loses the root's context, and the dot names the compound it belongs to. | review | [] |

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
