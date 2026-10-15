# Effects

> Governs calls, resources, concurrency, writes, stopping, records, configuration.

## Calls and resources

### async-work-awaited-or-held-by-a-scope · MUST
Asynchronous work is awaited, or started within a scope that waits for it, cancels it and receives its failures — work that must outlive its caller is started in a longer-lived scope, such as a supervisor; no task outlives every scope.

| Why | Tags |
|---|---|
| forgotten work fails where nobody listens, and a task no scope holds leaks resources and reports to nobody. | [errors] |

### outside-call-has-a-timeout · MUST
Every call across a process boundary has a timeout.

| Why | Tags |
|---|---|
| a call without a timeout can hang for ever and take its caller with it. | [errors, performance] |

### outside-call-can-be-cancelled · SHOULD
Every call across a process boundary can be cancelled by its caller.

| Why | Tags |
|---|---|
| a call that cannot be cancelled keeps working for a caller who left. | [performance] |

### call-takes-the-remaining-deadline · SHOULD
A call made for a unit of work that has a deadline — a request, a task — takes the time that unit has left, never a full timeout of its own, and is not made once none is left.

| Why | Tags |
|---|---|
| a nested call with a full timeout of its own keeps working after its caller has given up, and its answer reaches nobody. | [performance] |

### resource-released-on-every-path · MUST
A resource the code acquires — a handle, a connection, a lock, a subscription — is released on every way out, a failure’s included: one whose life is one scope by the language’s scoped form of release, one that outlives its scope by the owner that holds it.

| Why | Tags |
|---|---|
| a release written only on the path that succeeds leaks on the first failure, and the leak shows far from its cause. | [] |

### outside-read-bounded · MUST
Every read of a collection from outside the program — a query, a remote list, a queue, a file — has an explicit limit, and pages or refuses beyond it.

| Why | Tags |
|---|---|
| an unbounded read works on test data and fails in production when the data grows. | [performance] |

### outside-call-never-made-per-item · SHOULD
A loop makes no call across a process boundary per item where the other side answers the whole set in one call.

| Why | Tags |
|---|---|
| one call per item multiplies the latency and the load by the size of the set, and works only while the set is small. | [performance] |

### kept-collection-bounded · MUST
Every collection the program keeps beyond one operation — a cache, a queue, a buffer, a table of sessions — has a bound and says what happens at it: it evicts, refuses or makes the producer wait.

| Why | Tags |
|---|---|
| a collection that only grows works for days and then takes the process down, far from the code that filled it. | [performance] |

### concurrent-fan-out-bounded · MUST
Work started concurrently over a collection — calls, tasks, jobs — runs at most a set number at a time.

| Why | Tags |
|---|---|
| an unbounded fan-out over a large collection exhausts connections, memory and the quota of the system it calls. | [performance] |

### state-shared-by-concurrent-work-owned-or-guarded · MUST
State in the program's memory that concurrent work reaches is owned by one task and changed only through messages to it, changed only by atomic operations, or guarded by locks taken in one fixed order and never held while waiting on another system, save across one call that has a timeout and takes no other lock.

| Why | Tags |
|---|---|
| two tasks that change one value unguarded lose an update at random, and locks taken in two orders, or held while waiting on another system, deadlock under load. | [data, errors] |

### program-stops-cleanly · MUST
A program told to stop — by a termination signal or by its host — keeps taking the work routed to it until nothing routes work to it, then takes none, finishes or cancels the work in flight within a bound, releases its resources and exits; a second request to stop may end it at once, without the cleanup.

| Why | Tags |
|---|---|
| a program killed mid-work leaves half-written data and calls without an answer, and a stop with no bound hangs every deployment. | [errors, data] |

## Operations

### operation-idempotent-by-design · SHOULD
An operation that may be repeated is idempotent: a key is minted once per intent and sent with every attempt, child identifiers are derived deterministically, and a transition to the current state does nothing.

