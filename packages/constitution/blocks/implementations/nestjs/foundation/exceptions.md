# Exceptions

> Governs Nest's HTTP exceptions.

## General

### nest-exceptions-answered-by-their-kind → failure-answered-by-its-code · MUST

An `HttpException` Nest throws before a controller runs — the `NotFoundException` of an unknown route or method, the `BadRequestException` of a malformed body — is answered as the kind its status maps to.

| Why |
|---|
| Nest throws these with no code of the error kit, so their answer takes its kind from their status, and the caller learns what to correct. |

### program-throws-no-http-exception → error-carries-a-code-never-a-status · MUST

The program throws the error kit's errors, never `HttpException` or one of its subclasses.

| Why |
|---|
| an `HttpException` carries a status and no code, and ties the code that throws it to HTTP. |
