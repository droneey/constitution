# Stages

> Governs the reconciliation stages of a reconciliation run, what each needs, what each reports and where its output lands.

## Vocabulary

A **reconciliation run** is one invocation of the program over its config file.

A reconciliation run's **reconciliation stages** are the steps of its pipeline, in order: validating the config file, rendering what it implies, planning the changes, which makes a **reconciliation plan**, and applying them, the **reconciliation apply**. A reconciliation stage is never a value's stage, as core's types chapter means one.

The **managed world** is what the program manages outside itself, and the **observed world** is the managed world as the program reads it.

## Running

### stage-runs-without-the-later-ones · SHOULD

Each reconciliation stage can be run without the later ones, as a step its user takes on its own.

| Why |
|---|
| a user who can run only the whole must touch the managed world, or install what applies it, to learn what a config file means. |

### later-stage-runs-the-earlier-ones → pipeline-steps-run-by-their-runner · SHOULD

Every reconciliation run asked for a reconciliation stage runs each one before it first, in order.

| Why |
|---|
| a later reconciliation stage that skips the earlier ones acts on something no earlier one showed or checked. |

### rendering-needs-only-the-config-file · SHOULD

The reconciliation stage that renders needs only the config file and the program's own files. It never needs the managed world or a tool that acts on it.

| Why |
|---|
| a rendering that needs the managed world or its tools cannot be run on a machine without access to them, so a user cannot see what a config file means before reaching the managed world. |

## Reports and output

### run-reports-per-stage · SHOULD

Every reconciliation run's report holds an entry for each of its reconciliation stages: skipped with its reason, unchanged, changed, ran or failed.

| Why |
|---|
| a report of the reconciliation run as a whole hides what happened to each part, and the user of a failed reconciliation run cannot tell where it ended. |

### run-output-in-one-work-folder · SHOULD

Everything a reconciliation run produces lands in one work folder of its own, apart from the config file. Such output includes rendered files and state records.

| Why |
|---|
| output scattered beside the config file mixes with what the user wrote, is committed or edited by mistake, and cannot be cleared or ignored as a whole. |

### run-output-holds-secrets-as-references → secret-kept-out-of-output · MUST

Every secret in what a reconciliation run writes is held only as a reference to it, never as its value. That holds wherever the output lands, in a rendered file, the reconciliation plan and the reconciliation run's state alike. The reference is the config file's secret reference or, for a secret the reconciliation apply generated, its name in the secret store.

| Why |
|---|
| a rendered file, a reconciliation plan or a state record is read by whoever reads where it lands, and a secret resolved into it leaks with every copy. |
