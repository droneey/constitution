# Errors

> Governs a failure in Python: its `Raises:` section, its cause, the clauses and exception groups that catch it, and assert statements.

## Vocabulary

A **catch clause** is a clause of a `try` statement that catches a failure: an `except` clause, or an `except*` clause, which catches the members of an exception group.

## General

### assert-statement-only-in-specs · MUST

No production code checks anything with an `assert` statement. A check it makes is an `if` that raises.

| Why |
|---|
| an interpreter run with optimisation strips every `assert`, so a check written as one vanishes from that run. |

## Kinds of failure

### expected-failure-named-in-raises → expected-failure-documented-where-no-signature-names-it · SHOULD

Every expected failure is named in the `Raises:` section of its function's docstring. Each entry gives the failure's type, then the condition it arises in.

| Why |
|---|
| Python has no checked exceptions, so no annotation names a failure, and one named anywhere but `Raises:` is missed by `help()`, the editor and the documentation generators that read that section as the failures, and by the caller who relies on them. |

## Catching and carrying

### except-clause-names-what-it-handles → catch-handles-only-what-it-recognises · MUST

Every catch clause names the exception types it handles. Exempt: a handler of last resort, a supervisor and the place where an optional part is called, whose clause may be bare or catch `Exception` or `BaseException`.

| Why |
|---|
| a broad clause catches the defects it never meant to handle along with the failure it did, and, bare or as `BaseException`, the cancellation too. |

### except-never-only-passes → failure-never-dropped-unread · MUST

No catch clause's body is only `pass`, `...` or `continue`. A failure ignored on purpose is ignored by `contextlib.suppress`, with its reason in a comment beside it.

| Why |
|---|
| such a body swallows every failure its clause catches, unseen and with no reason given, while `suppress` names the one it ignores and carries the reason where a reader sees it. |

### exception-group-caught-by-except-star → catch-handles-only-what-it-recognises · MUST

Every failure out of a task group that the code catches is caught by an `except*` clause. The clause names the types it handles, and the rest of the group propagates.

| Why |
|---|
| a task group raises an `ExceptionGroup`, which a plain `except` of a member type never matches, so the failure passes unhandled or is swallowed by a broad clause. |

### mapped-error-raised-from-its-cause → error-keeps-its-cause · MUST

Every exception raised inside a catch clause to map the one caught is raised `from` it.

| Why |
|---|
| an exception raised without `from` prints as a second failure that happened during handling, not as the mapping of the first, so its reader hunts a bug in the handler that is not there. |
