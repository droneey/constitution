# Tasks

> Governs the names of the tasks, the tasks that run the others, and what the program runs.

## General

### task-group-run-by-its-prefix → one-check-runs-every-tool · MUST

A task is named by its action first — `check:<what>`, `test:<what>`, `fix:<what>` — and the task named by the action alone runs every task of its prefix, in the order of their names save where they run at once, never a list kept by hand. The check task is the unit's whole gate: its group, then the specs, then the mutation gate on the lines a change touches, each where the unit has it. An action run only by the check or by hand has no task named by the action alone, and a task that is only part of another, or a helper of one, is named outside every prefix.

| Why |
|---|
| a task added under an action's prefix then runs with the others with no edit to the task that runs them; one task proves the unit, with the program or without it; and a part or a helper never runs twice or on its own by accident. |

### unit-run-through-its-action-tasks → one-check-runs-every-tool · MUST

The runner gives the program the commands that run a unit's `check`, `test` and `fix` tasks, so `constitution run` runs the same tasks in every unit.

| Why |
|---|
| one command checks every unit of the repository, whatever runner each uses, and what it runs is the unit's own tasks, which a person runs the same way. |
