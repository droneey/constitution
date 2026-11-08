# Effects

> Governs a server's instances, its stop, its resources and the work it holds in flight, and its one-off work.

## Vocabulary

A server's **stop path** is the code that carries out its stop, from the stop signal to its exit.

A server's **pause for routing** is the wait from its removal from routing to the close of its listener.

**One-off work** is work a server needs done once per release or on demand, such as a seed, a backfill or a repair, a change to a store's schema being none, and a **one-off process** is a process that does it.

## General

### server-instance-keeps-only-what-it-can-lose · MUST

Every instance of a server keeps in its memory and on its disk only what it can lose. What it keeps there, such as a cache, a buffer or a temporary file, it can rebuild or abandon; a session, an upload, a lock that keeps its instances off the same work, a claim and the progress of work live in a store its instances share.

| Why |
|---|
| its host replaces, moves and multiplies instances without warning, so what one instance holds is lost at its restart and unseen by its siblings. |

### server-serves-its-protocol-itself · SHOULD

Every server serves its protocol itself, needing no web server in front of it. A proxy or a load balancer may still stand in front of it, as its host chooses.

| Why |
|---|
| a server that needs a web server in front of it runs only where that web server is configured for it, and each host configures it differently. |

## Stop

### server-stop-waits-out-its-pause-for-routing → stopping-program-takes-work-until-unrouted · MUST

When told to stop, every server keeps its listener open and answering until its pause for routing has passed. The project sets the pause above the time its routers take to let it go, and a pause its host spends before it signals the server counts toward it. Exempt: a second request to stop, which may end it at once.

| Why |
|---|
| a host takes an instance out of routing and signals it at nearly the same moment, and no server can see when the last router has let it go, so one that closes its listener at once refuses requests already on their way to it. |

### server-stop-bound-shorter-than-the-hosts-grace → program-stops-cleanly · MUST

Every server's stop ends within a bound shorter than the time its host waits before it kills the process. The bound includes its pause for routing.

| Why |
|---|
| past the host's grace the process is killed mid-work, and the clean stop it started never ends. |

### stop-signal-reaches-the-server-process → program-stops-cleanly · MUST

Every stop signal of a server's host reaches the server's own process. No wrapper stands between them, such as a shell, a script runner or a supervisor. Exempt: a wrapper that forwards every signal to the process and waits for it to exit.

| Why |
|---|
| a signal a wrapper swallows never starts the clean stop, and the host kills the process when its grace runs out. |

## Resources and concurrency

### server-sized-to-the-hosts-grant · MUST

Every server sizes itself to what its host grants it, never to the machine it runs on. Its heap, its threads, its workers and its pools fit the memory and the processors its host grants it.

| Why |
|---|
| a runtime that counts the machine's cores and memory takes more than its instance was given, and the host throttles it or kills it for memory it never had. |

### server-work-in-flight-bounded → kept-collection-bounded · MUST

Every server that answers requests bounds the requests it holds, queued or under way, and refuses each beyond the bound at once. It refuses with its protocol's answer for a busy server.

| Why |
|---|
| a burst queued without a bound waits past every caller's timeout, and the server spends its time on work nobody waits for any more — load shedding. |

## Operations

### one-off-work-runs-as-its-own-process · MUST

All one-off work a server needs runs in a one-off process, never inside an instance's start.

| Why |
|---|
| every instance that starts would run it again, at the same time as its siblings, and a slow run holds back every restart. |

### one-off-process-runs-from-the-servers-release · MUST

Every one-off process runs from its server's release, with the settings that release's instances are handed. Exempt: a credential, which the one-off process holds for its own work.

| Why |
|---|
| a one-off process run from a checkout, an older release or another configuration works against a schema and a store the running release does not expect, so it writes what the instances misread or reaches another environment's store, while the credential is the job's own, since its rights differ from the instances'. |
