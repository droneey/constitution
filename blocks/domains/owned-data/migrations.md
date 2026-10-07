# Migrations

> Governs how the schema of owned data changes, and how a migration runs.

## Changes to the schema

### schema-changed-only-by-a-migration · MUST
The schema of a store the program owns changes only by a migration kept in the repository and applied in order, never by hand and never by a sync from the program's models at start.

| Why | Tags |
|---|---|
| a change made by hand or by a sync exists in one store and in no history, so the next environment differs and nobody can say how. | [data] |

### applied-migration-never-edited · MUST
A migration applied to any shared store is never edited or removed; a correction is a new migration.

| Why | Tags |
|---|---|
| the stores that already ran it keep its old version, and the schema then differs by environment with no migration to tell. | [data] |

## Compatibility

### migration-compatible-with-the-running-release · MUST
A migration keeps the schema usable by the release that runs while it is applied: a breaking change is split into expand, migrate and contract, each shipped apart.

| Why | Tags |
|---|---|
| during a deployment the old release and the new one run against one schema, and a migration that breaks the old one fails every request it serves. | [data] |

## Running

### migration-applied-once-before-its-release · MUST
A migration is applied once, by one run before the release that needs it starts, never by each instance as it boots.

| Why | Tags |
|---|---|
| instances booting together race to apply one migration, and a release that starts before its schema fails its first requests. | [data] |

### migration-holds-no-long-lock · SHOULD
A migration on a store in use sets a lock timeout, builds an index without blocking writes where the engine can, and leaves a backfill to a run of its own in bounded batches.

| Why | Tags |
|---|---|
| a migration that waits for or holds a lock on a busy table stops every write behind it, and a backfill in the migration's transaction holds that lock for its whole length. | [data, performance] |
