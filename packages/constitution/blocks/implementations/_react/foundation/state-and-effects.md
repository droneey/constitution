# State and effects

> Governs a component's state and its effects.

## General

### effects-only-for-external-systems · MUST

An effect synchronises with a system outside React — never state from state, never the response to an event. An external store is read with `useSyncExternalStore`.

| Why | Tags |
|---|---|
| an effect that sets state from state renders twice and races; an event's response belongs in its handler. | [] |

### derived-state-computed-in-render · MUST

A value that can be derived is computed during render, never stored in state and synchronised by an effect.

| Why | Tags |
|---|---|
| a derived copy in state renders twice and is one render behind the value it copies. | [performance] |

### effect-cleans-up-and-cancels → resource-released-on-every-path · MUST

Every effect cleans up what it starts — subscriptions, listeners, sockets, timers — and aborts its asynchronous work, so only the latest response lands.

| Why | Tags |
|---|---|
| an effect that does not clean up leaks, and a late response overwrites a newer one. | [] |

### async-ui-state-through-actions · SHOULD

Pending, optimistic and transition state go through `useActionState`, `useTransition` and `useOptimistic`; optimism local to a component is `useOptimistic`, optimism over cached data is the data library's.

| Why | Tags |
|---|---|
| React then knows what is pending, and keeps the user interface responsive while it is. | [ux] |

### fast-source-batched-in-its-hook → fast-source-updates-once-per-frame · SHOULD

A hook that folds a fast source schedules its state once per animation frame; an expensive render driven by input reads `useDeferredValue`.

| Why | Tags |
|---|---|
| a render per event starves the frame; batched or deferred, the screen stays responsive. | [] |
