# Stages

> Governs the stages of a run and what each reports.

## General

### stages-run-alone · SHOULD

Each stage of a run can be run without the ones after it, rendering without any engine. Validating, rendering, planning and applying are stages a user runs on their own, each later stage running the earlier ones first; rendering needs only the config file and the program's own files, never an engine or the world.

| Why |
|---|
| a user who can run only the whole must touch the world, or install what applies it, to learn what a config file means, and a later stage that skips the earlier ones acts on something no stage showed. |

## Reports and output

### run-reports-per-stage · SHOULD

A run reports per stage. Its report holds an entry for each stage: skipped with its reason, unchanged, changed, ran or failed.

| Why |
|---|
| a report of the run as a whole hides what happened to each part, and the user of a failed run cannot tell where it stopped. |

### run-output-in-one-work-folder · SHOULD

A run's output lands in one work folder. What a run produces — rendered files, records of state — lands there, apart from the config file.

| Why |
|---|
| output scattered beside the config file mixes with what the user wrote, is committed or edited by mistake, and cannot be cleared or ignored as a whole. |

### work-folder-keeps-secrets-as-references · MUST

The work folder keeps a secret only as a reference. What a run writes there — rendered files, its plan, its state — holds a secret only as a reference by name, or the folder is encrypted and never shared.

| Why |
|---|
| a rendered file or a state file is read by whoever reads the folder, and a secret resolved into it leaks with every copy. |