| Why | Tags |
|---|---|
| networks retry and users click twice; an idempotent operation turns a repeat into no change. | [data] |

### write-lands-whole · MUST
A write that changes several things — records, files, a record and the event or message that announces it to another part — lands whole or not at all, through one transaction, a finished temporary file renamed into place, or an outbox; one that cannot, such as a change to systems outside, is idempotent, so a rerun completes what a stop left half done.

| Why | Tags |
|---|---|
| a write that stops halfway leaves data no rule of the program expects, and nothing later can tell which half landed. | [data, errors] |

### write-on-read-data-is-conditional · MUST
A write decided on data read earlier, which another writer may change meanwhile, is made only if that data is still unchanged — checked by a version, a compare-and-set or a lock — and is refused otherwise.

| Why | Tags |
|---|---|
| two writers who read the same state otherwise overwrite each other, and the first update is lost without a trace. | [data] |

### multi-step-process-compensated · SHOULD
A business process that spans several programs or transactions keeps its state in a store, runs each step in a transaction of its own, and runs a compensating step for each step already done when a later one fails for good or a wait for a reply passes its deadline.

| Why | Tags |
|---|---|
| no transaction spans programs, so a process that fails midway is either undone step by step or left half done, and one whose state lives only in memory is lost with the process that held it. | [data, errors] |

### irreversible-operation-runs-dry-by-default · MUST
An operation run by hand or by a pipeline against a live system (one others use, or whose data outlives the task) — a script, a data fix, a migration, a deployment, an apply — that destroys data, spends money, changes the system or sends something outward runs only on an explicit confirmation of that run; without it, it shows what it would do. A command of the product whose one purpose is that effect, invoked by its user, and the reviewed change that sets off a pipeline’s deployment are that confirmation.

| Why | Tags |
|---|---|
| an irreversible operation run by mistake cannot be undone by a better test. | [security, ux] |

### shared-resource-has-one-writer · MUST
Every resource the program shares with its host — a signal’s handler, the exit code, the working directory, a standard stream — has one writer, a standard stream one per kind of record it carries: the logger for diagnostics, one writer for its user's output.

| Why | Tags |
|---|---|
| two writers of one resource overwrite each other in an order nobody chose. | [] |

## Records and configuration

### diagnostics-written-through-a-logger · MUST
Diagnostics are written only through a logger — the language’s standard one where it has one — whose sink may be a standard stream; code writes to a console or a standard stream directly only a command-line program’s output to its user or a protocol the program speaks over it, and no debug output or breakpoint ships.

| Why | Tags |
|---|---|
| one logger decides where diagnostics go and what they may carry, and stray output is noise that can leak what it prints. | [security] |

### configuration-parsed-once-at-start · MUST
Configuration is declared in one place and read only by its declared names, parsed once at start into a typed value the program receives; a missing or malformed setting fails the start, and a secret its host rotates is read again through the same declared name and type.

| Why | Tags |
|---|---|
| a setting checked where it is first used fails in the middle of a request, long after the deployment that broke it. | [security] |

### one-artefact-serves-every-environment · MUST
One artefact of a program a host of the project runs or serves — a server, a served bundle — is deployed to every environment; a setting that differs between them reaches it from its host, never built into it.

| Why | Tags |
|---|---|
| the artefact that was tested is then the one that runs, and nothing that belongs to one environment ships inside it. | [security] |

### behaviour-never-keyed-on-the-environments-name · SHOULD
The program's code never branches on the name of the environment it runs in — `production`, `staging`, `development`; what differs between environments is a setting named for what it changes — a log level, an address, a sandbox for a payment provider — declared in the configuration, by which the program also chooses an implementation.

| Why | Tags |
|---|---|
| a branch on the name runs code in one environment that no other runs, so what one environment proves says nothing of the next, while a named setting can be turned on wherever it is needed. | [] |
