# Health

> Governs liveness, readiness, and the wait for dependencies at start.

## General

### server-liveness-reports-the-process-alone · MUST

A server's liveness check reports the process alone. It, and any check its host restarts the server on, reports only whether the process itself still makes progress, and never reaches a store, a broker or another system.

| Why |
|---|
| its host restarts what fails the check, so one that reaches a shared dependency restarts every copy at once when that dependency fails, and a partial outage becomes a full one. |

### server-readiness-reports-what-serving-needs · MUST

A server's readiness check reports what serving needs. Where its host routes by one, it fails until the server has started, from the moment it is told to stop, and while a system it cannot serve any request without stays out of reach past a timeout and a count of failures the project sets above that system's usual spikes; otherwise it passes.

| Why |
|---|
| the host routes work only to a ready copy, so a copy that cannot serve leaves rotation without a restart and returns when it can; a system every copy shares would take them all out at once on one blip. |

### server-start-outwaits-its-dependencies · SHOULD

A server starts whatever the state of the systems it depends on. One out of reach at start is retried with a delay that grows to a cap the project sets, with a random spread, while the server's readiness fails, and never ends the start.

| Why |
|---|
| a host starts copies and their dependencies in no fixed order, and a server that exits when one is late restarts in a loop that delays its own recovery. |

### probe-served-apart-from-the-public-address · SHOULD

A server serves its probes apart from its public address. It serves them on an address or a port its host reaches and its public callers do not.

| Why |
|---|
| a probe on the public address is open to every caller, who learns when copies fail and can spend the server's work on checks. |
