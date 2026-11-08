# Failures

> Governs the server's one handler of failures.

## General

### one-error-handler-registered-by-the-root → last-resort-handler-one-per-interface · MUST

The composition root registers one error handler on each server framework it mounts, which answers every failure that framework serves. It is the interface's handler of last resort, registered with the framework itself, so that it also answers a failure the framework raises before any operation runs.

| Why |
|---|
| a failure the framework raises before any operation runs escapes every handler but one the framework itself calls, and two handlers on one framework answer the same failure in two shapes. |

### operation-never-answers-its-own-failure → missing-refused-or-failed-answered-in-the-presentation · MUST

No operation of a served API answers a failure it raised or was returned. Every such failure reaches the error handler the composition root registered, which decides its answer.

| Why |
|---|
| an operation that answers its own failures gives them a shape of its own and may leave one unmasked, and what each failure answers is then decided in as many places as there are operations. |
