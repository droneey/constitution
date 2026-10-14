# API

> Governs the server's one handler of failures.

## Failures

### one-error-handler-registered-by-the-root → last-resort-handler-one-per-entry · MUST
The composition root registers one handler on each server framework it mounts, and that handler answers every failure of every request the framework serves; no route or tool catches a failure to answer it itself.

| Why | Tags |
|---|---|
| every failure leaves in one shape and is masked in one place, and a failure the framework raises before any route runs is answered like the rest. | [errors, security] |
