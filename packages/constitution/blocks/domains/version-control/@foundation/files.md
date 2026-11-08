# Files

> Governs which files repository history keeps, and how, a moved file's among them, and the form of a link from one file to another.

## Vocabulary

A clone's **working copy** is the files it has checked out, with the changes not yet committed.

The **ignore list** names the files version control leaves untracked.

The **working-notes folder** is **`local/`**{#working-notes}.

A **local environment file** is a file of one machine's environment variables that the project's tools load, its secrets often among them.

A binary file is large above **`10 MB`**{#large-file-size}.

## General

### text-stored-with-one-line-ending · MUST

All text is stored in the repository history with one line ending, whatever the platform of whoever commits it.

| Why |
|---|
| mixed line endings fill diffs with lines nobody changed and break scripts on the other platform. |

## What repository history keeps

### large-files-outside-history · SHOULD

Every binary file larger than `10 MB` lives outside the repository history, which keeps only a reference to it.

| Why |
|---|
| a large file in the repository history is downloaded by every clone for ever, even after it is deleted. |

### generated-files-not-committed · MUST

No generated file is committed. Exempt: a file the code imports that a check of a fresh clone needs before any step runs, and a copy kept for readers outside the code, such as a schema an editor fetches by its address.

| Why |
|---|
| a committed build output drifts from its source and fills every diff, while a fresh clone's type check needs the generated files the code imports, and a reader outside the code finds a copy only where it is committed. |

### ignored-file-never-tracked · MUST

No file the ignore list covers is tracked.

| Why |
|---|
| version control goes on tracking a file it already tracks whatever the ignore list says, so an ignore rule alone leaves in the repository history what is already there. |

### machine-local-files-ignored · MUST

Every file local to one machine is on the ignore list. Such files include the local environment file and a person's overrides of the project's tools.

| Why |
|---|
| a file of one machine that is committed replaces every other machine's setup with its own at their next pull. |

### environment-example-holds-only-placeholders · MUST

Every committed example of the local environment file holds only placeholders, never a real value.

| Why |
|---|
| a real value in the example becomes every machine's value, and a real secret there has leaked. |

### working-notes-stay-out-of-history · MUST

Every working note, such as a plan, lives in the working-notes folder, never in the repository history. Exempt: a record of a decision, which `DECISIONS.md` holds.

| Why |
|---|
| working notes are true for a day, and committed they mislead every later reader. |

## Moves

### change-moves-a-file-never-rewrites-it · SHOULD

Every change that moves a file moves it, never deletes it and writes it anew.

| Why |
|---|
| a file deleted and written anew can lose or alter its content unseen, and the repository history no longer follows it across the move, so its past stops at the change that moved it. |

## Links

### repository-link-is-a-path · SHOULD

Every link between two files of the repository is a path, never an address on the service that hosts it. The path is relative to the linking file or to the repository's root. Exempt: a link in a file that a registry or another service shows apart from the repository, such as a package's readme, which is an address.

| Why |
|---|
| a path works on every branch, fork, clone and mirror, while an address points at one branch on the service that hosts the repository, and goes stale when the branch or the service moves. |
