# React

## Compiler and API

## react-compiler-on · MUST
The build runs the React Compiler over every component and hook, except one the Compiler refuses, whose `'use no memo'` states why.

| Why | Check | Tags |
|---|---|---|
| the Compiler memoises what is safe to memoise, so the code stays plain and fast without hand-written memoisation. | review | [performance] |

## render-is-pure · MUST
A component or hook returns the same output for the same props, state and context: it changes nothing that existed before the render and reads no ref during it. The root renders inside `StrictMode`.

| Why | Check | Tags |
|---|---|---|
| the Compiler, concurrent rendering and `StrictMode` run a render more than once; one that is not pure behaves differently each time. | review | [] |

## props-never-assigned → render-is-pure
A component never assigns to its props.

| Why | Check | Tags |
|---|---|---|
| props belong to the caller; this is the change to existing data the linter can see. | tool/lint | [] |

## no-manual-memoisation → suppression-states-its-reason
No `useMemo`, `useCallback` or `memo`: the Compiler memoises. A function an effect needs but must not re-run on is wrapped in `useEffectEvent`. An exception — a value whose identity an effect or a library the Compiler skips depends on, or profiler evidence — is stated in its suppression.

| Why | Check | Tags |
|---|---|---|
| hand-written memoisation is noise the Compiler makes useless, and it hides the real dependencies of the code. | tool/lint | [performance] |

## modern-react-api-only · MUST
Only the modern API: `use(Context)`, `<Context value>`, `ref` as a prop, ref callbacks that return their cleanup, actions. The legacy form of each is forbidden.

| Why | Check | Tags |
|---|---|---|
| two forms of one thing double what a reader must know, and the legacy forms are on their way out. | review | [] |

## legacy-react-api-refused → modern-react-api-only
No `useContext`, `Context.Provider`, `forwardRef`, `defaultProps`, `createRef` or string ref.

| Why | Check | Tags |
|---|---|---|
| each has a current form — `use` reads a context and can be called conditionally, a ref is a prop — and two forms of one thing double what a reader must know. | tool/lint | [] |

## function-components-only → inheritance-only-for-errors-and-framework-points · MUST
Components are functions, composed, never inherited; a class only for an error boundary.

| Why | Check | Tags |
|---|---|---|
| hooks work only in functions, and inheritance between components couples them to each other's internals. | tool/lint | [] |

## hooks-at-top-level · MUST
Hooks are called only at the top level of a component or a hook, never in a condition, a loop or a callback.

| Why | Check | Tags |
|---|---|---|
| React matches hooks by their call order; a hook called conditionally reads another hook's state. | tool/lint | [errors] |

## no-component-defined-inside-component · MUST
No component is defined inside another component.

| Why | Check | Tags |
|---|---|---|
| a component defined inside another is a new type on every render, so its state resets each time. | tool/lint | [errors, performance] |

## list-keys-from-identity · SHOULD
A list's key comes from the item's identity, never its index.

| Why | Check | Tags |
|---|---|---|
| an index key moves state to the wrong item when the list is reordered or filtered. | tool/lint | [errors] |

## components-named-in-pascal-case → identifier-case-by-kind
A component is named in PascalCase.

| Why | Check | Tags |
|---|---|---|
| React renders a lower-case name as an element of the platform, never as the component. | review | [] |

## nothing-rendered-as-null → absence-has-one-value
A component that renders nothing returns `null`, the one place internal code writes it.

| Why | Check | Tags |
|---|---|---|
| React's own absence of output is `null`, and a component returning `undefined` reads as a forgotten return. | tool/lint | [] |

## State and effects

## effects-only-for-external-systems · MUST
An effect synchronises with a system outside React — never state from state, never the response to an event. An external store is read with `useSyncExternalStore`.

| Why | Check | Tags |
|---|---|---|
| an effect that sets state from state renders twice and races; an event's response belongs in its handler. | review | [] |

## effect-cleans-up-and-cancels → io-has-timeout-and-cancellation · MUST
Every effect cleans up what it starts — subscriptions, listeners, sockets, timers — and aborts its asynchronous work, so only the latest response lands.

| Why | Check | Tags |
|---|---|---|
| an effect that does not clean up leaks, and a late response overwrites a newer one. | review | [] |

## async-ui-state-through-actions · SHOULD
Pending, optimistic and transition state go through `useActionState`, `useTransition` and `useOptimistic`; optimism local to a component is `useOptimistic`, optimism over cached data is the data library's.

| Why | Check | Tags |
|---|---|---|
| React then knows what is pending, and keeps the user interface responsive while it is. | review | [ux] |

## fast-source-batched-in-its-hook → fast-source-updates-once-per-frame
A hook that folds a fast source schedules its state once per animation frame; an expensive render driven by input reads `useDeferredValue`.

| Why | Check | Tags |
|---|---|---|
| a render per event starves the frame; batched or deferred, the screen stays responsive. | review | [] |

## Composition

## compound-parts-share-the-root-context → compound-root-owns-choreography
A compound's parts are attached to its root with a typed `Object.assign`, and the root shares its state — the choreography of animated regions included — through `<name>.context.ts`.

| Why | Check | Tags |
|---|---|---|
| the parts read what the root decides, without props threaded through the consumer's markup. | review | [] |

## error-boundary-catches-render-errors · SHOULD
A screen's error boundary catches the render errors below it and shows the screen's error state, and the failure is reported once. A failure a data hook returns as a state is rendered, not thrown.

| Why | Check | Tags |
|---|---|---|
| a thrown render error then costs one screen, and an expected failure is shown where it belongs. | review | [errors, ux] |

## hidden-state-kept-by-activity · SHOULD
A hidden part that must keep its state — a tab panel, a step, a view the user comes back to — is wrapped in `<Activity mode="hidden">`, neither unmounted nor hidden by a style alone.

| Why | Check | Tags |
|---|---|---|
| unmounting loses the state, and a part hidden by a style alone keeps its effects running. | review | [ux] |

## controllable-props-named-value-default-change → stateful-component-controllable-or-not
The value is `<name>`, its initial value `default<Name>` and its callback `on<Name>Change`, resolved by one hook.

| Why | Check | Tags |
|---|---|---|
| the names are the ones the primitive library and the platform use, so a component reads like the elements around it. | review | [] |
