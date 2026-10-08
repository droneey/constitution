# React

> **Vocabulary:** folder `hooks`, a set of reusable hooks; suffixes `.hooks`, a file of hooks beside its component or operation, and `.context`, a compound's or provider's context.

## State and effects

### component-effects-in-its-hooks-file → effects-held-only-by-the-edge · MUST
A component file calls no effect hook: its effects live in hooks in `<name>.hooks.ts` beside it, and input or output goes only through binding units.

| Why | Tags |
|---|---|
| a component then reads as its markup, and its effects are found and tested in one place. | [] |

## Binding units

### binding-unit-is-a-hook → binding-unit-composes-its-operation · SHOULD
An operation's binding unit is a hook in `<op>.hooks.ts`: it takes its adapter from the providers' context and calls the use-case, or the port when there is none. A plain `<op>.ts` exists only for a caller outside React — a loader, a guard — and not before one exists.

| Why | Tags |
|---|---|
| a hook is the framework's reactive unit; the adapter comes from the composition root, so a spec hands it another. | [] |

## Adapters

### adapter-is-a-factory-or-module-object → adapter-built-by-factory-object-or-class · SHOULD
An adapter is a factory function that takes its dependencies and returns the adapter, or a module object where it has no dependency and no state; never a class.

| Why | Tags |
|---|---|
| a React program is built of functions, a factory shows every dependency in its signature, and a method of a factory's object handed to a hook or a handler keeps working where a class's loses its `this`. | [] |

## Packages

### react-imported-by-the-ui-and-binding-units → layer-imports-dependencies-by-its-role · MUST
React's home reaches past the edge into a UI's components and widgets and the binding units of `app/` and `composition/`, which are hooks.

| Why | Tags |
|---|---|
| the view library is what a component is written in and what a binding unit is built on; every other folder below the edge stays free of it. | [] |
