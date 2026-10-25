# Errors

> Governs how a build step fails.

## Catching and carrying

### shell-steps-fail-on-any-error → catch-handles-only-what-it-recognises · MUST

A `RUN` that pipes sets `-o pipefail` through `SHELL`.

| Why |
|---|
| without it a failing command before a pipe leaves a broken layer that the build reports as built. |
