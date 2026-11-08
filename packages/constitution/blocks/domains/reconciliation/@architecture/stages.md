# Stages

> Governs the reconciliation stages in the tree.

## General

### each-stage-is-a-use-case-of-its-own → operation-has-a-use-case · SHOULD

Each reconciliation stage is a use case of its own, never joined with another in one.

#### Why

Reconciliation stages joined in one use case are proven only together, and none can be run or changed alone.

#### Examples

```text title="Avoid"
features/sites/application/use-cases/
└── commands/
    └── reconcile/
        └── reconcile.use-case
```

```text title="Prefer"
features/sites/application/use-cases/
├── queries/
│   ├── check-config/
│   ├── render-config/
│   └── plan-site/
└── commands/
    └── apply-plan/
```

### plan-difference-decided-by-the-domain-model → use-case-leaves-decisions-to-the-domain-model · MUST

Every reconciliation plan's difference is decided by the domain model, which the reconciliation plan's use case asks. That is the difference between the config file and the observed world, and the kind of each change.

#### Why

A difference computed outside the domain model is proven only against a world read for the spec.

#### Examples

```pseudo title="Avoid"
# sites/application/use-cases/queries/plan-site.use-case
function createPlanSite({ world })
  return function(input, context)
    let observed = world.observe(input.config.target, context)

    return input.config.records
      .filter(record => not matches(observed.record(record.name), record))
      .map(record => observed.hasRecord(record.name) ? update(record) : create(record))
```

```pseudo title="Prefer"
# sites/application/use-cases/queries/plan-site.use-case
function createPlanSite({ world })
  return function(input, context)
    let observed = world.observe(input.config.target, context)

    return planChanges(input.config, observed)

# sites/domain/plan/services/plan-changes.service
function planChanges(config, observed)
  return config.records.map(record =>
    planRecord(record, observed.record(record.name)))
```
