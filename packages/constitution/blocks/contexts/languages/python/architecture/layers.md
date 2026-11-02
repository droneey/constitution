# Layers

> Governs the layers in Python: which units may set a timer.

## Direction

### timer-started-only-by-the-edge-and-binding-units → effects-held-only-by-the-edge · MUST

Python's timers are started only at the edge and in a binding unit that schedules its own work. They are `asyncio.sleep`, `loop.call_later`, `loop.call_at` and `threading.Timer`.

| Why |
|---|
| a timer reads the clock, so code that sets one outside them waits on time no spec can hand in. |
