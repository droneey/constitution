# Error boundaries

> Governs the failures of rendering, which a boundary catches, and those of a handler and an effect, which it does not.

## General

### screen-renders-inside-its-own-error-boundary → failure-contained-to-its-screen · MUST

Every screen renders inside an error boundary of its own, never only one at the root.

| Why |
|---|
| React unmounts the whole tree below the boundary that catches, so with one boundary at the root a render error in one screen takes the whole program down. |

### expected-failure-handled-in-its-handler-or-effect → failure-is-expected-or-defect · MUST

An expected failure in an event handler or an effect is handled where it happens. It is never left for an error boundary, and a defect there travels on to the root's report.

| Why |
|---|
| React sends a boundary only the errors of rendering, so an expected failure left to a boundary is never shown, and a defect caught on the spot is hidden from the one handler that reports it. |
