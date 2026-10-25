# Effects

> Governs the stop, copies, one-off work, pools, configuration, the protocol, logs and work in flight.

## General

### server-copy-keeps-only-what-it-can-lose · MUST

A copy of a server keeps in its memory and on its disk only what it can lose — a cache, a buffer, a temporary file it can rebuild or abandon; a session, an upload, a lock, a claim and the progress of work live in a store its copies share.

| Why |
|---|
| its host replaces, moves and multiplies copies without warning, so what one copy holds is lost at its restart and unseen by its siblings. |

### server-serves-its-protocol-itself · SHOULD

A server serves its protocol itself, with no web server its host must put around it.

| Why |
|---|
| a server that needs a web server in front of it runs only where that server is configured for it, and each host configures it differently. |

## Calls and resources

### server-stop-waits-for-routing-to-end → program-stops-cleanly · MUST

A server's stop begins once its host has stopped routing work to it: the host holds back the stop signal for a pause that outlasts the removal from routing, or, where it cannot, the server goes on answering through such a pause before it closes its listener; only then does it stop taking new work.

| Why |
|---|
| a host takes a copy out of routing and signals it at nearly the same moment, so a server that closes its listener at once refuses requests already on their way to it. |

### server-stop-bound-shorter-than-the-hosts-grace → program-stops-cleanly · MUST

A server's stop bound, its pause for routing included, is shorter than the time its host waits before it kills the process.

| Why |
|---|
| past the host's grace the process is killed mid-work, and the clean stop it started never ends. |

### stop-signal-reaches-the-server-process → program-stops-cleanly · MUST

The host's stop signal reaches the server's own process: no wrapper stands between them — a shell, a script runner, a supervisor — unless it forwards every signal to the process and waits for it to exit.

| Why |
|---|
| a signal a wrapper swallows never starts the clean stop, and the host kills the process when its grace runs out. |

### server-pools-sized-to-the-hosts-grant · SHOULD

A server sizes its heap, its threads, its workers and its pools to the memory and the processors its host grants it, never to those of the machine it runs on.

| Why |
|---|
| a runtime that counts the machine's cores and memory takes more than its copy was given, and the host throttles it or kills it for memory it never had. |

### server-work-in-flight-bounded · SHOULD

A server bounds the work it holds in flight, and refuses what comes beyond the bound at once, with its protocol's answer for a busy server, rather than queueing it.

| Why |
|---|
| a burst queued without a bound waits past every caller's timeout, and the server spends its time on work nobody waits for any more. |

## Operations

### one-off-work-runs-as-its-own-process · SHOULD

Work done once per release or on demand — a migration, a seed, a backfill, a repair — runs as a one-off process of the server's release, with its configuration, never inside a copy's start.

| Why |
|---|
| every copy that starts would run it again, at the same time as its siblings, and a slow run holds back every restart. |

## Records and configuration

### server-configuration-taken-from-its-host → one-artefact-serves-every-environment · MUST

Every setting that differs between deployments reaches a server from its host — an environment variable, a file the host mounts, or a store the server reads with its host's identity — and none is built into its artefact.

| Why |
|---|
| one built artefact is then promoted from staging to production unchanged, and it holds nothing one environment must keep from another. |

### server-log-leaves-as-a-stream → diagnostics-written-through-a-logger · MUST

A server's logger writes its records as a stream — to standard output or standard error, or to a collector over the network — never to a file inside its copy.

| Why |
|---|
| its host gathers every copy's stream in one place, while a file inside a copy is lost when the copy is replaced and fills its disk until then. |

## Requirements for implementation

### server-runtime-leaves-the-stop-to-the-program · MUST

A server's framework and runtime hand the stop signal to the program, close a listener when the program asks and report when the work in flight is done; none of them exits on the signal by itself.

| Why |
|---|
| without it, neither the pause for routing nor the stop bound can hold. |
