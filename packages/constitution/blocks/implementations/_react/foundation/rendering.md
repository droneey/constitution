# Rendering

> Governs how a component or a hook is written and rendered, and what a component renders for nothing.

## Compilation and purity

### react-compiler-on · MUST

The React Compiler memoises, and no code memoises by hand. The build runs the Compiler over every component and hook, save one the Compiler refuses, whose `'use no memo'` states why. No `useMemo`, `useCallback` or `memo` is written, save an exception — a value whose identity an effect or a library the Compiler skips depends on, or profiler evidence — stated in its suppression.

| Why |
|---|
| memoisation written by hand fills components with dependency lists that go stale unseen, memoising what is unsafe and missing what matters, while the Compiler memoises only what is safe to memoise. |

### render-is-pure · MUST

Render is pure. A component or hook returns the same output for the same props, state and context: it changes nothing that existed before the render and reads no ref during it. A value kept from the previous render — an exiting route frozen for its animation — is the component's own state, set during its render behind a comparison with the kept value, never a ref.

| Why |
|---|
| the Compiler and concurrent rendering run a render more than once; one that is not pure behaves differently each time. |

### root-renders-in-strict-mode · MUST

The root renders inside `StrictMode`.

| Why |
|---|
| without `StrictMode`, a render that is not pure or an effect that does not clean up passes development and shows first in production; `StrictMode` renders and runs each effect twice while the program is developed — fail fast. |

## Components and hooks

### modern-react-api-only · MUST

Only React's modern API is used. That is `use(Context)`, `<Context value>`, `ref` as a prop, ref callbacks that return their cleanup, and actions; the legacy form of each is forbidden.

| Why |
|---|
| a legacy form is removed by a later release, which breaks the code still on it, and two forms of one thing double what a reader must know. |

### function-components-only → behaviour-composed-not-inherited · MUST

Components are functions, composed, never inherited. A class is written only for an error boundary.

| Why |
|---|
| a class component cannot call a hook, and inheritance between components couples each to its parent's internals — composition over inheritance. |

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

Internal code writes `null` only where React's types demand it. Those places are a component that renders nothing, which returns it typed `ReactElement | null`; the empty branch of a conditional; an inline component that renders nothing; and a ref object, `useRef<T>(null)` or `RefObject<T | null>`.

| Why |
|---|
| React's own absence of output is `null`, and a component returning `undefined` reads as a forgotten return. |
