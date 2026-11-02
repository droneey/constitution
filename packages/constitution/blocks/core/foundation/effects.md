# Effects

> Governs what a program does beyond computing a value: its calls, resources, concurrent work, writes, stop, diagnostics and configuration.

## Calls

### outside-call-has-a-timeout · MUST

Every call across a process boundary has a timeout.

| Why |
|---|
| a call without a timeout can hang for ever and take its caller with it. |

### outside-call-can-be-cancelled · SHOULD

Every call across a process boundary can be cancelled by its caller.

| Why |
|---|
| a call that cannot be cancelled keeps working for a caller who left. |

### call-takes-the-remaining-deadline · SHOULD

A call made for work with a deadline takes the time that work has left. Such work is a request or a task; the call never takes a full timeout of its own, and is not made once no time is left.

| Why |
|---|
| a nested call with a full timeout of its own keeps working after its caller has given up, and its answer reaches nobody. |

### outside-call-never-made-per-item · SHOULD

A loop makes no call across a process boundary per item where the other side answers the whole set in one call.

| Why |
|---|
| one call per item multiplies the latency and the load by the size of the set, and works only while the set is small. |

## Resources and concurrency

### async-work-awaited-or-held-by-a-scope · MUST

Asynchronous work is awaited or held by a scope. The scope waits for it, cancels it and receives its failures; work that must outlive its caller is started in a longer-lived scope, such as a supervisor, and no task outlives every scope.

| Why |
|---|
| forgotten work fails where nobody listens, and a task no scope holds leaks resources and reports to nobody — structured concurrency. |

### resource-released-on-every-path · MUST

A resource the code acquires is released on every way out, a failure's included. Such a resource is a handle, a connection, a lock or a subscription; one whose life is one scope is released by the language’s scoped form of release, and one that outlives its scope by the owner that holds it.

| Why |
|---|
| a release written only on the path that succeeds leaks on the first failure, and the leak shows far from its cause. |

### growing-collection-bounded · MUST

Whatever grows with the data has a bound, and says what happens at it. A read of a collection from outside the program — a read of a store, a remote list, a queue, a file — has an explicit limit and pages or refuses beyond it. A collection the program keeps beyond one operation — a cache, a queue, a buffer, a table of sessions — evicts, refuses or makes the producer wait at its bound, and work started concurrently over a collection — calls, tasks, jobs — runs at most a set number at a time.

| Why |
|---|
| an unbounded read, kept collection or fan-out works on test data and fails in production when the data grows, far from the code that let it grow, by exhausting memory, connections or the quota of the system it calls. |

### state-shared-by-concurrent-work-owned-or-guarded · MUST

State that concurrent work reaches is owned or guarded. Such state, in the program's memory, is owned by one task and changed only through messages to it, changed only by atomic operations, or guarded by locks taken in one fixed order; a lock is never held while waiting on another system, save across one call that has a timeout and takes no other lock.

| Why |
|---|
| two tasks that change one value unguarded lose an update at random, and locks taken in two orders, or held while waiting on another system, deadlock under load. |

### shared-resource-has-one-writer · MUST

Every resource the program shares with its host has one writer. Among them are a signal’s handler, the exit code, the working directory and a standard stream, which has one writer per kind of record it carries: the logger for diagnostics, one writer for its user's output.

| Why |
|---|
| two writers of one resource overwrite each other in an order nobody chose. |

### program-stops-cleanly · MUST

A program told to stop stops cleanly, within a bound. Told to stop — by a termination signal or by its host — it keeps taking the work routed to it until nothing routes work to it, then takes none, finishes or cancels the work in flight within a bound, releases its resources and exits; a second request to stop may end it at once, without the cleanup.

| Why |
|---|
| a program killed mid-work leaves half-written data and calls without an answer, and a stop with no bound hangs every deployment — the twelve-factor app. |

## Operations

### operation-idempotent-by-design · SHOULD

An operation that may be repeated is idempotent. A key is minted once per intent and sent with every attempt, child identifiers are derived deterministically, and a transition to the current state does nothing; the receiver gives a repeat that carries a key it has seen the effect of the first, once, and keeps the keys it has seen for as long as the sender may repeat.

