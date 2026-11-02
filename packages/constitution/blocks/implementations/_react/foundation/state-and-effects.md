# State and effects

> Governs a component's effects and its state.

## Effects

### effects-only-for-external-systems · MUST

An effect only synchronises with a system outside React, never a value React can derive. An effect never sets state from state and never responds to an event, a derivable value is computed during render and never kept in state, and an external store is read with `useSyncExternalStore`.

| Why |
|---|
| a derived copy kept in state by an effect renders twice, races and is one render behind the value it copies; an event's response belongs in its handler. |

### effect-event-for-what-must-not-re-run-it · MUST

A function an effect needs but must not re-run on is wrapped in `useEffectEvent`.

| Why |
|---|
| a function listed among an effect's dependencies re-runs it each time the function changes, and one left out of them reads the values of the render that started the effect. |

### effect-cleans-up-and-cancels → resource-released-on-every-path · MUST

Every effect cleans up and cancels what it starts. Its cleanup releases its subscriptions, listeners, sockets and timers and aborts its asynchronous work, so only the latest response lands.

| Why |
|---|
| an effect that does not clean up leaks, and a late response overwrites a newer one. |

## State

### async-ui-state-through-actions · SHOULD

Asynchronous state of the interface goes through React's actions. Pending, optimistic and transition state go through `useActionState`, `useTransition` and `useOptimistic`; optimism local to a component is `useOptimistic`, and optimism over cached data is the data library's.

| Why |
|---|
| pending state kept by hand is unknown to React, which then cannot keep the interface responsive while it waits, and a flag set by hand drifts from the work it tracks. |

### fast-source-batched-in-its-hook → fast-source-updates-once-per-frame · SHOULD

A hook that folds a fast source sets its state once per animation frame. An expensive render driven by input reads `useDeferredValue`.

| Why |
|---|
| a render per event starves the frame; batched or deferred, the screen stays responsive. |
