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

## compound-parts-reached-through-the-root → compound-over-prop-regions
A compound's surface exports only its root and its prop types; a part is reached as `Root.Part`, never imported on its own.

| Why | Check | Tags |
|---|---|---|
| a part used without its root loses the root's context, and the dot names the compound it belongs to. | review | [] |

## Failure

## error-boundary-catches-render-errors → error-boundary-per-screen
A screen's error boundary is a React error boundary, which catches what is thrown while its tree renders.

| Why | Check | Tags |
|---|---|---|
| React unmounts the whole tree below the boundary that catches, so a boundary per screen costs one screen. | review | [errors, ux] |
