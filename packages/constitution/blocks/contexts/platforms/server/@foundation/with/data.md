# Data

> Governs the connections a server's instances open to a store it owns.

## General

### store-connections-bounded-across-instances · MUST

All the connections a server's instances may open to a store it owns stay below what the store accepts. They count its pool's size times the most instances its host runs, a release's overlap included, with its one-off processes beside them.

| Why |
|---|
| a host that adds instances under load multiplies every pool, and the store refuses the connection that crosses its limit on whichever instance asks. |
