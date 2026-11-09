# Tasks

> Governs the names of the tasks, the tasks that run the others, and what `constitution run` runs.

## Vocabulary

An action is one of the three kinds of task `constitution run` runs in every unit: check, test and fix. A **group task** is a task named by its action alone, such as `check`. Its prefix is its name and a colon, such as `check:`, and its group is the tasks named under that prefix.

## General

### task-group-run-by-its-prefix → one-check-runs-every-tool · MUST

Every group task runs every task of its prefix, never a list kept by hand. A prefix's tasks run in the order of their names. Exempt: the tasks of a prefix that run at once, which keep no order.

#### Why

A list kept by hand misses the next task added under its prefix, which then never runs — the open–closed principle.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check": "bun run check:types && bun run check:lint",
    "check:lint": "biome ci .",
    "check:types": "tsc --noEmit",
    "check:manifests": "syncpack lint"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check": "bun run --sequential 'check:*'",
    "check:lint": "biome ci .",
    "check:manifests": "syncpack lint",
    "check:types": "tsc --noEmit"
  }
}
```

### task-named-action-first → one-check-runs-every-tool · MUST

Every check, test or fix task that runs on its own is named by its action first, as `check:<what>`, `test:<what>` or `fix:<what>`.

#### Why

A task named otherwise, such as `lint-all`, falls under no prefix, so the group task of its action never runs it.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "lint": "biome ci .",
    "types:check": "tsc --noEmit",
    "lint-fix": "biome check --write ."
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check:lint": "biome ci .",
    "check:types": "tsc --noEmit",
    "fix:lint": "biome check --write ."
  }
}
```

### task-helper-named-outside-every-prefix → one-check-runs-every-tool · MUST

Every task that is only part of another, or a helper of one, is named outside every prefix.

#### Why

A part or a helper named under a prefix is run by its group as well as by the task it serves, so it runs twice, or on its own by accident.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check": "bun run --sequential 'check:*'",
    "check:routes-generate": "tsr generate",
    "check:types": "bun run check:routes-generate && tsc --noEmit"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check": "bun run --sequential 'check:*'",
    "check:types": "bun run routes-generate && tsc --noEmit",
    "routes-generate": "tsr generate"
  }
}
```

### check-task-is-the-units-whole-gate → one-check-runs-every-tool · MUST

The check task is the unit's whole gate. It runs its group, then the specs, then the mutation gate on the lines a change touches, each where the unit has it.

#### Why

A gate split over several tasks is run in part, and a unit passes by the half someone remembered to run, with `constitution` or without it.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check": "bun run --sequential 'check:*'",
    "mutate:branch": "bun --no-env-file node_modules/@droneey/constitution/tools/mutation-check/dist/main.js",
    "test": "bun test"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check": "bun run --sequential 'check:*' test mutate:branch",
    "mutate:branch": "bun --no-env-file node_modules/@droneey/constitution/tools/mutation-check/dist/main.js",
    "test": "bun test"
  }
}
```

### unit-run-through-its-action-tasks → one-check-runs-every-tool · MUST

Every unit's check, specs and fixes, where it has them, are its group tasks, `check`, `test` and `fix`. No other task runs a group of tasks by a pattern on their names.

#### Why

`constitution run` runs these three in every unit alike, through its runner, so a task that runs a group by a pattern, such as `mutate` over `mutate:*`, reads as one it runs, though nothing does; a command that ran each runner its own way would check a unit by other tasks than the ones its person runs, so the unit could pass one and fail the other; through the runner, one command checks every unit of the repository by the unit's own tasks.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check": "bun run --sequential 'check:*'",
    "ci": "bun run --sequential 'check:*' 'test:*'",
    "lint-all": "bun run --parallel 'check:lint*'"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check": "bun run --sequential 'check:*'",
    "fix": "bun run --sequential 'fix:*'",
    "test": "bun test"
  }
}
```
