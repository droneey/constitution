# Scripts

> Governs how Bun runs the scripts of one action.

## General

### script-group-run-by-its-prefix → task-group-run-by-its-prefix · MUST

Every group task's script runs its group through Bun's pattern on its prefix. It runs the checks and the fixes one after another, `bun run --sequential 'check:*'`, and the specs at once, `bun run --parallel 'test:*'`.

#### Why

A group written as a list of its own misses the script added after it, and specs that share nothing wait for each other when run in turn; a pattern that matches nothing fails the call.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check": "bun run check:types && bun run check:lint",
    "test": "bun run test:unit && bun run test:integration"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check": "bun run --sequential 'check:*' test",
    "test": "bun run --parallel 'test:*'"
  }
}
```

### check-script-names-the-whole-gate-in-one-call → check-task-is-the-units-whole-gate · MUST

The check script's `bun run --sequential` call names the specs' and the mutation gate's scripts the unit has, after its group's pattern.

#### Why

A script left out of the check's call is skipped by every run of the check, so a unit passes its gate with its specs failing; a name the unit lacks fails the call.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check": "bun run --sequential 'check:*'",
    "test": "bun run --parallel 'test:*'",
    "mutate": "stryker run"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check": "bun run --sequential 'check:*' test mutate",
    "test": "bun run --parallel 'test:*'",
    "mutate": "stryker run"
  }
}
```
