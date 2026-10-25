# Effects

> Governs task groups, timeouts, cancellation, blocking calls, resources, locks and loggers.

## Calls and resources

### concurrent-work-started-in-a-task-group → async-work-awaited-or-held-by-a-scope · MUST

Concurrent work starts in a task group — `asyncio.TaskGroup`, or the one of the async library the project uses — never by a bare `asyncio.create_task`, `ensure_future` or `gather`.

| Why |
|---|
| a task group waits for its tasks, cancels the rest on the first failure and raises every failure together, where a bare task is dropped or fails unseen. |

### deadline-by-a-timeout-scope → outside-call-has-a-timeout · MUST

Awaited work across a process boundary that its client does not bound itself runs inside a timeout scope — `asyncio.timeout`, or the async library's own — and a synchronous call across one passes its client's `timeout=`.

| Why |
|---|
| a scope cancels everything awaited inside it once the deadline passes and raises at its edge, so one deadline covers a whole exchange of calls. |

### cancellation-always-re-raised → async-work-awaited-or-held-by-a-scope · MUST

A clause that catches `asyncio.CancelledError`, or the cancellation exception of the async library the project uses, or a base class of either, re-raises it once its cleanup is done.

| Why |
|---|
| a swallowed cancellation leaves the task running after its scope gave up on it, and the scope's timeout and task group stop working. |

### resource-held-by-with → resource-released-on-every-path · MUST

A resource — a file, a connection, a lock, a client — is acquired by `with` or `async with`, and a number of them known only at run time through `contextlib.ExitStack` or `AsyncExitStack`.

| Why |
|---|
| the block's exit releases it however the block is left, a failure or a cancellation included. |

### thread-shared-state-guarded-by-a-lock → state-shared-by-concurrent-work-owned-or-guarded · MUST

State that threads share is owned by one thread or guarded by a `threading.Lock`, even where an operation looks atomic; no code relies on the global interpreter lock for it.

| Why |
|---|
| the free-threaded build runs threads truly in parallel, and even under the lock a `+=` or a check-then-set is several steps another thread can split. |

### async-functions-never-block · SHOULD

An `async def` function makes no blocking call — a synchronous file or network read, `time.sleep`, a synchronous client — and runs blocking work in a thread through `asyncio.to_thread` or the framework's own.

| Why |
|---|
| one blocking call in a coroutine stalls everything else the event loop runs. |

## Records and configuration

### logger-got-by-module-name → diagnostics-written-through-a-logger · MUST

A module writes its diagnostics through a logger got by `logging.getLogger(__name__)`.

| Why |
|---|
| the logger's name is then the module's path, so the root sets levels and sinks per package, and every record says where it came from. |