| Why |
|---|
| networks retry and users click twice, so an operation that is not idempotent charges, sends or creates a second time, and a receiver that forgets a key before its sender stops repeating lets a late repeat through — an idempotency key and the idempotent receiver. |

### write-lands-whole · MUST

A write that changes several things lands whole or not at all. Such a write — to records, to files, or to a record and the event or message that announces it to another part — goes through one transaction, a finished temporary file renamed into place, or an outbox; one that cannot, such as a change to systems outside, is idempotent, so a rerun completes what a stop left half done.

| Why |
|---|
| a write that stops halfway leaves data no rule of the program expects, and nothing later can tell which half landed. |

### write-on-read-data-is-conditional · MUST

A write decided on data read earlier is made only if that data is still unchanged. Where another writer may change the data meanwhile, the write checks it by a version, a compare-and-set or a lock, and is refused when it changed.

| Why |
|---|
| two writers who read the same state otherwise overwrite each other, and the first update is lost without a trace. |

### irreversible-operation-runs-dry-by-default · MUST

An irreversible operation against a live system runs only on an explicit confirmation of that run, and otherwise shows what it would do. Such an operation is run by hand or by a pipeline — a script, a data fix, a migration, a deployment, an apply — and destroys data, spends money, changes the system or sends something outward; a live system is one others use, or whose data outlives the task. An operation of the product its user invokes, whose one purpose is that effect, and the reviewed change that sets off a pipeline’s deployment are that confirmation.

| Why |
|---|
| an irreversible operation started by a slip reaches data others rely on, and no better test or later fix undoes it. |

## Diagnostics and configuration

### diagnostics-written-through-a-logger · MUST

Diagnostics are written only through a logger. The logger is the program's one **logging facade**{#logging-facade}, the language’s standard one where its ecosystem commonly uses it, and its sink may be a standard stream; code writes to a console or a standard stream directly only a command-line program’s output to its user or a protocol the program speaks over it, and no debug output or breakpoint ships.

| Why |
|---|
| output written past the logger escapes the one place that decides where diagnostics go and what they may carry, so it lands where nobody looks, mixes into its user's output and can leak what it prints. |

### configuration-enters-only-through-its-declaration · MUST

Configuration enters the program only through its declaration. It is declared in one place, read only by its declared names and parsed into the value the program receives, typed where its language has types, and a missing or malformed setting fails the start of the work that needs it — the program, or the subcommand or the part that reads it — before that work begins.

| Why |
|---|
| a setting checked where it is first used fails in the middle of a request, long after the deployment that broke it — fail fast. |

### changed-configuration-applied-whole-or-refused · MUST

Configuration changes while the program runs only as a whole set its declaration checked. A setting changes only where its declaration allows it, and one that sized or opened something at start — a pool, a listening address, a storage path — takes a restart; a secret its host rotates is read again through the same declared name and type. A changed set is checked whole by the same declaration and swapped in at once, an operation keeps the set it started with, and a set that fails is refused, the last valid set kept and the refusal reported.

| Why |
|---|
| a changed value applied in part or unchecked runs the program on a state no start ever validated, an operation that sees two sets mixes them, and a secret read once at start fails every call after its host rotates it. |

### one-artefact-serves-every-environment · MUST

A program the project hosts ships one artefact to every environment. Such a program is one a host of the project runs or serves — a server, a served bundle —, and a setting that differs between environments reaches its artefact from its host, never built into it.

| Why |
|---|
| an artefact built for each environment is one nobody tested, and a setting built into it carries one environment's values, its secrets among them, wherever the artefact goes — the twelve-factor app. |

### behaviour-never-keyed-on-the-environments-name · SHOULD

The program's code never branches on the name of the environment it runs in. A name such as `production`, `staging` or `development` decides nothing; what differs between environments is a setting named for what it changes — a log level, an address, a sandbox for a payment provider — declared in the configuration, by which the program also chooses an implementation.

| Why |
|---|
| a branch on the name runs code in one environment that no other runs, so what one environment proves says nothing of the next, while a named setting can be turned on wherever it is needed — the twelve-factor app. |
