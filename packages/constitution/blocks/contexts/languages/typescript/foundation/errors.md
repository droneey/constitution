# Errors

> Governs a failure in TypeScript: its throws tag, its cause, the caught value, and try blocks.

## Kinds of failure

### expected-failure-named-by-a-throws-tag → expected-failure-documented-where-no-signature-names-it · MUST

An expected failure is named in a `@throws` tag of the function's JSDoc. The tag gives the failure's type in braces and then its condition: `@throws {<Error>} when <condition>`.

| Why |
|---|
| TypeScript has no checked exceptions, so its signatures name no failure, and a failure named nowhere else is one its caller learns of only when it is thrown; the tag is where the editor shows it to a caller, and its braces name the type the caller recognises it by. |

## Catching and carrying

### mapped-error-passes-its-cause → error-keeps-its-cause · MUST

An error that maps another passes it in the `cause` option of its constructor. An error class hands that option on to `super`.

| Why |
|---|
| a cause kept anywhere but the standard `cause` is missed by the runtimes, loggers and debuggers that print the chain, so the original failure vanishes under the one that replaced it. |

### caught-value-recognised-before-use → catch-handles-only-what-it-recognises · MUST

A `catch` reads its value only once it is recognised. The value is typed `unknown`, and read only after `instanceof` or the error library's guard has recognised it.

| Why |
|---|
| anything can be thrown, by the program's dependencies too, so a caught value read as an `Error` without a check fails a second time inside the handler meant for the first. |

### return-awaited-inside-try → catch-handles-only-what-it-recognises · MUST

Inside a `try`, a returned promise is awaited — `return await` — so its rejection reaches the `catch`.

| Why |
|---|
| without the `await`, the function has returned before the promise rejects, so its `catch` never runs and the raw failure passes unmapped. |
