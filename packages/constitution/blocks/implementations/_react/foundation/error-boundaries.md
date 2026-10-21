# Error boundaries

> Governs the failures of rendering, which a boundary catches, those of a handler and an effect, which it does not, and the failed state of a data read.

## General

### error-boundary-catches-render-errors → failure-contained-to-its-screen · MUST

A screen's error boundary is a React error boundary, which catches what is thrown while its tree renders.

| Why | Tags |
|---|---|
| React unmounts the whole tree below the boundary that catches, so a boundary per screen costs one screen. | [errors, ux] |

### handler-and-effect-failures-handled-where-they-happen → failure-is-expected-or-defect · MUST

An expected failure in an event handler or an effect is handled where it happens, never left for an error boundary; a defect there travels on to the root's report.

| Why | Tags |
|---|---|
| React sends a boundary only the errors of rendering, so an expected failure left to a boundary is never shown, and a defect caught on the spot is hidden from the one handler that reports it. | [errors, ux] |

### data-failures-rendered-as-state → data-result-is-union-by-status · MUST

A component renders the error state a data hook returns where the data would be, and never throws it — or its read suspends, and the boundary above it renders the pending and failed states.

| Why | Tags |
|---|---|
| an expected failure is then shown where it belongs, and the boundary is left for what nobody expected. | [errors, ux] |
