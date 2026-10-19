# Errors

> Governs causes, caught values, try and finally blocks, and the throws tag.

## Kinds of failure

### expected-failure-named-by-a-throws-tag → expected-failure-is-part-of-the-contract · SHOULD

A function that throws an expected failure names its type in a `@throws` tag of its JSDoc — `@throws {@link OrderNotFoundError} when no order has the id` — beside the one named type of its failures.

| Why | Tags |
|---|---|
| TypeScript has no checked exceptions, so no signature can say what a function throws and no compiler holds it; the tag is where the editor shows it to every caller. | [errors] |

## Catching and carrying

### mapped-error-passes-its-cause → error-keeps-its-cause · MUST

An error that maps another passes it in the `cause` option of its constructor — `new OrderNotFoundError(message, { cause })` — and an error class hands that option on to `super`.

| Why | Tags |
|---|---|
| the standard `cause` is the one runtimes, loggers and debuggers print in the chain, so the original failure stays visible under the one that replaced it. | [] |

### caught-value-recognised-before-use → catch-handles-only-what-it-recognises · MUST

A `catch` reads its value, typed `unknown`, only after `instanceof` or the error library's guard has recognised it.

| Why | Tags |
|---|---|
| anything can be thrown, by the program's dependencies too, so a caught value read as an `Error` without a check fails a second time inside the handler meant for the first. | [] |

### return-awaited-inside-try → catch-handles-only-what-it-recognises · MUST

Inside a `try`, a returned promise is awaited — `return await` — so its rejection reaches the `catch`.

| Why | Tags |
|---|---|
| without the `await`, the function has returned before the promise rejects, so its `catch` never runs and the raw failure passes unmapped. | [errors] |

### finally-never-leaves-by-a-jump → catch-handles-only-what-it-recognises · MUST

A `finally` block never leaves by `return`, `break`, `continue` or `throw`.

| Why | Tags |
|---|---|
| a jump out of `finally` replaces the failure in flight, so the error vanishes without any `catch` having recognised it. | [errors] |
