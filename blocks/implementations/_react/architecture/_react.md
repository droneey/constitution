# React

## State and effects

## derived-state-computed-in-render · MUST
A value that can be derived is computed during render, never stored in state and synchronised by an effect.
**Why:** a derived copy in state is a second home of the same fact, one render behind the first.
**Check:** review
**Tags:** data, performance
**Implements:** `one-home-per-datum`

## component-effects-in-its-hooks-file · MUST
A component file calls no effect hook: its effects live in hooks in `<name>.hooks.ts` beside it, and input or output goes only through binding units.
**Why:** a component then reads as its markup, and its effects are found and tested in one place.
**Check:** tool — lint
**Implements:** `side-effects-at-the-edges`

## Composition

## slot-and-container-children-typed · SHOULD
A slot that keeps control of its element takes a `ReactElement`; a container takes `ReactNode`; a render-prop slot is `(children, …data) => ReactElement`.
**Why:** the type says what the caller may pass, and the compiler refuses the rest.
**Check:** review
**Tags:** types
**Implements:** `navigation-passed-by-slot`
