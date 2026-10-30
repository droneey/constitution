# Errors

> Governs a failure in Python: its `Raises:` section, its cause, the except clauses and exception groups that catch it, finally blocks and assert statements.

## General

### assert-statement-only-in-specs · MUST

Production code checks no input, invariant or state with an `assert` statement; it raises an error of the program's own.

| Why |
|---|
| an interpreter run with optimisation strips every `assert`, so a check written as one vanishes from that run. |

## Kinds of failure

### expected-failure-named-in-raises → expected-failure-named-where-callers-read-it · MUST

An expected failure is named in the `Raises:` section of the function's docstring, its type and then its condition: `OrderNotFoundError: when no order has the id.`

| Why |
|---|
| Python has no checked exceptions, so its annotations name no failure; `Raises:` is the section of the Google form that `help()`, the editor and documentation generators read as the failures. |

## Catching and carrying

### except-clause-names-what-it-handles → catch-handles-only-what-it-recognises · MUST

An `except` clause names the exception types it handles; a bare `except:`, or one that catches `Exception` or `BaseException`, stands only in a handler of last resort, at a supervisor or at the boundary of an optional part.

| Why |
|---|
| a broad clause catches the defects it never meant to handle along with the failure it did — and, bare or as `BaseException`, the cancellation too. |

### except-never-only-passes → catch-handles-only-what-it-recognises · MUST

No `except` body is only `pass`, `...` or `continue`; a failure ignored on purpose is ignored by `contextlib.suppress`, with its reason in a comment beside it.

| Why |
|---|
| these are the bodies that swallow every failure the clause catches, while `suppress` names the one it ignores and carries the reason where a reader sees it. |

### exception-group-caught-by-except-star → catch-handles-only-what-it-recognises · MUST

A failure out of a task group is caught by `except*` naming the types it handles, and the rest of the group propagates.

| Why |
|---|
| a task group raises an `ExceptionGroup`, which a plain `except` of a member type never matches, so the failure passes unhandled or is swallowed by a broad clause. |

### mapped-error-raised-from-its-cause → error-keeps-its-cause · MUST

An exception raised inside an `except` clause to map the one caught is raised `from` it: `raise OrderNotFoundError(order_id) from error`.

| Why |
|---|
| `from` records the caught exception as the direct cause, so both tracebacks print together and the new one never reads as an accident during handling. |

### finally-never-left-by-a-jump → catch-handles-only-what-it-recognises · MUST

A `finally` block is never left by `return`, `break` or `continue`.

| Why |
|---|
| a jump out of `finally` silently discards the exception in flight, which is why Python 3.14 warns of it. |
