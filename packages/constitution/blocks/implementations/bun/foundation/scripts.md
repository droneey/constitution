# Scripts

> Governs how Bun runs the scripts of one action.

## General

### script-group-run-by-its-prefix → task-group-run-by-its-prefix · MUST

A script group runs through Bun's pattern on its prefix, and the check adds the unit's specs and mutation gate in the same call. The script named by an action runs the checks and the fixes one after another, `bun run --sequential 'check:*'`, and the specs at once, `bun run --parallel 'test:*'`; the check names, in the same call, the specs' and the mutation gate's scripts the unit has.

| Why |
|---|
| a group written as a list of its own misses the script added after it, and specs that share nothing wait for each other when run in turn; a name the unit lacks, or a pattern that matches nothing, fails the call. |
