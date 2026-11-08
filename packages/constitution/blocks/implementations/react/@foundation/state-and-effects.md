# State and effects

> Governs a component's effects and its state.

## Vocabulary

An **external store** is state kept outside React that a component subscribes to, such as a state library or a browser API; it keeps nothing beyond a run, unlike a store of the program's data.

## Effects

### effects-only-for-external-systems · MUST

Every effect only synchronises with a system outside React. It never answers an event, whose response sits in that event's handler.

| Why |
|---|
| an effect that answers an event runs again whenever its dependencies change, so the response repeats or fires where no event took place, while a handler runs once for the event it answers. |

### derived-value-computed-during-render → fact-has-one-source · MUST

Every value React can derive from props, state or context is computed during render, never kept in state. No effect sets state from other state.

| Why |
|---|
| a derived copy kept in state by an effect renders twice, races and is one render behind the value it copies. |

### external-store-read-by-use-sync-external-store · MUST

Every external store a component reads is read through `useSyncExternalStore`, never copied into state by an effect.

| Why |
|---|
| a store copied by an effect shows its old value for a render, and concurrent rendering can show two of its values on one screen. |

### non-reactive-logic-in-an-effect-event · MUST

Every function an effect calls that changes between renders without being a reason to re-run the effect is wrapped in `useEffectEvent`.

| Why |
|---|
| a function listed among an effect's dependencies re-runs it each time the function changes, and one left out of them reads the values of the render that started the effect. |

### effect-releases-in-its-cleanup → resource-released-on-every-path · MUST

Every effect's cleanup releases what the effect holds. That is its subscriptions, listeners, sockets and timers.

| Why |
|---|
| an effect that does not clean up leaks what it holds each time it runs again or its component unmounts. |

### effect-aborts-its-calls-on-cleanup → outside-call-can-be-cancelled · MUST

Every effect's cleanup aborts the calls the effect started, so only the latest response lands.

| Why |
|---|
| a call left running past its cleanup answers late, and its response overwrites the newer one the effect asked for next. |

## State

### async-ui-state-through-actions · SHOULD

All asynchronous state of the interface goes through React's actions. The state of work in flight, an optimistic value and a transition go through `useActionState`, `useOptimistic` and `useTransition`. Exempt: state an external store holds or tracks, such as a cache of server data.

| Why |
|---|
| the state of work in flight kept by hand is unknown to React, which then cannot keep the interface responsive while it waits, and a flag set by hand drifts from the work it tracks. |

### fast-source-batched-in-its-hook → fast-source-updates-once-per-frame · SHOULD

Every hook that folds a fast source sets its state at most once per animation frame.

| Why |
|---|
| a render per event starves the frame, and the screen stops answering while the source runs. |

### expensive-render-reads-input-through-use-deferred-value → long-work-never-blocks-input · SHOULD

Every expensive render that input drives reads that input through `useDeferredValue`.

| Why |
|---|
| an expensive render run on every keystroke holds the input still, so what the person types lags behind their keys. |
