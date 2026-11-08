# Errors

> Governs a failure in TypeScript: its throws tag, its cause and the caught value.

## Kinds of failure

### expected-failure-named-by-a-throws-tag → expected-failure-documented-where-no-signature-names-it · SHOULD

Every expected failure a function throws is named in a `@throws` tag of its JSDoc. The tag gives the failure's type in braces and then its condition: `@throws {<Error>} when <condition>`.

| Why |
|---|
| TypeScript has no checked exceptions, so its signatures name no failure, and a failure named nowhere else is one its caller learns of only when it is thrown; the tag is where the editor shows it to a caller, and its braces name the type the caller recognises it by. |

## Catching and carrying

### cause-passed-in-the-cause-option → error-keeps-its-cause · MUST

Every error that maps another passes it in the `cause` option of its constructor.

| Why |
|---|
| a cause kept anywhere but the standard `cause` is missed by the runtimes, loggers and debuggers that print the chain, so the original failure vanishes under the one that replaced it. |

### error-class-hands-its-cause-to-super → error-keeps-its-cause · MUST

Every error class whose constructor takes the `cause` option hands that option on to `super`.

| Why |
|---|
| a class that takes the option and keeps it from `super` drops the cause its caller passed, so the chain ends at the new error though every call site passed the old one. |

### caught-value-narrowed-by-instanceof-or-a-guard → catch-handles-only-what-it-recognises · MUST

Every `catch` reads its value only once `instanceof` or the error library's guard has recognised it.

| Why |
|---|
| anything can be thrown, by the program's dependencies too, so a caught value read as an `Error` without a check fails a second time inside the handler meant for the first. |
