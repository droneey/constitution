# Formats

> Governs a shared format: its schema, what is written in it, the spec that checks it, and how it changes.

## Vocabulary

A **shared format** is a format that another program or the program's user reads or writes, or that the program stores for its later releases to read, such as an API's contract, a message, a webhook, a file its user writes or a store's schema.

## Schema

### shared-format-declared-in-a-schema · MUST

Where its form has a schema language, every shared format is declared in a schema a machine reads.

| Why |
|---|
| a format declared in prose is read differently by each reader — a published language. |

### schema-kept-in-the-repository · MUST

Every schema of a shared format is kept in the repository, or generated from code kept there.

| Why |
|---|
| a schema kept elsewhere cannot change in the change that changes its format, so the two drift, and the specs check the writer against a schema its readers no longer have. |

## What is written

### format-written-with-only-its-declared-fields · MUST

Where a shared format has a schema, everything the program writes in it carries only the fields the schema declares. It never writes one of its objects serialised whole. Exempt: what the program writes to a store only its own releases read.

| Why |
|---|
| an object sent whole sends every field later added to it to every reader. |

### enumeration-in-a-shared-format-declared-extensible · MUST

Every enumeration the program writes into a shared format is declared extensible. Its readers are told to expect values they do not know. Exempt: a set complete by its meaning, such as a sort direction or the days of the week, which stays closed, and an enumeration in a store only the program's own releases read.

| Why |
|---|
| a reader that fails on a new value breaks on the first one its writer adds, though nothing it relies on changed. |

## Proof

### written-format-checked-against-its-schema · MUST

Where a shared format has a schema, everything the program writes in it is checked by a spec against that schema.

| Why |
|---|
| a writer that drifts from its schema is found by a reader in production instead of by a spec. |

## Changes

### format-changed-in-steps · MUST

Every shared format changes in steps. Each change keeps the old data and the running readers working: the readers learn the new form beside the old one first, the writers and the stored data move to it next, and the old form is removed last. Exempt: a store whose readers all stop while its format changes, such as an embedded database its one program migrates as it opens it.

| Why |
|---|
| data written before a change and readers deployed before it outlive the change, and a format switched in one step breaks them — the expand–contract pattern. |

### format-change-checked-against-its-last-release · MUST

Every change to a shared format is checked against its last release. The check fails on every change that breaks a reader or a writer of that release, such as a removal, a rename, a narrowed type or a new required part. Exempt: a store whose readers all stop while its format changes, and the removal of an old form its readers and writers have all left or were told would go on a date now past.

| Why |
|---|
| a breaking change reads like any other in review, so one that no check compares with what was released ships and breaks every reader and writer still on the old form. |
