# Bun with distribution

> How a Bun repository publishes the units it distributes.

## npm-publishes-in-the-release-workflow → publishing-by-workflow-identity
The release workflow publishes with `npm publish`, through the registry's trusted publishing and with provenance, never with `bun publish`.

| Why | Check | Tags |
|---|---|---|
| `bun publish` has neither provenance nor trusted publishing, and npm, run only in the release workflow, publishes the unit Bun installed and built. | review | [] |
