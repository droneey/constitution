# State and effects

> Governs a component's state and its effects.

## General

### effects-only-for-external-systems · MUST

An effect synchronises with a system outside React — never state from state, never the response to an event: a value that can be derived is computed during render, never stored in state. An external store is read with `useSyncExternalStore`.

| Why |
|---|
| a derived copy kept in state by an effect renders twice, races and is one render behind the value it copies; an event's response belongs in its handler. |

### effect-event-for-what-must-not-re-run-it · MUST

A function an effect needs but must not re-run on is wrapped in `useEffectEvent`.

| Why |
|---|
| a function listed among an effect's dependencies re-runs it each time the function changes, and one left out of them reads the values of the render that started the effect. |

### effect-cleans-up-and-cancels → resource-released-on-every-path · MUST

Every effect cleans up what it starts — subscriptions, listeners, sockets, timers — and aborts its asynchronous work, so only the latest response lands.

| Why |
|---|
| an effect that does not clean up leaks, and a late response overwrites a newer one. |

### async-ui-state-through-actions · SHOULD

Pending, optimistic and transition state go through `useActionState`, `useTransition` and `useOptimistic`; optimism local to a component is `useOptimistic`, optimism over cached data is the data library's.

| Why |
|---|
| React then knows what is pending, and keeps the user interface responsive while it is. |

### fast-source-batched-in-its-hook → fast-source-updates-once-per-frame · SHOULD

A hook that folds a fast source schedules its state once per animation frame; an expensive render driven by input reads `useDeferredValue`.

| Why |
|---|
| a render per event starves the frame; batched or deferred, the screen stays responsive. |
