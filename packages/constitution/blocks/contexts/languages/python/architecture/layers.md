# Layers

> Governs which units set timers.

## Direction

### timer-started-only-by-the-edge-and-binding-units → effects-held-only-by-the-edge · MUST

`asyncio.sleep`, `loop.call_later`, `loop.call_at` and `threading.Timer` are called only at the edge and in a binding unit that schedules its own work.

| Why |
|---|
| a timer reads the clock, so code that sets one outside them waits on time no spec can hand in. |
