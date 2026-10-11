---
id: server
summary: A long-running process a host starts, routes to, restarts and stops.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---

# Server

> A program that runs until its host stops it — in a container, a virtual machine or a platform's process — and serves requests or works through messages and schedules. Its host decides when it starts, when work is routed to it, how many copies of it run and when it is killed; the program tells its host whether it is alive and ready, and stops when told. What HTTP adds is in `with/http-server.md`, a consumer's liveness in `with/messaging.md`, the connections to its own store in `with/owned-data.md`, the signals of its copies in `with/observability.md`, and where its processes, probes and stop live in `architecture/`.

## Types

### server-process-time-zone-is-utc → instant-is-an-exact-time · MUST
A server's process runs with its time zone set to UTC, never to its host's zone or to one its configuration chooses; a local time is computed from a zone the data names.

| Why | Tags |
|---|---|
| a library that falls back to the process's zone then gives one answer on every copy, whichever host runs it, and a time shown to a person follows that person's zone, not the machine's. | [data] |

## Errors

### unowned-failure-ends-the-server → last-resort-handler-one-per-entry · MUST
A failure that no request, message or job owns — an uncaught exception, an unhandled rejection — reaches the process's handler of last resort, which logs it and ends the server through its stop path with a failing exit code.

| Why | Tags |
|---|---|
| such a failure leaves the process in a state no code foresaw, and one that runs on corrupts what it touches next; its host starts a fresh copy from a known state. | [errors] |

## Effects

### server-stop-waits-for-routing-to-end → program-stops-cleanly · MUST
A server's stop begins once its host has stopped routing work to it: the host holds back the stop signal for a pause that outlasts the removal from routing, or, where it cannot, the server goes on answering through such a pause before it closes its listener; only then does it take no new work.

| Why | Tags |
|---|---|
| a host takes a copy out of routing and signals it at nearly the same moment, so a server that closes its listener at once refuses requests already on their way to it. | [errors] |

### server-stop-bound-shorter-than-the-hosts-grace → program-stops-cleanly · MUST
A server's stop bound, its pause for routing included, is shorter than the time its host waits before it kills the process.

| Why | Tags |
|---|---|
| past the host's grace the process is killed mid-work, and the clean stop it started never ends. | [errors, data] |

### stop-signal-reaches-the-server-process → program-stops-cleanly · MUST
The host's stop signal reaches the server's own process: no wrapper stands between them — a shell, a script runner, a supervisor — unless it forwards every signal to the process and waits for it to exit.

| Why | Tags |
|---|---|
| a signal a wrapper swallows never starts the clean stop, and the host kills the process when its grace runs out. | [errors] |

### server-copy-keeps-only-what-it-can-lose · MUST
A copy of a server keeps in its memory and on its disk only what it can lose — a cache, a buffer, a file it is still writing; a session, an upload, a lock, a claim and the progress of work live in a store its copies share.

| Why | Tags |
|---|---|
| its host replaces, moves and multiplies copies without warning, so what one copy holds is lost at its restart and unseen by its siblings. | [data] |

### one-off-work-runs-as-its-own-process · SHOULD
Work done once per release or on demand — a migration, a seed, a backfill, a repair — runs as a one-off process of the server's release, with its configuration, never inside a copy's start.

| Why | Tags |
|---|---|
| every copy that starts would run it again, at the same time as its siblings, and a slow run holds back every restart. | [data] |

### server-pools-sized-to-the-hosts-grant · SHOULD
A server sizes its heap, its threads, its workers and its pools to the memory and the processors its host grants it, never to those of the machine it runs on.

| Why | Tags |
|---|---|
| a runtime that counts the machine's cores and memory takes more than its copy was given, and the host throttles it or kills it for memory it never had. | [performance] |

### server-configuration-taken-from-its-host → configuration-parsed-once-at-start · MUST
Every setting that differs between deployments reaches a server from its host — an environment variable or a file the host mounts — and none is built into its artefact.

