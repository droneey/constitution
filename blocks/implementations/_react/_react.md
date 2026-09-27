---
id: _react
kind: implementation
summary: React as every renderer shares it — hooks, effects, state, boundaries.
chapters: []
requires: [ui, typescript]
extends: null
abstract: true
checks: []
owns: [React, JSX, React Compiler, .hooks, .context]
governs: ["**/*.tsx", "**/*.hooks.ts", "**/*.context.ts"]
status: stable
---

# React

> React as every renderer shares it; a project lists the renderer's block, which brings this one. **Vocabulary:** folder `hooks`, a set of reusable hooks; suffixes `.hooks`, a file of hooks beside its component or operation, and `.context`, a compound's or provider's context.

## Compiler and API

## react-compiler-on · MUST
The build runs the React Compiler over every component and hook.
**Why:** the Compiler memoises what is safe to memoise, so the code stays plain and fast without hand-written memoisation.
**Check:** review
**Tags:** performance

## no-manual-memoisation · MUST
No `useMemo`, `useCallback` or `memo`: the Compiler memoises. A function an effect needs but must not re-run on is wrapped in `useEffectEvent`. An exception needs profiler evidence, stated in its suppression.
**Why:** hand-written memoisation is noise the Compiler makes useless, and it hides the real dependencies of the code.
**Check:** tool — lint
**Tags:** performance
**Implements:** `suppression-states-its-reason`

## modern-react-api-only · MUST
Only the modern API: `use(Context)`, `<Context value>`, `ref` as a prop, ref callbacks that return their cleanup, actions. The legacy form of each is forbidden.
**Why:** two forms of one thing double what a reader must know, and the legacy forms are on their way out.
**Check:** tool — lint
**Tags:** architecture

## function-components-only · MUST
Components are functions, composed, never inherited; a class only for an error boundary.
**Why:** hooks work only in functions, and inheritance between components couples them to each other's internals.
**Check:** tool — lint
**Tags:** architecture
**Implements:** `inheritance-only-for-errors-and-framework-points`

## hooks-at-top-level · MUST
Hooks are called only at the top level of a component or a hook, never in a condition, a loop or a callback.
**Why:** React matches hooks by their call order; a hook called conditionally reads another hook's state.
**Check:** tool — lint
**Tags:** errors

## no-component-defined-inside-component · MUST
No component is defined inside another component.
**Why:** a component defined inside another is a new type on every render, so its state resets each time.
**Check:** tool — lint
**Tags:** errors, performance

## list-keys-from-identity · SHOULD
A list's key comes from the item's identity, never its index.
**Why:** an index key moves state to the wrong item when the list is reordered or filtered.
**Check:** tool — lint
**Tags:** errors

## State and effects

## derived-state-computed-in-render · MUST
A value that can be derived is computed during render, never stored in state and synchronised by an effect.
**Why:** a derived copy in state is a second home of the same fact, one render behind the first.
**Check:** review
**Tags:** data, performance
**Implements:** `one-home-per-datum`

## effects-only-for-external-systems · MUST
An effect synchronises with a system outside React — never state from state, never the response to an event. An external store is read with `useSyncExternalStore`.
**Why:** an effect that sets state from state renders twice and races; an event's response belongs in its handler.
**Check:** review
**Tags:** architecture

## effect-cleans-up-and-cancels · MUST
Every effect cleans up what it starts — subscriptions, listeners, sockets, timers — and aborts its asynchronous work, so only the latest response lands.
**Why:** an effect that does not clean up leaks, and a late response overwrites a newer one.
**Check:** review
**Tags:** errors, performance
**Implements:** `io-has-timeout-and-cancellation`

## component-effects-in-its-hooks-file · MUST
A component file calls no effect hook: its effects live in hooks in `<name>.hooks.ts` beside it, and input or output goes only through binding units.
**Why:** a component then reads as its markup, and its effects are found and tested in one place.
**Check:** tool — lint
**Tags:** architecture
**Implements:** `side-effects-at-the-edges`

## async-ui-state-through-actions · SHOULD
Pending, optimistic and transition state go through `useActionState`, `useTransition` and `useOptimistic`; optimism local to a component is `useOptimistic`, optimism over cached data is the data library's.
**Why:** React then knows what is pending, and keeps the interface responsive while it is.
**Check:** review
**Tags:** ux

## fast-source-batched-in-its-hook · SHOULD
A hook that folds a fast source schedules its state once per animation frame; an expensive render driven by input reads `useDeferredValue`.
**Why:** a render per event starves the frame; batched or deferred, the interface stays responsive.
**Check:** review
**Tags:** performance
**Implements:** `fast-source-updates-once-per-frame`

## Composition

## compound-parts-share-the-root-context · SHOULD
A compound's parts are attached to its root with a typed `Object.assign`, and the root shares its state — the choreography of animated regions included — through `<name>.context.ts`.
**Why:** the parts read what the root decides, without props threaded through the consumer's markup.
**Check:** review
**Tags:** architecture
**Implements:** `compound-root-owns-choreography`

## slot-and-container-children-typed · SHOULD
A slot that keeps control of its element takes a `ReactElement`; a container takes `ReactNode`; a render-prop slot is `(children, …data) => ReactElement`.
**Why:** the type says what the caller may pass, and the compiler refuses the rest.
**Check:** review
**Tags:** types
**Implements:** `navigation-passed-by-slot`

## error-boundary-catches-render-errors · SHOULD
A screen's error boundary catches the render errors below it, reports once, and shows the screen's error state. A failure a binding unit returns as a state is rendered, not thrown.
**Why:** a thrown render error then costs one screen, and an expected failure is shown where it belongs.
**Check:** review
**Tags:** errors, ux
**Implements:** `error-boundary-per-screen`
