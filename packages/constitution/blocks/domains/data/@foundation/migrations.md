# Migrations

> Governs the schema of a store the program owns: the file that declares it, how it changes, and how a schema migration runs and is proven.

## Vocabulary

A **schema migration** is one step of a store's schema, kept in the project's files and applied in its place in one order.

A **store schema file**, marked **`.schema`**{#store-schema-file}, is a file of the program's code that declares one part of a store's schema, such as a table or a model an object–relational mapper reads, and whose role word, as core's names chapter defines one, is `Schema`; a schema migration is none, and so is the schema of any other shared format, such as an API's or a message's.

## Schema files

### store-schema-file-carries-its-mark → role-word-ends-the-name · MUST

Every store schema file carries its role word: its name ends in its mark and the name of the type it declares in `Schema`, as `order.schema` and `OrderSchema` do.

| Why |
|---|
| a store schema file named off its mark is missed by the tool that finds the store's schema by its name, so the schema migration that tool generates drops what the file declares, and a type of the store's schema named as the thing of the domain it stores, such as `Order`, is taken for the domain's own type where both are imported. |

### schema-mark-marks-only-store-schema-files → word-has-one-concept · MUST

No file but a store schema file carries the store schema file's mark. Exempt: a document written in a schema language that declares another shared format, whose extension tells it apart from code.

| Why |
|---|
| code of another kind under the mark is read by the tool that finds the store's schema by its name, so the schema migration that tool generates adds to the store what it was never meant to hold. |

## Changes to the schema

### schema-changed-only-by-a-migration · MUST

Every change to the schema of a store the program owns is made by a schema migration. It is never made by hand, nor by a sync from the program's code at its start.

| Why |
|---|
| a change made by hand or by a sync exists in one store and in no history, so the next deployment environment differs and nobody can say how. |

### applied-migration-never-edited · MUST

No schema migration applied to a shared store is ever edited or removed. A correction is a new schema migration.

| Why |
|---|
| the stores that already ran it keep its old version, and the schema then differs by deployment environment with no schema migration to tell. |

### schema-migration-removes-only-what-no-running-release-reads → format-changed-in-steps · MUST

Every schema migration removes only what no running release reads. It drops, renames or changes the meaning of a part of the schema, such as a table, a column or a stored value, only once every release still running has stopped reading it, an older release during a rolling deploy included. Exempt: a store whose readers all stop while its schema migration runs, such as an embedded database its one program migrates as it opens it.

| Why |
|---|
| a schema migration applied before its release starts drops what the release still running beside it reads, so every request that older release serves fails until the deploy ends — the expand–contract pattern. |

## Running

### migration-applied-before-its-release · MUST

Every schema migration of a store several instances share is applied before the release that needs it starts.

| Why |
|---|
| a release that starts before its schema fails its first requests on columns or tables that are not there yet. |

### migration-applied-by-one-run · MUST

Every schema migration of a store several instances share is applied by one run, never by each instance as it boots.

| Why |
|---|
| an instance that applies schema migrations as it boots needs the right to alter the schema in its everyday credential, which then lets any flaw of the program alter it too, and its migration lands in the middle of a rolling deploy instead of in a step the deploy controls — least privilege. |

### migration-holds-no-long-lock · SHOULD

Every schema migration of a store in use holds no lock that stops the store's writes past a bound the project sets. Ways to meet it include a lock timeout, an index built without blocking writes where the engine can, and a backfill left to a run of its own in bounded batches.

| Why |
|---|
| a schema migration that waits for or holds a lock on a busy table stops every write behind it, and a backfill in the schema migration's transaction holds that lock for its whole length. |

## Proof

### migrations-proven-from-the-last-releases-schema → integration-spec-runs-the-real-engine · SHOULD

Every set of schema migrations is proven on the store's real engine, from the schema of the last release. A check applies them there.

| Why |
|---|
| a schema migration proven only on an empty store or another engine fails on the schema and the locks production has. |