| Why | Tags |
|---|---|
| one built artefact is then promoted from staging to production unchanged, and it holds nothing one environment must keep from another. | [security] |

### server-listens-where-its-configuration-says · SHOULD
A server listens on the address and the port its configuration names, and serves its protocol itself, with no web server its host must put around it.

| Why | Tags |
|---|---|
| its host then routes to the port it assigned, and the same process runs alike under any host, in a spec and on a laptop. | [] |

### server-log-leaves-as-a-stream → diagnostics-written-through-a-logger · MUST
A server's logger writes its records as a stream — to standard output or standard error, or to a collector over the network — never to a file inside its copy.

| Why | Tags |
|---|---|
| its host gathers every copy's stream in one place, while a file inside a copy is lost when the copy is replaced and fills its disk until then. | [] |

## Security

### server-secret-read-from-a-mounted-file · SHOULD
A server reads each secret once at start from a file its host mounts in memory — a Swarm secret, a Kubernetes secret volume, a systemd credential — or fetches it with its host's workload identity; it takes a secret from its environment only where its host offers no other way.

| Why | Tags |
|---|---|
| the environment is copied into every child process, written into crash reports and diagnostic dumps and shown by the host's inspect commands, while a file mounted in memory reaches only the code that opens it. | [security] |

### child-process-environment-built-for-it → credential-has-least-privilege · MUST
A process a server starts receives an environment the server builds for it, holding only what that child needs, never the server's whole environment.

| Why | Tags |
|---|---|
| a child inherits every variable by default, a secret among them, and passes it on to its own children and into what it prints. | [security] |

### server-cloud-access-through-workload-identity → credential-has-least-privilege · SHOULD
Where its host gives it a workload identity, a server reaches the systems of that cloud with the identity's short-lived credentials, never with a long-lived key.

| Why | Tags |
|---|---|
| a credential the host issues and rotates leaves no key to copy, leak or forget. | [security] |

## Tests

### server-stop-proven-by-a-spec → lifecycle-tested-to-its-final-state · SHOULD
A server has a spec that starts it, gives it work, tells it to stop while the work runs, and checks that the work finishes, new work is refused and the process exits within its bound.

| Why | Tags |
|---|---|
| the stop runs at every deployment and nowhere else, so a fault in it drops work at each release where no one is looking. | [testing] |

## Health

### server-liveness-reports-the-process-alone · MUST
A server's liveness check — and any check its host restarts it on — reports only whether the process itself still makes progress, and never reaches a store, a broker or another system.

| Why | Tags |
|---|---|
| its host restarts what fails the check, so one that reaches a shared dependency restarts every copy at once when that dependency fails, and a partial outage becomes a full one. | [errors] |

### server-readiness-reports-what-serving-needs · MUST
A server's readiness check, where its host routes by one, fails until the server has started, from the moment it is told to stop, and while a system it cannot serve any request without is out of reach; otherwise it passes.

| Why | Tags |
|---|---|
| the host routes work only to a ready copy, so a copy that cannot serve leaves rotation without a restart and returns when it can. | [errors] |

### server-start-outwaits-its-dependencies · SHOULD
A server starts whatever the state of the systems it depends on: one out of reach at start is retried with a growing delay while the server's readiness fails, and never ends the start.

| Why | Tags |
|---|---|
| a host starts copies and their dependencies in no fixed order, and a server that exits when one is late restarts in a loop that delays its own recovery. | [errors] |

## Requirements for implementation

### server-runtime-leaves-the-stop-to-the-program · MUST
A server's framework and runtime hand the stop signal to the program, close a listener when the program asks and report when the work in flight is done; none of them exits on the signal by itself.

| Why | Tags |
|---|---|
| without it, neither the pause for routing nor the stop bound can hold. | [errors] |

### server-framework-started-and-stopped-in-a-spec · MUST
A server's framework can be started and stopped by a spec inside its process, listening on a port the system chooses.

| Why | Tags |
|---|---|
| without it, the spec of the stop reaches a fixed port shared with other runs, or cannot stop the server it started. | [testing] |
