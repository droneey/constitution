# Files

> Governs which files history keeps, and how.

## General

### text-stored-with-one-line-ending · MUST

Text is stored in the history with one line ending, whatever the platform of the person who commits it.

| Why |
|---|
| mixed line endings fill diffs with lines nobody changed and break scripts on the other platform. |

### working-copy-clean-at-hand-back · SHOULD

The working copy is clean when work is handed back. It holds no stray change and no scratch file outside the ignored folders.

| Why |
|---|
| a stray file is committed by the next person who stages everything, or confuses whoever picks the work up. |

## What history keeps

### large-files-outside-history · SHOULD

A large binary file lives outside the history, which keeps only a reference to it.

| Why |
|---|
| a large file in the history is downloaded by every clone for ever, even after it is deleted. |

### generated-files-not-committed · SHOULD

A generated file is not committed. Two kinds are committed: a file the code imports that a check of a fresh clone needs before any step runs, and a copy kept for readers outside the code, such as a schema an editor fetches by its address.

| Why |
|---|
| a committed build output drifts from its source and fills every diff, while a fresh clone's type check needs the generated files the code imports, and a reader outside the code finds a copy only where it is committed. |

### ignored-file-never-tracked · SHOULD

A file the ignore list covers is not tracked.

| Why |
|---|
| version control goes on tracking a file it already tracks whatever the ignore list says, so an ignore rule alone leaves in the history what is already there. |

### machine-local-files-ignored · SHOULD

Files local to one machine are ignored by version control. They include the local environment file and a person's overrides of the project's tools.

| Why |
|---|
| a file of one machine that is committed replaces every other machine's setup with its own at their next pull. |

### environment-example-holds-only-placeholders · SHOULD

The committed example of the local environment file holds a placeholder for every value, never a real one.

| Why |
|---|
| a real value in the example becomes every machine's value, and a real secret there has leaked. |
