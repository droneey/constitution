# Layers

> Governs the layers in TypeScript: which units may set a timer.

## Effects

### set-timeout-called-only-at-the-edge → effects-held-only-by-the-edge · MUST

Every call of `setTimeout` or `setInterval` is an effect, held only by the edge. Exempt: a binding unit's timer that schedules its own work.

| Why |
|---|
| a timer reads the clock, so code that sets one anywhere else waits on time no spec can hand in. |
