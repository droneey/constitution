# Bun with distribution

> Which tool publishes the units a Bun repository distributes.

### units-published-by-npm → version-published-with-provenance · MUST
npm publishes a distributed unit, never `bun publish`.

| Why | Tags |
|---|---|
| `bun publish` has neither provenance nor trusted publishing, which npm has, so only npm can publish by the run's identity. | [] |
