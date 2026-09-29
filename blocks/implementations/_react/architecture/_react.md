# React

> **Vocabulary:** folder `hooks`, a set of reusable hooks; suffixes `.hooks`, a file of hooks beside its component or operation, and `.context`, a compound's or provider's context.

## State and effects

## derived-state-computed-in-render → one-home-per-datum
A value that can be derived is computed during render, never stored in state and synchronised by an effect.

| Why | Check | Tags |
|---|---|---|
| a derived copy in state is a second home of the same fact, one render behind the first. | review | [performance] |

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

## slot-and-container-children-typed → navigation-passed-by-slot
A slot that keeps control of its element takes a `ReactElement`; a container takes `ReactNode`; a render-prop slot is `(children, …data) => ReactElement`.

| Why | Check | Tags |
|---|---|---|
| the type says what the caller may pass, and the compiler refuses the rest. | review | [] |
