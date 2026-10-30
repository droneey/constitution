# Errors

> Governs a failure in TypeScript: its throws tag, its cause, the caught value, and try and finally blocks.

## Kinds of failure

### expected-failure-named-by-a-throws-tag → expected-failure-named-where-callers-read-it · MUST

An expected failure is named in a `@throws` tag of the function's JSDoc, its type in braces and then its condition: `@throws {OrderNotFoundError} when no order has the id`.

| Why |
|---|
| TypeScript has no checked exceptions, so its signatures name no failure; the tag is where the editor shows one to a caller, and its braces name the type the caller recognises the failure by. |

## Catching and carrying

### mapped-error-passes-its-cause → error-keeps-its-cause · MUST

An error that maps another passes it in the `cause` option of its constructor — `new OrderNotFoundError(message, { cause })` — and an error class hands that option on to `super`.

| Why |
|---|
| the standard `cause` is the one runtimes, loggers and debuggers print in the chain, so the original failure stays visible under the one that replaced it. |

### caught-value-recognised-before-use → catch-handles-only-what-it-recognises · MUST

A `catch` reads its value, typed `unknown`, only after `instanceof` or the error library's guard has recognised it.

| Why |
|---|
| anything can be thrown, by the program's dependencies too, so a caught value read as an `Error` without a check fails a second time inside the handler meant for the first. |

### return-awaited-inside-try → catch-handles-only-what-it-recognises · MUST

Inside a `try`, a returned promise is awaited — `return await` — so its rejection reaches the `catch`.

| Why |
|---|
| without the `await`, the function has returned before the promise rejects, so its `catch` never runs and the raw failure passes unmapped. |

### finally-never-leaves-by-a-jump → catch-handles-only-what-it-recognises · MUST

A `finally` block never leaves by `return`, `break`, `continue` or `throw`.

| Why |
|---|
| a jump out of `finally` replaces the failure in flight, so the error vanishes without any `catch` having recognised it. |
