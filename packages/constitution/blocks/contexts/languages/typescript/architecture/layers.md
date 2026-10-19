# Layers

> Governs which units set timers.

## Direction

### timer-set-only-by-the-edge-and-binding-units → effects-held-only-by-the-edge · MUST

`setTimeout`, `setInterval` and `setImmediate` are called only at the edge and in a binding unit that schedules its own work.

| Why | Tags |
|---|---|
| a timer reads the clock, so code that sets one outside them waits on time no spec can hand in. | [] |
