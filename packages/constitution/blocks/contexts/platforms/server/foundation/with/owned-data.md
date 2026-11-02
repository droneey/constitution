# Owned data

> Governs the connections a server's copies open to the store it owns.

## General

### store-connections-bounded-across-copies · SHOULD

The connections a server's copies may open to a store it owns stay below what the store accepts. They count its pool's size times the most copies its host runs, a release's overlap included, with its one-off processes beside them.

| Why |
|---|
| a host that adds copies under load multiplies every pool, and the store refuses the connection that crosses its limit on whichever copy asks. |
