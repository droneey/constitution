# Stages

> Governs the stages in the tree.

## General

### each-stage-is-a-use-case-of-its-own · SHOULD

Validate, render, plan and apply are separate use cases, and what a plan decides — the difference between the config file and the observed world, and the kind of each change — is the model's, which the plan's use case asks.

| Why |
|---|
| each stage is then tested on its own, and the difference is proven without the world it was read from. |
