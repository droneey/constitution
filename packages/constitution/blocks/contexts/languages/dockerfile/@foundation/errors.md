# Errors

> Governs a failure in an image's build: how a step that pipes fails.

## Catching and carrying

### piped-run-under-pipefail → failure-never-dropped-unread · MUST

Every `RUN` that pipes runs under a `SHELL` that sets `-o pipefail`.

| Why |
|---|
| a `RUN` line is no script that sets its own shell flags, and without `pipefail` a program that fails before a pipe's last one leaves a broken result that the build reports as built. |
