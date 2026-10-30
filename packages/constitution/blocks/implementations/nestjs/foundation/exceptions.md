# Exceptions

> Governs Nest's HTTP exceptions in the program's code.

## General

### program-throws-no-http-exception → error-carries-a-code-never-a-status · MUST

The program throws the error kit's errors, never `HttpException` or one of its subclasses.

| Why |
|---|
| an `HttpException` carries a status and no code, and ties the code that throws it to HTTP. |
