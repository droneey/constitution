# Distribution

> Governs the tool that publishes a package a Bun repository distributes.

## General

### units-published-by-npm → version-published-with-provenance · MUST

Every distributed package is published by `npm publish` from the tarball `bun pm pack` writes, never by `bun publish`.

| Why |
|---|
| `bun publish` has neither provenance nor trusted publishing, so a package it publishes carries no proof of the run that built it; only `npm publish` publishes by the run's identity, and `bun pm pack` writes each `workspace:` specifier of the manifest as the version range it stands for, which `npm pack` ships verbatim. |
