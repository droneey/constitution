# Stages

> Governs the stages in the tree.

## General

### each-stage-is-a-use-case-of-its-own · MUST

Each stage is a use case of its own, which leaves what a plan decides to the domain model. Validate, render, plan and apply are separate use cases, and what a plan decides — the difference between the config file and the observed world, and the kind of each change — is the domain model's, which the plan's use case asks.

| Why |
|---|
| stages joined in one use case are proven only together, and a difference computed outside the domain model is proven only against a world read for the spec. |
