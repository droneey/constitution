# Feature flags

> Governs a feature flag's end: the condition it declares for its removal and its retirement.

## Vocabulary

A **feature flag** is a setting that switches a behaviour on or off where the program runs.

## General

### feature-flag-retired-once-settled · SHOULD

Every feature flag is retired once it is settled. Once it serves one value everywhere, it is removed with the branch it no longer takes.

| Why |
|---|
| a flag that serves one value everywhere is a branch that never runs, and it hides from every tool because it is still read. |

### feature-flag-declares-its-removal-condition · SHOULD

Every feature flag's declaration records the condition for its removal.

| Why |
|---|
| a flag whose end nobody wrote down is never known to have settled, so it stays, and the branches it guards are kept alive with it. |
