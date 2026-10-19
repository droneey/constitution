# Owned data

> Governs the connections a server's copies open to the store it owns.

## General

### store-connections-bounded-across-copies · SHOULD

The connections a server may open to a store it owns — its pool's size times the most copies its host runs, a release's overlap included, with its one-off processes beside them — stay below what the store accepts.

| Why | Tags |
|---|---|
| a host that adds copies under load multiplies every pool, and the store refuses the connection that crosses its limit on whichever copy asks. | [performance, errors] |
