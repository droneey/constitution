# Health

> Governs a server's probes, what they report, and the wait for the systems it depends on at its start.

## Vocabulary

A server's **liveness check** and its **readiness check** are the probes its host calls: on a failed liveness check its host restarts it, and by its readiness check its host decides whether to route work to it.

A server's **required system** is a system the server cannot serve any request without.

## General

### server-liveness-reports-the-process-alone · MUST

Every liveness check of a server reports only whether its process still makes progress. It never reaches a store, a broker or another system.

| Why |
|---|
| its host restarts what fails the check, so one that reaches a shared dependency restarts every instance at once when that dependency fails, and a partial outage becomes a full one. |

### server-readiness-reports-what-serving-needs · MUST

Where its host routes by one, every server's readiness check fails while the server cannot serve, and passes otherwise. It fails until the server has started, from the moment it is told to stop, and while a required system stays out of reach past a timeout and a count of failures the project sets above that system's usual spikes. Exempt: a required system out of reach since the start, which keeps the check failing as `server-start-outwaits-its-dependencies` gives.

| Why |
|---|
| the host routes work only to a ready instance, so an instance that cannot serve leaves rotation without a restart and returns when it can, while a check that failed on one blip of a system every instance shares would take them all out at once. |

### server-start-outwaits-its-dependencies · MUST

Every server starts whatever the state of the systems it depends on. A system out of reach at its start never makes the start fail, and a required system out of reach keeps the server's readiness check, where it has one, failing until the server reaches it.

| Why |
|---|
| a host starts instances and their dependencies in no fixed order, and a server that exits when one is late restarts in a loop that delays its own recovery. |

### probe-served-apart-from-the-public-address · SHOULD

Every server serves its probes on an address its host reaches and its public callers do not.

| Why |
|---|
| a probe on the public address is open to every caller, who learns when instances fail and can spend the server's work on checks. |
