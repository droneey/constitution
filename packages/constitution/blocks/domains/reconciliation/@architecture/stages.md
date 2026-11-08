# Stages

> Governs the reconciliation stages in the tree.

## General

### each-stage-is-a-use-case-of-its-own → operation-has-a-use-case · SHOULD

Each reconciliation stage is a use case of its own, never joined with another in one.

| Why |
|---|
| reconciliation stages joined in one use case are proven only together, and none can be run or changed alone. |

### plan-difference-decided-by-the-domain-model → use-case-leaves-decisions-to-the-domain-model · MUST

Every reconciliation plan's difference is decided by the domain model, which the reconciliation plan's use case asks. That is the difference between the config file and the observed world, and the kind of each change.

| Why |
|---|
| a difference computed outside the domain model is proven only against a world read for the spec. |
