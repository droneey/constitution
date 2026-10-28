# Scripts

> Governs how Bun runs the scripts of one action.

## General

### script-group-run-by-its-prefix → task-group-run-by-its-prefix · MUST

The script named by an action runs its prefix through Bun's pattern: the checks and the fixes one after another, `bun run --sequential 'check:*'`, and the specs at once, `bun run --parallel 'test:*'`; the check names, in the same call, the specs' and the mutation gate's scripts the unit has.

| Why |
|---|
| Bun lists the scripts a pattern matches, so the group needs no list of its own, and specs that share nothing run in parallel; a name the unit lacks, or a pattern that matches nothing, fails the call. |
