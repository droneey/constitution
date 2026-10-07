# Owned data

> Governs the check that proves the migrations.

## Checks

### migrations-applied-in-ci-from-the-last-release · SHOULD
A check applies the migrations to the store's real engine, starting from the schema of the last release.

| Why | Tags |
|---|---|
| a migration proven only on an empty store or another engine fails on the schema and the locks production has. | [data] |
