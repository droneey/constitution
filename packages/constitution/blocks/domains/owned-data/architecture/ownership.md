# Ownership

> Governs who reads and writes a feature's stored records.

## General

### feature-owns-its-stored-records · MUST

A feature owns its stored records. Its tables, collections and keys are read and written only by its own code at the edge — the adapters of its repositories and queries ports, the relay that hands on the events saved with its changes, the edge workers of a queue it keeps in its store, and the writer of a projection it keeps —, and another feature reaches them only through the owner's operations, composed in composition, never by a read of the owner's store, a join or a view over them. A projection's writer is the adapter of a port of the reaction's own, which belongs to neither side, called by a command's use case that reacts to the write side's events. A composition module owns only the records of its own aggregates, never a feature's.

| Why |
|---|
| a read of another feature's records couples the two through the store, where no import rule sees it, and the owner can no longer change its schema alone. |

### feature-records-in-a-namespace-of-their-own · MUST

Each feature's records live in a schema or namespace of their own. Where the store grants access by namespace, they are reached by a role granted that namespace alone.

| Why |
|---|
| records that share a namespace with another feature's are open to that feature's role, so a read of the store across features goes through unrefused, and a reader cannot tell from a record's name which feature owns it — least privilege. |
