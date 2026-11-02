# Tasks

> Governs the names of the tasks, the tasks that run the others, and what `constitution run` runs.

## General

### task-group-run-by-its-prefix → one-check-runs-every-tool · MUST

A task named by an action alone runs every task of its prefix, never a list kept by hand. Every task is named by its action first — `check:<what>`, `test:<what>`, `fix:<what>` — and a prefix's tasks run in the order of their names, save where they run at once. An action run only by the check or by hand has no task named by the action alone, and a task that is only part of another, or a helper of one, is named outside every prefix.

| Why |
|---|
| a list kept by hand misses the next task added under its prefix, which then never runs, and a part or a helper named under a prefix runs twice or on its own by accident — the open–closed principle. |

### check-task-is-the-units-whole-gate → one-check-runs-every-tool · MUST

The check task is the unit's whole gate. It runs its group, then the specs, then the mutation gate on the lines a change touches, each where the unit has it.

| Why |
|---|
| a gate split over several tasks is run in part, and a unit passes by the half someone remembered to run, with `constitution` or without it. |

### unit-run-through-its-action-tasks → one-check-runs-every-tool · MUST

`constitution run` runs each unit's own action tasks, through its runner. The runner gives `constitution run` the commands that run a unit's tasks named by the actions check, test and fix alone, so it runs the same tasks in every unit.

| Why |
|---|
| a command that ran each runner its own way would check a unit by other tasks than the ones its person runs, so the unit could pass one and fail the other; through the runner, one command checks every unit of the repository by the unit's own tasks. |
