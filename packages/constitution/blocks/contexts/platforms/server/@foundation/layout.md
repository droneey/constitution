# Layout

> Governs a server's tree: the entry file each kind of its processes starts from.

## Entries

### server-process-kind-started-from-its-own-entry-file · SHOULD

Each kind of process a server's artefact runs starts from an entry file of its own. Such kinds include the process that serves, a worker, a scheduler and a one-off process.

| Why |
|---|
| a kind of process with no entry file of its own is started by a flag or a branch inside another kind's start, so its host cannot start, scale or stop it alone, and its reader finds what it runs only by tracing that start — the twelve-factor app. |
