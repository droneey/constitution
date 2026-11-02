# Failures

> Governs the server's one handler of failures.

## General

### one-error-handler-registered-by-the-root → last-resort-handler-one-per-entry · MUST

The composition root registers one error handler on each server framework it mounts. That handler answers every failure of every request the framework serves; no operation catches a failure to answer it itself.

| Why |
|---|
| an operation that answers its own failures gives them a shape of its own and may leave one unmasked, and a failure the framework raises before any operation runs then escapes them all; what each failure answers, which is what its caller gets, is proven with the binding unit that decides it. |
