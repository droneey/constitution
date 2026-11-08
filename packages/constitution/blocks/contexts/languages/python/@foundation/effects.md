# Effects

> Governs task groups, timeouts, cancellation, blocking calls, resources and locks.

## Calls and resources

### async-work-started-in-a-task-group → async-work-awaited-or-held-by-a-scope · MUST

Every task started to run concurrently starts in a task group. The group is `asyncio.TaskGroup`, or the one of the async library the project uses, and no task starts by a bare `asyncio.create_task`, `ensure_future` or `gather`.

| Why |
|---|
| a bare task is dropped or fails unseen, while a task group waits for its tasks, cancels the rest on the first failure and raises every failure together — structured concurrency. |

### deadline-by-a-timeout-scope → outside-call-has-a-timeout · MUST

Every call across a process boundary is bounded by a timeout scope or by its client's `timeout=`. Awaited work runs inside `asyncio.timeout`, or the async library's own scope, and a synchronous call passes `timeout=`. Exempt: a call whose client bounds the work itself.

| Why |
|---|
| an awaited call with no bound holds its task for as long as the other side stays silent, while a scope cancels everything awaited inside it once the deadline passes and raises where it ends, so one deadline covers a whole exchange of calls. |

### cancellation-always-re-raised → async-work-awaited-or-held-by-a-scope · MUST

Every caught cancellation is re-raised. A catch clause that catches `asyncio.CancelledError`, the cancellation exception of the async library the project uses or a base class of either re-raises it once its cleanup is done.

| Why |
|---|
| a swallowed cancellation leaves the task running after its scope gave up on it, and the scope's timeout and task group stop working. |

### resource-held-by-with → scoped-resource-released-by-the-scoped-form · MUST

Every resource whose life is one block of code is acquired by `with` or `async with`. Such a resource is a file, a connection, a lock or a client, and a number of them known only at run time is held through `contextlib.ExitStack` or `AsyncExitStack`.

| Why |
|---|
| a resource released by a call written after its use leaks when a failure or a cancellation leaves the block first, while the block's exit releases it however the block is left. |

### thread-shared-state-guarded-by-a-lock → state-shared-by-concurrent-work-owned-or-guarded · MUST

All state that threads share is owned by one thread or guarded by a `threading.Lock`. This holds even where an operation looks atomic, and no code relies on the global interpreter lock for it.

| Why |
|---|
| the free-threaded build runs threads truly in parallel, and even under the global interpreter lock a `+=` or a check-then-set is several steps another thread can split, so an update guarded by neither is lost at random. |

### async-functions-never-block · MUST

No `async def` function makes a blocking call. Such a call is a synchronous file or network read, `time.sleep` or a synchronous client, and blocking work runs in a thread through `asyncio.to_thread` or the framework's own.

| Why |
|---|
| one blocking call in a coroutine stalls everything else the event loop runs. |
