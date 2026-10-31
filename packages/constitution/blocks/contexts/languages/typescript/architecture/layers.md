# Layers

> Governs the layers in TypeScript: which units may set a timer.

## Direction

### timer-set-only-by-the-edge-and-binding-units → effects-held-only-by-the-edge · MUST

`setTimeout`, `setInterval` and `setImmediate` are called only at the edge and in a binding unit that schedules its own work.

| Why |
|---|
| a timer reads the clock, so code that sets one outside them waits on time no spec can hand in. |
