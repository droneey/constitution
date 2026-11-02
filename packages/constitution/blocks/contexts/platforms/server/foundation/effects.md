# Effects

> Governs a server's copies, its stop, its resources and work in flight, one-off work and its logs.

## General

### server-copy-keeps-only-what-it-can-lose · MUST

A copy of a server keeps only what it can lose. What it keeps in its memory and on its disk — a cache, a buffer, a temporary file — is what it can rebuild or abandon; a session, an upload, a lock, a claim and the progress of work live in a store its copies share.

| Why |
|---|
| its host replaces, moves and multiplies copies without warning, so what one copy holds is lost at its restart and unseen by its siblings. |

### server-serves-its-protocol-itself · SHOULD

A server serves its protocol itself, with no web server its host must put around it.

| Why |
|---|
| a server that needs a web server in front of it runs only where that server is configured for it, and each host configures it differently. |

## Stop

### server-stop-waits-for-routing-to-end → program-stops-cleanly · MUST

A server's stop waits out a pause that outlasts its removal from routing. Its host holds back the stop signal for that pause or, where it cannot, the server goes on answering through it before it closes its listener; only then does it stop taking new work.

| Why |
|---|
| a host takes a copy out of routing and signals it at nearly the same moment, so a server that closes its listener at once refuses requests already on their way to it. |

### server-stop-bound-shorter-than-the-hosts-grace → program-stops-cleanly · MUST

A server's stop bound, its pause for routing included, is shorter than the time its host waits before it kills the process.

| Why |
|---|
| past the host's grace the process is killed mid-work, and the clean stop it started never ends. |

### stop-signal-reaches-the-server-process → program-stops-cleanly · MUST

The host's stop signal reaches the server's own process. No wrapper stands between them — a shell, a script runner, a supervisor — unless it forwards every signal to the process and waits for it to exit.

| Why |
|---|
| a signal a wrapper swallows never starts the clean stop, and the host kills the process when its grace runs out. |

## Resources and concurrency

### server-sized-to-the-hosts-grant · SHOULD

A server sizes itself to what its host grants, never to the machine it runs on. Its heap, its threads, its workers and its pools fit the memory and the processors its host grants it.

| Why |
|---|
| a runtime that counts the machine's cores and memory takes more than its copy was given, and the host throttles it or kills it for memory it never had. |

### server-work-in-flight-bounded · SHOULD

A server bounds the work it holds in flight and refuses the rest at once. What comes beyond the bound is refused with its protocol's answer for a busy server rather than queued.

| Why |
|---|
| a burst queued without a bound waits past every caller's timeout, and the server spends its time on work nobody waits for any more — load shedding. |

## Operations

### one-off-work-runs-as-its-own-process · SHOULD

One-off work runs as its own process, never inside a copy's start. Work done once per release or on demand — a migration, a seed, a backfill, a repair — runs as a one-off process of the server's release, with its configuration.

| Why |
|---|
| every copy that starts would run it again, at the same time as its siblings, and a slow run holds back every restart. |

## Diagnostics

### server-log-leaves-as-a-stream → diagnostics-written-through-a-logger · MUST

A server's logs leave as a stream, never as a file inside its copy. Its logger writes its records to standard output or standard error, or to a collector over the network.

| Why |
|---|
| its host gathers every copy's stream in one place, while a file inside a copy is lost when the copy is replaced and fills its disk until then. |

## Requirements for implementation

### server-runtime-leaves-the-stop-to-the-program · MUST

A server's framework and runtime leave the stop to the program. They hand the stop signal to the program, close a listener when the program asks and report when the work in flight is done; none of them exits on the signal by itself.

| Why |
|---|
| a framework or a runtime that exits on the signal by itself cuts off the pause for routing and the work in flight, so neither the pause nor the stop bound can hold. |
