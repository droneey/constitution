# Tasks

> Governs how Poe runs the tasks of one action.

## General

### task-group-walks-poes-own-list → task-group-run-by-its-prefix · MUST

The task named by an action is a shell task that walks the names `poe _list_tasks` gives, sorted, and runs each of its prefix; where none is, it runs nothing.

| Why |
|---|
| Poe runs no pattern of its own, and its list of the declared tasks is the one place their names are kept. |
