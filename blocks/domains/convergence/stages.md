# Stages

> Governs the stages of a run and what each reports.

## Stages

### stages-run-alone · SHOULD
Validating, rendering, planning and applying are stages a user runs alone, and each later stage runs the earlier ones first.

| Why | Tags |
|---|---|
| a user can check, preview and plan without touching the world, and a later stage builds on exactly what an earlier one showed. | [] |

### rendering-runs-no-engine · SHOULD
Rendering turns the config file into what it implies, from the file and the program's own files alone, and runs no engine.

| Why | Tags |
|---|---|
| a user previews what a config file means without any engine installed and without reaching the world. | [] |

## Reports and output

### run-reports-per-stage · SHOULD
A run's report holds an entry for each stage: skipped with its reason, unchanged, changed, ran or failed.

| Why | Tags |
|---|---|
| the user sees what happened to each part, and where a failed run stopped. | [ux, errors] |

### run-output-in-one-work-folder · SHOULD
What a run produces — rendered files, records of state — lands in one work folder, apart from the config file.

| Why | Tags |
|---|---|
| rendered files and state never mix with the config file, and one folder is cleared or ignored as a whole. | [] |
