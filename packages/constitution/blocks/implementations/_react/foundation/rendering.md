# Rendering

> Governs how a component or a hook is written and rendered, and what a component renders for nothing.

## Compilation and purity

### react-compiler-on · MUST

The build runs the React Compiler over every component and hook, except one the Compiler refuses, whose `'use no memo'` states why. No `useMemo`, `useCallback` or `memo`: the Compiler memoises. A function an effect needs but must not re-run on is wrapped in `useEffectEvent`. An exception — a value whose identity an effect or a library the Compiler skips depends on, or profiler evidence — is stated in its suppression.

| Why |
|---|
| the Compiler memoises what is safe to memoise, so the code stays plain and fast without hand-written memoisation. |

### render-is-pure · MUST

A component or hook returns the same output for the same props, state and context: it changes nothing that existed before the render and reads no ref during it. A value kept from the previous render — an exiting route frozen for its animation — is the component's own state, set during its render behind a comparison with the kept value, as React documents, never a ref. The root renders inside `StrictMode`.

| Why |
|---|
| the Compiler, concurrent rendering and `StrictMode` run a render more than once; one that is not pure behaves differently each time. |

## Components and hooks

### modern-react-api-only · MUST

Only the modern API: `use(Context)`, `<Context value>`, `ref` as a prop, ref callbacks that return their cleanup, actions. The legacy form of each is forbidden.

| Why |
|---|
| two forms of one thing double what a reader must know, and the legacy forms are on their way out. |

### function-components-only → behaviour-composed-not-inherited · MUST

Components are functions, composed, never inherited; a class only for an error boundary.

| Why |
|---|
| hooks work only in functions, and inheritance between components couples them to each other's internals. |

### hooks-at-top-level · MUST

Hooks are called only at the top level of a component or a hook, never in a condition, a loop or a callback.

| Why |
|---|
| React matches hooks by their call order; a hook called conditionally reads another hook's state. |

### component-never-defined-inside-a-component · MUST

No component is defined inside another component.

| Why |
|---|
| a component defined inside another is a new type on every render, so its state resets each time. |

## What it renders

### list-keys-from-identity · SHOULD

A list's key comes from the item's identity, never its index.

| Why |
|---|
| an index key moves state to the wrong item when the list is reordered or filtered. |

### nothing-rendered-as-null → undefined-is-the-only-absence · MUST

Internal code writes `null` only where React's types demand it: a component that renders nothing returns it, typed `ReactElement | null`; the empty branch of a conditional; an inline component such as `{ hr: () => null }`; and a ref object, `useRef<T>(null)` or `RefObject<T | null>`.

| Why |
|---|
| React's own absence of output is `null`, and a component returning `undefined` reads as a forgotten return. |
