# Stages

> Governs the stages in the tree.

## Stages

### stages-validate-render-plan-apply · SHOULD
Validate, render, plan and apply are separate use cases, and a later one calls the earlier ones.

| Why | Tags |
|---|---|
| each stage is then tested on its own, and a later one cannot drift from what an earlier one checked. | [] |
