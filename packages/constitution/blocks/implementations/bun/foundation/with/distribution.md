# Distribution

> Governs the tool that publishes a package a Bun repository distributes.

## General

### units-published-by-npm → version-published-with-provenance · MUST

npm publishes a distributed unit, never `bun publish`.

| Why |
|---|
| `bun publish` has neither provenance nor trusted publishing, which npm has, so only npm can publish by the run's identity. |
