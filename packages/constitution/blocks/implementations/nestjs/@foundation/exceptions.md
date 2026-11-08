# Exceptions

> Governs Nest's HTTP exceptions in the program's code.

## General

### nest-http-exception-never-thrown → error-carries-a-code-never-a-status · MUST

No code of the program throws `HttpException` or one of its subclasses. It throws the errors of its error library.

| Why |
|---|
| an `HttpException` carries a status and no code, so no caller can branch on it, and it ties the code that throws it to HTTP. |
