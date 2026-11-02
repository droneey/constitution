# Errors

> Governs a failure in an image's build: how a build step fails.

## Catching and carrying

### piped-run-fails-on-any-failed-command → catch-handles-only-what-it-recognises · MUST

A `RUN` that pipes fails when any command of its pipe fails. It sets `-o pipefail` through `SHELL`.

| Why |
|---|
| without it a failing command before a pipe leaves a broken layer that the build reports as built. |
