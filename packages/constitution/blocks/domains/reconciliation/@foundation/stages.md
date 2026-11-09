# Stages

> Governs the reconciliation stages of a reconciliation run, what each needs, what each reports and where its output lands.

## Vocabulary

A **reconciliation run** is one invocation of the program over its config file.

A reconciliation run's **reconciliation stages** are the steps of its pipeline, in order: validating the config file, rendering what it implies, planning the changes, which makes a **reconciliation plan**, and applying them, the **reconciliation apply**. A reconciliation stage is never a value's stage, as core's types chapter means one.

The **managed world** is what the program manages outside itself, and the **observed world** is the managed world as the program reads it.

## Running

### stage-runs-without-the-later-ones · SHOULD

Each reconciliation stage can be run without the later ones, as a step its user takes on its own.

#### Why

A user who can run only the whole must touch the managed world, or install what applies it, to learn what a config file means.

#### Examples

```text title="Avoid"
$ sitectl --help
Commands:
  apply   Reach the state site.config declares
```

```text title="Prefer"
$ sitectl --help
Commands:
  validate   Check site.config
  render     Write what site.config implies
  plan       Show the changes that reach it
  apply      Carry out those changes
```

### later-stage-runs-the-earlier-ones → pipeline-steps-run-by-their-runner · SHOULD

Every reconciliation run asked for a reconciliation stage runs each one before it first, in order.

#### Why

A later reconciliation stage that skips the earlier ones acts on something no earlier one showed or checked.

#### Examples

```pseudo title="Avoid"
# sites/presentation/bindings/queries/plan
function runPlan(configPath, planSite, context)
  let config = readConfig(configPath)

  return planSite({ config }, context)
```

```pseudo title="Prefer"
# sites/presentation/bindings/queries/plan
function runPlan(configPath, { checkConfig, renderConfig, planSite }, context)
  let config = readConfig(configPath)
  let validated = checkConfig({ config }, context)
  let rendered = renderConfig({ config: validated }, context)

  return planSite({ config: validated, rendered }, context)
```

### rendering-needs-only-the-config-file · SHOULD

The reconciliation stage that renders needs only the config file and the program's own files. It never needs the managed world or a tool that acts on it.

#### Why

A rendering that needs the managed world or its tools cannot be run on a machine without access to them, so a user cannot see what a config file means before reaching the managed world.

#### Examples

```pseudo title="Avoid"
# sites/application/use-cases/queries/render-config.use-case
function createRenderConfig({ dnsProvider })
  return function(input, context)
    let zone = dnsProvider.findZone(input.config.domain, context)

    return input.config.records.map(record => renderRecord(record, zone.id))
```

```pseudo title="Prefer"
# sites/application/use-cases/queries/render-config.use-case
function createRenderConfig({ templates })
  return function(input, context)
    return input.config.records.map(record =>
      renderRecord(record, input.config.domain, templates))
```

## Reports and output

### run-reports-per-stage · SHOULD

Every reconciliation run's report holds an entry for each of its reconciliation stages: skipped with its reason, unchanged, changed, ran or failed.

#### Why

A report of the reconciliation run as a whole hides what happened to each part, and the user of a failed reconciliation run cannot tell where it ended.

#### Examples

```text title="Avoid"
$ sitectl apply site.config
error: run failed
```

```text title="Prefer"
$ sitectl apply site.config
validate   unchanged
render     changed    3 files
plan       failed     zone shop.example did not answer
apply      skipped    no plan to apply
```

### run-output-in-one-work-folder · SHOULD

Everything a reconciliation run produces lands in one work folder of its own, apart from the config file. Such output includes rendered files and state records.

#### Why

Output scattered beside the config file mixes with what the user wrote, is committed or edited by mistake, and cannot be cleared or ignored as a whole.

#### Examples

```text title="Avoid"
site/
├── site.config
├── rendered/
│   ├── records
│   └── buckets
├── last-plan.json
└── state.json
```

```text title="Prefer"
site/
├── site.config
└── .sitectl/
    ├── rendered/
    │   ├── records
    │   └── buckets
    ├── last-plan.json
    └── state.json
```

### run-output-holds-secrets-as-references → secret-kept-out-of-output · MUST

Every secret in what a reconciliation run writes is held only as a reference to it, never as its value. That holds wherever the output lands, in a rendered file, the reconciliation plan and the reconciliation run's state alike. The reference is the config file's secret reference or, for a secret the reconciliation apply generated, its name in the secret store.

#### Why

A rendered file, a reconciliation plan or a state record is read by whoever reads where it lands, and a secret resolved into it leaks with every copy.

#### Examples

```text title="Avoid"
# .sitectl/rendered/buckets
bucket invoices
  region: eu-central
  access-key: <the key itself>
```

```text title="Prefer"
# .sitectl/rendered/buckets
bucket invoices
  region: eu-central
  access-key: secret-store:buckets/invoices-access-key
```
