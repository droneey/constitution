# Effects

> Governs task groups, timeouts, cancellation, blocking calls, resources, locks and loggers.

## Calls and resources

### concurrent-work-started-in-a-task-group → async-work-awaited-or-held-by-a-scope · MUST

Concurrent work starts in a task group. The group is `asyncio.TaskGroup`, or the one of the async library the project uses, and no work starts by a bare `asyncio.create_task`, `ensure_future` or `gather`.

| Why |
|---|
| a bare task is dropped or fails unseen, while a task group waits for its tasks, cancels the rest on the first failure and raises every failure together — structured concurrency. |

### deadline-by-a-timeout-scope → outside-call-has-a-timeout · MUST

Awaited work across a process boundary runs inside a timeout scope, and a synchronous call passes its client's `timeout=`. This holds where the client does not bound the work itself, and the scope is `asyncio.timeout`, or the async library's own.

| Why |
|---|
| an awaited call with no bound holds its task for as long as the other side stays silent, while a scope cancels everything awaited inside it once the deadline passes and raises at its edge, so one deadline covers a whole exchange of calls. |

### cancellation-always-re-raised → async-work-awaited-or-held-by-a-scope · MUST

A caught cancellation is re-raised. A clause that catches `asyncio.CancelledError`, or the cancellation exception of the async library the project uses, or a base class of either, re-raises it once its cleanup is done.

| Why |
|---|
| a swallowed cancellation leaves the task running after its scope gave up on it, and the scope's timeout and task group stop working. |

### resource-held-by-with → resource-released-on-every-path · MUST

A resource is acquired by `with` or `async with`. Such a resource is a file, a connection, a lock or a client, and a number of them known only at run time is held through `contextlib.ExitStack` or `AsyncExitStack`.

| Why |
|---|
| a resource released by a call written after its use leaks when a failure or a cancellation leaves the block first, while the block's exit releases it however the block is left. |

### thread-shared-state-guarded-by-a-lock → state-shared-by-concurrent-work-owned-or-guarded · MUST

State that threads share is owned by one thread or guarded by a `threading.Lock`. This holds even where an operation looks atomic, and no code relies on the global interpreter lock for it.

| Why |
|---|
| the free-threaded build runs threads truly in parallel, and even under the global interpreter lock a `+=` or a check-then-set is several steps another thread can split, so an update guarded by neither is lost at random. |

### async-functions-never-block · SHOULD

An `async def` function makes no blocking call. Such a call is a synchronous file or network read, `time.sleep` or a synchronous client; blocking work runs in a thread through `asyncio.to_thread` or the framework's own.

| Why |
|---|
| one blocking call in a coroutine stalls everything else the event loop runs. |

## Records and configuration

### logger-got-by-module-name → diagnostics-written-through-a-logger · MUST

A module writes its diagnostics through a logger got by `logging.getLogger(__name__)`.

| Why |
|---|
| a logger got by another name, such as the root's or one shared by several modules, gives its records a name that is not their module's, so levels and sinks cannot be set per package and a record does not say where it came from. |
